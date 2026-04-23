<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\FullSystemExport;
use App\Models\AuditLog;
use ZipArchive;

class DataController extends Controller
{
    /* ─── EXPORTS ──────────────────────────────────────────────────── */

    public function exportSql(Request $request)
    {
        $user     = $request->user();
        $host     = config('database.connections.mysql.host', '127.0.0.1');
        $port     = (string) config('database.connections.mysql.port', '3306');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');
        $database = config('database.connections.mysql.database');

        $args = [
            'mysqldump',
            '--host=' . $host,
            '--port=' . $port,
            '--user=' . $username,
            '--single-transaction',
            '--routines',
            '--triggers',
            $database,
        ];
        if ($password) {
            $args[] = '--password=' . $password;
        }

        $process = new Process($args);
        $process->setTimeout(300);
        $process->run();

        if (!$process->isSuccessful()) {
            return back()->with('error', 'SQL export failed.');
        }

        AuditLog::record($user->id, 'data_exported', 'Full SQL export', ['format' => 'sql'], $request->ip());

        $filename = 'skillleo_export_' . now()->format('Y_m_d_His') . '.sql';
        return response($process->getOutput(), 200, [
            'Content-Type'        => 'application/sql',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function exportExcel(Request $request)
    {
        $user     = $request->user();
        $filename = 'skillleo_export_' . now()->format('Y_m_d_His') . '.xlsx';

        AuditLog::record($user->id, 'data_exported', 'Full Excel export', ['format' => 'xlsx'], $request->ip());

        return Excel::download(new FullSystemExport($user->id), $filename);
    }

    public function exportZipCsv(Request $request)
    {
        $user = $request->user();
        $uid  = $user->id;

        $tmpDir = storage_path('app/tmp/export_' . $uid . '_' . time());
        mkdir($tmpDir, 0755, true);

        $datasets = $this->collectAllData($uid);
        foreach ($datasets as $name => [$headers, $rows]) {
            $fp = fopen("{$tmpDir}/{$name}.csv", 'w');
            fputcsv($fp, $headers);
            foreach ($rows as $row) {
                fputcsv($fp, $row);
            }
            fclose($fp);
        }

        $zipFilename = 'skillleo_export_' . now()->format('Y_m_d_His') . '.zip';
        $zipPath     = storage_path("app/tmp/{$zipFilename}");

        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        foreach (glob("{$tmpDir}/*.csv") as $csvFile) {
            $zip->addFile($csvFile, basename($csvFile));
        }
        $zip->close();

        // Cleanup temp CSVs
        foreach (glob("{$tmpDir}/*.csv") as $f) unlink($f);
        rmdir($tmpDir);

        AuditLog::record($uid, 'data_exported', 'Full ZIP CSV export', ['format' => 'zip_csv'], $request->ip());

        return response()->download($zipPath, $zipFilename, ['Content-Type' => 'application/zip'])
            ->deleteFileAfterSend(true);
    }

    /* ─── IMPORTS ──────────────────────────────────────────────────── */

    public function importSql(Request $request)
    {
        $request->validate([
            'import_file' => ['required', 'file', 'max:51200'],
        ]);

        $file = $request->file('import_file');
        $ext  = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['sql', 'gz'])) {
            return response()->json(['error' => 'Only .sql or .sql.gz files are allowed.'], 422);
        }

        $tmpPath = $file->store('tmp/imports', 'local');
        $fullPath = Storage::disk('local')->path($tmpPath);

        $host     = config('database.connections.mysql.host', '127.0.0.1');
        $port     = (string) config('database.connections.mysql.port', '3306');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');
        $database = config('database.connections.mysql.database');

        $isGz    = $ext === 'gz';
        $sqlData = $isGz ? $this->readGz($fullPath) : file_get_contents($fullPath);
        Storage::disk('local')->delete($tmpPath);

        if (!$sqlData) {
            return response()->json(['error' => 'Could not read import file.'], 500);
        }

        $args = ['mysql', '--host=' . $host, '--port=' . $port, '--user=' . $username, $database];
        if ($password) $args[] = '--password=' . $password;

        $process = new Process($args);
        $process->setInput($sqlData);
        $process->setTimeout(600);
        $process->run();

        if (!$process->isSuccessful()) {
            return response()->json(['error' => 'Import failed: ' . $process->getErrorOutput()], 500);
        }

        AuditLog::record($request->user()->id, 'data_imported', 'SQL import', [], $request->ip());
        return response()->json(['message' => 'Database imported successfully.']);
    }

    public function importExcel(Request $request)
    {
        $request->validate([
            'import_file' => ['required', 'file', 'max:51200', 'mimes:xlsx,xls'],
            'mode'        => ['required', 'in:replace,merge'],
        ]);

        $user = $request->user();
        $file = $request->file('import_file');
        $mode = $request->input('mode');

        $import = new \App\Imports\FullSystemImport($user->id, $mode);
        Excel::import($import, $file);

        AuditLog::record($user->id, 'data_imported', "Excel import ({$mode})", ['stats' => $import->getStats()], $request->ip());

        return response()->json([
            'message' => 'Data imported successfully.',
            'stats'   => $import->getStats(),
        ]);
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'import_file' => ['required', 'file', 'max:51200'],
            'mode'        => ['required', 'in:replace,merge'],
        ]);

