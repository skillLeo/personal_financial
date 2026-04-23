<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use App\Models\BackupSetting;
use App\Models\AuditLog;

class CreateBackup extends Command
{
    protected $signature   = 'backup:create {--user= : User ID to backup for} {--type=scheduled : manual or scheduled}';
    protected $description = 'Create a compressed MySQL database backup';

    public function handle(): int
    {
        $host     = config('database.connections.mysql.host', '127.0.0.1');
        $port     = (string) config('database.connections.mysql.port', '3306');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');
        $database = config('database.connections.mysql.database');

        if (!$database) {
            $this->error('No database configured.');
            return self::FAILURE;
        }

        Storage::disk('local')->makeDirectory('backups');

        $timestamp = now()->format('Y_m_d_His');
        $type      = $this->option('type') === 'scheduled' ? 'auto' : 'manual';
        $filename  = "skillleo_backup_{$timestamp}_{$type}.sql.gz";
        $sqlPath   = storage_path("app/backups/{$filename}.tmp.sql");
        $gzPath    = storage_path("app/backups/{$filename}");

        // Step 1: mysqldump to plain SQL first (safer, avoids shell pipe)
        $dumpArgs = [
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
            $dumpArgs[] = '--password=' . $password;
        }

        $dumpProcess = new Process($dumpArgs);
        $dumpProcess->setTimeout(300);
        $dumpProcess->run();

        if (!$dumpProcess->isSuccessful() || empty(trim($dumpProcess->getOutput()))) {
            $this->error('mysqldump failed: ' . $dumpProcess->getErrorOutput());
            return self::FAILURE;
        }

        // Step 2: Write compressed output
        $gz = gzopen($gzPath, 'wb9');
        if (!$gz) {
            $this->error('Could not open gzip output file.');
            return self::FAILURE;
        }
        gzwrite($gz, $dumpProcess->getOutput());
        gzclose($gz);

        if (!file_exists($gzPath) || filesize($gzPath) === 0) {
            $this->error('Backup file empty after compression.');
            return self::FAILURE;
        }

        $userId = $this->option('user');
        if ($userId) {
            $settings   = BackupSetting::where('user_id', $userId)->first();
            $maxBackups = $settings?->max_backups ?? 30;
            $this->enforceBackupLimit($maxBackups);

            AuditLog::record(
                (int) $userId,
                'backup_created',
                "Backup created: {$filename}",
                ['filename' => $filename, 'type' => $type, 'size' => filesize($gzPath)]
            );
        }

        $this->info("Backup created: {$filename} (" . round(filesize($gzPath) / 1024 / 1024, 2) . ' MB)');
        return self::SUCCESS;
    }

    private function enforceBackupLimit(int $max): void
    {
        $backupDir = storage_path('app/backups');
        if (!is_dir($backupDir)) return;

        $files = glob("{$backupDir}/skillleo_backup_*.sql.gz") ?: [];
        if (count($files) <= $max) return;

        usort($files, fn($a, $b) => filemtime($a) - filemtime($b));
        $toDelete = array_slice($files, 0, count($files) - $max);
        foreach ($toDelete as $file) {
            @unlink($file);
        }
    }
}
