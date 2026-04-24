<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $backups = [];
        $files   = Storage::disk('local')->files('backups');
        foreach ($files as $file) {
            $name  = basename($file);
            if (!preg_match('/^backup_.*\.(sql|sql\.gz)$/', $name)) continue;
            $backups[] = [
                'filename'   => $name,
                'size'       => Storage::disk('local')->size($file),
                'created_at' => date('c', Storage::disk('local')->lastModified($file)),
                'download_url' => url("/api/v1/backups/{$name}/download"),
            ];
        }
        usort($backups, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
        return $this->success($backups);
    }

    public function create(Request $request): JsonResponse
    {
        // Delegate to web BackupController
        $webController = new \App\Http\Controllers\BackupController();
        $webResponse   = $webController->create($request);
        $body          = json_decode($webResponse->getContent(), true) ?? [];

        if (isset($body['success']) && !$body['success']) {
            return $this->error($body['message'] ?? 'Backup failed.', 500);
        }
        return $this->success(['message' => 'Backup created.'], 'Backup created successfully.');
    }

    public function destroy(Request $request, string $filename): JsonResponse
    {
        if (!preg_match('/^[a-zA-Z0-9_\-\.]+$/', $filename)) return $this->error('Invalid filename.', 422);

        $path = 'backups/' . $filename;
        if (!Storage::disk('local')->exists($path)) return $this->notFound('Backup not found.');

        Storage::disk('local')->delete($path);
        return $this->success(null, 'Backup deleted.');
    }
}
