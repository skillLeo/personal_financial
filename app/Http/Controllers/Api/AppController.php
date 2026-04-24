<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppController extends Controller
{
    use ApiResponse;

    public function version(Request $request): JsonResponse
    {
        return $this->success([
            'latest_version'  => '1.0.0',
            'minimum_version' => '1.0.0',
            'force_update'    => false,
            'update_url'      => [
                'android' => 'https://play.google.com/store/apps/details?id=com.skillleo.financial',
                'ios'     => 'https://apps.apple.com/app/skillleo/id0000000000',
            ],
            'maintenance_mode'   => false,
            'maintenance_message'=> null,
            'api_version'        => 'v1',
            'server_time'        => now()->toIso8601String(),
        ]);
    }
}
