<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Http\Controllers\AIInsightsController as WebAIInsightsController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class AIInsightsController extends Controller
{
    use ApiResponse;

    private WebAIInsightsController $web;

    public function __construct()
    {
        $this->web = new WebAIInsightsController();
    }

    public function status(Request $request): JsonResponse
    {
        $userId   = $request->user()->id;
        $isCached = Cache::has("ai_insights_v2_{$userId}");
        $cachedAt = Cache::get("ai_insights_cached_at_{$userId}");
        return $this->success([
            'is_cached'  => $isCached,
            'cached_at'  => $cachedAt,
            'cards'      => ['health', 'controllable', 'risks', 'income', 'budgets', 'plan'],
        ]);
    }

    public function card(Request $request, string $card): JsonResponse
    {
        $allowed = ['health', 'controllable', 'risks', 'income', 'budgets', 'plan'];
        if (!in_array($card, $allowed)) return $this->error('Invalid card name.', 422);

        // Delegate to web controller's cardData method, capture JSON response
        $webResponse = $this->web->cardData($request, $card);
        $body        = json_decode($webResponse->getContent(), true);

        if (!empty($body['error'])) return $this->error($body['error'], 503);
        return $this->success($body['data'] ?? null, 'Card loaded.');
    }

    public function refresh(Request $request): JsonResponse
    {
        $webResponse = $this->web->refresh($request);
        $body        = json_decode($webResponse->getContent(), true);
        if (!empty($body['error'])) return $this->error($body['error'], 503);
        return $this->success(null, 'Cache cleared. Fetch cards again to regenerate.');
    }

    public function ask(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), ['question' => ['required', 'string', 'min:3', 'max:500']]);
        if ($v->fails()) return $this->validationError($v);

        $webResponse = $this->web->ask($request);
        $body        = json_decode($webResponse->getContent(), true);
        if (!empty($body['error'])) return $this->error($body['error'], 503);
        return $this->success(['answer' => $body['answer'] ?? '']);
    }
}