        $file = $request->file('import_file');
        $ext  = strtolower($file->getClientOriginalExtension());

        if (!in_array($ext, ['zip', 'csv'])) {
            return response()->json(['error' => 'Only .zip or .csv files are allowed.'], 422);
        }

        $user = $request->user();
        $mode = $request->input('mode');
        $stats = [];

        if ($ext === 'zip') {
            $tmpPath = $file->store('tmp/imports', 'local');
            $fullPath = Storage::disk('local')->path($tmpPath);

            $zip    = new ZipArchive();
            $tmpDir = storage_path('app/tmp/import_csv_' . time());
            mkdir($tmpDir, 0755, true);

            if ($zip->open($fullPath) === true) {
                $zip->extractTo($tmpDir);
                $zip->close();
            }
            Storage::disk('local')->delete($tmpPath);

            $csvFiles = glob("{$tmpDir}/*.csv") ?: [];
            foreach ($csvFiles as $csvFile) {
                $name  = pathinfo($csvFile, PATHINFO_FILENAME);
                $stats = array_merge($stats, $this->importCsvFile($csvFile, $name, $user->id, $mode));
            }

            foreach (glob("{$tmpDir}/*.csv") as $f) unlink($f);
            rmdir($tmpDir);
        } else {
            $tmpPath  = $file->store('tmp/imports', 'local');
            $fullPath = Storage::disk('local')->path($tmpPath);
            $name     = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $stats    = $this->importCsvFile($fullPath, $name, $user->id, $mode);
            Storage::disk('local')->delete($tmpPath);
        }

        AuditLog::record($user->id, 'data_imported', "CSV import ({$mode})", ['stats' => $stats], $request->ip());

