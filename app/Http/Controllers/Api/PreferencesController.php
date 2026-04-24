<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use DateTimeZone;

class PreferencesController extends Controller
{
    use ApiResponse;

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        return $this->success($this->fmt($user));
    }

    public function update(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'currency'       => ['sometimes', 'string', 'max:10'],
            'timezone'       => ['sometimes', 'string', 'max:50', 'timezone'],
            'dark_mode'      => ['sometimes', 'boolean'],
            'language'       => ['sometimes', 'string', 'max:10'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $user = $request->user();
        $user->update($request->only(['currency', 'timezone', 'dark_mode']));

        return $this->success($this->fmt($user->fresh()), 'Preferences updated.');
    }

    private function fmt($user): array
    {
        return [
            'currency'  => $user->currency ?? 'PKR',
            'timezone'  => $user->timezone ?? 'Asia/Karachi',
            'dark_mode' => (bool) $user->dark_mode,
            'timezones' => DateTimeZone::listIdentifiers(),
            'currencies' => ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'CAD', 'AUD', 'INR', 'BDT'],
        ];
    }
}
