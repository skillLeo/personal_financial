<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use App\Models\BackupSetting;
use App\Models\AuditLog;

class BackupController extends Controller
{
    public function index(Request $request)
    {
        $backups  = $this->getBackupList();
        $settings = BackupSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['schedule' => 'manual', 'backup_time' => '02:00', 'max_backups' => 30]
        );

        return response()->json([
            'backups'  => $backups,
            'settings' => $settings,
        ]);
    }

    public function create(Request $request)
    {
        $user   = $request->user();
        $result = Artisan::call('backup:create', ['--user' => $user->id, '--type' => 'manual']);

        if ($result !== 0) {
            return response()->json(['error' => 'Backup failed. Check server logs.'], 500);
        }

        AuditLog::record($user->id, 'backup_created', 'Manual backup created', [], $request->ip());

        return response()->json([
            'message' => 'Backup created successfully.',
            'backups' => $this->getBackupList(),
        ]);
    }

    public function download(Request $request, string $filename)
    {
        $this->validateFilename($filename);
        $path = storage_path("app/backups/{$filename}");

        if (!file_exists($path)) {
            abort(404, 'Backup not found.');
        }

        AuditLog::record($request->user()->id, 'backup_downloaded', "Downloaded: {$filename}", [], $request->ip());
        return response()->download($path, $filename, ['Content-Type' => 'application/gzip']);
    }

    public function restore(Request $request, string $filename)
    {
        $this->validateFilename($filename);
        $path = storage_path("app/backups/{$filename}");

        if (!file_exists($path)) {
            return response()->json(['error' => 'Backup file not found.'], 404);
        }

        $error = $this->runRestore($path);
        if ($error) {
            return response()->json(['error' => $error], 500);
        }

        AuditLog::record($request->user()->id, 'backup_restored', "Restored from: {$filename}", ['filename' => $filename], $request->ip());
        return response()->json(['message' => 'Database restored successfully. Please refresh.']);
    }

    public function uploadRestore(Request $request)
    {
        $request->validate([
            'backup_file' => ['required', 'file', 'max:51200'],
        ]);

        $file = $request->file('backup_file');
        $ext  = $file->getClientOriginalExtension();
        $name = $file->getClientOriginalName();

        if (!in_array(strtolower($ext), ['gz', 'sql'], true) && !str_ends_with(strtolower($name), '.sql.gz')) {
            return response()->json(['error' => 'Only .sql or .sql.gz files are allowed.'], 422);
        }

        $tmpPath = $file->store('backups/tmp', 'local');
        $fullTmpPath = Storage::disk('local')->path($tmpPath);

        $error = $this->runRestore($fullTmpPath);
        Storage::disk('local')->delete($tmpPath);

        if ($error) {
            return response()->json(['error' => $error], 500);
        }

        AuditLog::record($request->user()->id, 'backup_restored', "Restored from upload: {$name}", [], $request->ip());
        return response()->json(['message' => 'Database restored from upload successfully.']);
    }

    public function destroy(Request $request, string $filename)
    {
        $this->validateFilename($filename);
        $path = storage_path("app/backups/{$filename}");

        if (file_exists($path)) {
            unlink($path);
        }

        AuditLog::record($request->user()->id, 'backup_deleted', "Deleted: {$filename}", [], $request->ip());
        return response()->json(['message' => 'Backup deleted.', 'backups' => $this->getBackupList()]);
    }

    public function saveSettings(Request $request)
    {
        $data = $request->validate([
            'schedule'    => ['required', 'in:manual,daily,weekly,monthly'],
            'backup_time' => ['required', 'regex:/^\d{2}:\d{2}$/'],
            'backup_day'  => ['nullable', 'integer', 'min:0', 'max:31'],
            'max_backups' => ['required', 'integer', 'min:1', 'max:365'],
        ]);

        BackupSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            $data
        );

        return response()->json(['message' => 'Backup settings saved.']);
    }

    /* ─── Helpers ─────────────────────────────────────────────────── */

    private function getBackupList(): array
    {
        $dir   = storage_path('app/backups');
        $files = glob("{$dir}/skillleo_backup_*.sql.gz") ?: [];

        usort($files, fn($a, $b) => filemtime($b) - filemtime($a));

        return array_map(function (string $path) {
            $name      = basename($path);
            $size      = filesize($path);
            $mtime     = filemtime($path);
            $isAuto    = str_contains($name, '_auto.');

            preg_match('/skillleo_backup_(\d{4})_(\d{2})_(\d{2})_(\d{6})/', $name, $m);
            $dateStr = isset($m[1])
                ? "{$m[1]}-{$m[2]}-{$m[3]} " . substr($m[4], 0, 2) . ':' . substr($m[4], 2, 2) . ':' . substr($m[4], 4, 2)
                : date('Y-m-d H:i:s', $mtime);

            return [
                'filename'  => $name,
                'date'      => $dateStr,
                'size_mb'   => round($size / 1024 / 1024, 2),
                'size_raw'  => $size,
                'type'      => $isAuto ? 'Scheduled' : 'Manual',
                'status'    => 'Complete',
            ];
        }, $files);
    }

    private function validateFilename(string $filename): void
    {
        if (!preg_match('/^skillleo_backup_[\w]+\.sql\.gz$/', $filename)) {
            abort(400, 'Invalid backup filename.');
        }
    }

    private function runRestore(string $filePath): ?string
    {
        $host     = config('database.connections.mysql.host', '127.0.0.1');
        $port     = (string) config('database.connections.mysql.port', '3306');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');
        $database = config('database.connections.mysql.database');

        // Decompress if .gz
        $isGz   = str_ends_with(strtolower($filePath), '.gz');
        $sqlData = $isGz ? $this->readGz($filePath) : file_get_contents($filePath);

        if (!$sqlData) {
            return 'Could not read backup file.';
        }

        // Import via mysql CLI
        $args = [
            'mysql',
            '--host=' . $host,
            '--port=' . $port,
            '--user=' . $username,
            $database,
        ];
        if ($password) {
            $args[] = '--password=' . $password;
        }

        $process = new Process($args);
        $process->setInput($sqlData);
        $process->setTimeout(600);
        $process->run();

        if (!$process->isSuccessful()) {
            return 'Restore failed: ' . $process->getErrorOutput();
        }

        return null;
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