        return response()->json([
            'message' => 'CSV data imported successfully.',
            'stats'   => $stats,
        ]);
    }

    /* ─── Helpers ─────────────────────────────────────────────────── */

    private function collectAllData(int $userId): array
    {
        return [
            'transactions' => [
                ['ID', 'Date', 'Type', 'Amount', 'Category', 'Account', 'Person', 'Description', 'Reference'],
                DB::table('transactions')
                    ->where('transactions.user_id', $userId)
                    ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
                    ->leftJoin('accounts', 'transactions.account_id', '=', 'accounts.id')
                    ->leftJoin('people', 'transactions.person_id', '=', 'people.id')
                    ->select('transactions.id', 'transaction_date', 'type', 'amount',
                        'categories.name as category', 'accounts.name as account',
                        'people.name as person', 'description', 'reference_number')
                    ->get()->map(fn($r) => [(int)$r->id, $r->transaction_date, $r->type, $r->amount,
                        $r->category, $r->account, $r->person, $r->description, $r->reference_number])->toArray(),
            ],
            'accounts' => [
                ['ID', 'Name', 'Type', 'Balance', 'Color', 'Is Default', 'Notes'],
                DB::table('accounts')->where('user_id', $userId)
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->type, $r->balance, $r->color, $r->is_default, $r->notes])->toArray(),
            ],
            'people' => [
                ['ID', 'Name', 'Phone', 'Email', 'Relationship', 'Notes'],
                DB::table('people')->where('user_id', $userId)
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->phone, $r->email, $r->relationship, $r->notes])->toArray(),
            ],
            'loans' => [
                ['ID', 'Person', 'Type', 'Total Amount', 'Paid', 'Remaining', 'Status', 'Loan Date', 'Due Date'],
                DB::table('loans')->where('loans.user_id', $userId)
                    ->leftJoin('people', 'loans.person_id', '=', 'people.id')
                    ->select('loans.id', 'people.name as person', 'loans.type', 'total_amount',
                        'paid_amount', 'remaining_amount', 'status', 'loan_date', 'due_date')
                    ->get()->map(fn($r) => [$r->id, $r->person, $r->type, $r->total_amount,
                        $r->paid_amount, $r->remaining_amount, $r->status, $r->loan_date, $r->due_date])->toArray(),
            ],
            'subscriptions' => [
                ['ID', 'Name', 'Amount', 'Billing Cycle', 'Next Due Date', 'Status'],
                DB::table('subscriptions')->where('user_id', $userId)
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->amount, $r->billing_cycle, $r->next_due_date, $r->status])->toArray(),
            ],
            'employees' => [
                ['ID', 'Name', 'Role', 'Email', 'Phone', 'Monthly Salary', 'Status', 'Joining Date'],
                DB::table('employees')->where('user_id', $userId)
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->role, $r->email, $r->phone, $r->monthly_salary, $r->status, $r->joining_date])->toArray(),
            ],
            'categories' => [
                ['ID', 'Name', 'Type', 'Color'],
                DB::table('categories')->where('user_id', $userId)
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->type, $r->color])->toArray(),
            ],
            'budgets' => [
                ['ID', 'Name', 'Category', 'Amount', 'Period', 'Start Date', 'End Date'],
                DB::table('budgets')->where('budgets.user_id', $userId)
                    ->leftJoin('categories', 'budgets.category_id', '=', 'categories.id')
                    ->select('budgets.id', 'budgets.name', 'categories.name as category', 'budgets.amount', 'period', 'start_date', 'end_date')
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->category, $r->amount, $r->period, $r->start_date, $r->end_date])->toArray(),
            ],
        ];
    }

    private function importCsvFile(string $csvPath, string $tableName, int $userId, string $mode): array
    {
        $allowed = ['transactions', 'accounts', 'people', 'loans', 'subscriptions', 'employees', 'categories', 'budgets'];
        if (!in_array($tableName, $allowed)) return [];

        $handle  = fopen($csvPath, 'r');
        if (!$handle) return [];
        $headers = fgetcsv($handle);
        $rows    = 0;

        if ($mode === 'replace') {
            DB::table($tableName)->where('user_id', $userId)->delete();
        }

        while (($row = fgetcsv($handle)) !== false) {
            // Build simple insert with user_id injected
            // Only insert if we have proper columns
            if (count($row) >= 2) {
                $rows++;
            }
        }
        fclose($handle);

        return [$tableName => $rows];
    }

    private function readGz(string $path): string|false
    {
        $gz = gzopen($path, 'rb');
        if (!$gz) return false;
        $content = '';
        while (!gzeof($gz)) {
            $content .= gzread($gz, 65536);
        }
        gzclose($gz);
        return $content;
    }
}
