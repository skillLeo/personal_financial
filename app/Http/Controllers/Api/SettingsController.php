<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\AiSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    use ApiResponse;

    public function show(Request $request): JsonResponse
    {
        $user   = $request->user();
        $aiSett = AiSetting::where('user_id', $user->id)->first();
        return $this->success([
            'name'          => $user->name,
            'email'         => $user->email,
            'business_name' => $user->business_name,
            'phone'         => $user->phone,
            'currency'      => $user->currency ?? 'PKR',
            'timezone'      => $user->timezone,
            'ai'            => $aiSett ? [
                'provider'   => $aiSett->provider,
                'model'      => $aiSett->model,
                'is_enabled' => (bool) $aiSett->is_enabled,
                'has_key'    => !empty($aiSett->api_key),
            ] : null,
        ]);
    }

    public function getAiSettings(Request $request): JsonResponse
    {
        $ai = AiSetting::where('user_id', $request->user()->id)->first();
        if (!$ai) return $this->success(null, 'No AI settings configured.');
        return $this->success([
            'provider'        => $ai->provider,
            'model'           => $ai->model,
            'custom_endpoint' => $ai->custom_endpoint,
            'is_enabled'      => (bool) $ai->is_enabled,
            'has_api_key'     => !empty($ai->api_key),
        ]);
    }

    public function saveAiSettings(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'provider'        => ['required', 'in:openai,anthropic,custom'],
            'api_key'         => ['nullable', 'string'],
            'model'           => ['nullable', 'string', 'max:100'],
            'custom_endpoint' => ['nullable', 'string', 'url'],
            'is_enabled'      => ['boolean'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $data = array_filter($request->only(['provider', 'model', 'custom_endpoint']), fn($v) => $v !== null);
        $data['is_enabled'] = $request->boolean('is_enabled', true);
        if ($request->filled('api_key')) $data['api_key'] = $request->api_key;

        AiSetting::updateOrCreate(['user_id' => $request->user()->id], $data);
        return $this->success(null, 'AI settings saved.');
    }
}
