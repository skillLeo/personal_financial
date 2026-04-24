<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\DeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeviceController extends Controller
{
    use ApiResponse;

    public function register(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'device_token' => ['required', 'string', 'max:500'],
            'platform'     => ['required', 'in:android,ios,web'],
            'device_name'  => ['nullable', 'string', 'max:100'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        DeviceToken::updateOrCreate(
            ['user_id' => $request->user()->id, 'device_token' => $request->device_token],
            ['platform' => $request->platform, 'device_name' => $request->device_name, 'last_used_at' => now()]
        );

        return $this->success(null, 'Device token registered.');
    }

    public function unregister(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'device_token' => ['required', 'string'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        DeviceToken::where('user_id', $request->user()->id)
            ->where('device_token', $request->device_token)
            ->delete();

        return $this->success(null, 'Device token removed.');
    }
}
