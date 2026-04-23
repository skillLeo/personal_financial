<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use App\Models\AiSetting;

class AIInsightsController extends Controller
{
    public function index(Request $request)
    {
        $user      = $request->user();
        $aiSetting = AiSetting::where('user_id', $user->id)->first();
        $isSetup   = $aiSetting && $aiSetting->is_enabled && $aiSetting->getDecryptedApiKey();

        $insights = null;
        if ($isSetup) {
            $cacheKey = "ai_insights_{$user->id}";
            $insights = Cache::get($cacheKey);

            if (!$insights) {
                $context  = $this->buildFinancialContext($user->id);
                $insights = $this->generateInsights($aiSetting, $context);
                if ($insights) {
                    Cache::put($cacheKey, $insights, now()->addHours(6));
                }
            }
        }

        return Inertia::render('AIInsights/Index', [
            'isSetup'  => $isSetup,
            'insights' => $insights,
            'currency' => $user->currency ?? 'PKR',
        ]);
    }

    public function refresh(Request $request)
    {
        $user = $request->user();
        Cache::forget("ai_insights_{$user->id}");

        $aiSetting = AiSetting::where('user_id', $user->id)->first();
        if (!$aiSetting || !$aiSetting->is_enabled) {
            return response()->json(['error' => 'AI not configured.'], 422);
        }

        $context  = $this->buildFinancialContext($user->id);
        $insights = $this->generateInsights($aiSetting, $context);

        if ($insights) {
            Cache::put("ai_insights_{$user->id}", $insights, now()->addHours(6));
        }

        return response()->json(['insights' => $insights, 'message' => 'Insights refreshed.']);
    }

    public function ask(Request $request)
    {
        $request->validate(['question' => ['required', 'string', 'max:500']]);

        $user      = $request->user();
        $aiSetting = AiSetting::where('user_id', $user->id)->first();

        if (!$aiSetting || !$aiSetting->is_enabled) {
            return response()->json(['error' => 'AI not configured.'], 422);
        }

        $context  = $this->buildFinancialContext($user->id);
        $question = $request->input('question');
        $answer   = $this->askAI($aiSetting, $context, $question);

        return response()->json(['answer' => $answer ?? 'Sorry, I could not get a response. Please try again.']);
    }

    public function testConnection(Request $request)
    {
        $user      = $request->user();
        $aiSetting = AiSetting::where('user_id', $user->id)->first();

        if (!$aiSetting || !$aiSetting->getDecryptedApiKey()) {
            return response()->json(['error' => 'No API key saved.'], 422);
        }

        $result = $this->ping($aiSetting);
        return response()->json($result);
    }

    public function saveSettings(Request $request)
    {
        $data = $request->validate([
            'provider'        => ['required', 'in:openai,anthropic,custom'],
            'api_key'         => ['nullable', 'string', 'max:500'],
            'model'           => ['required', 'string', 'max:100'],
            'custom_endpoint' => ['nullable', 'url', 'max:500'],
            'is_enabled'      => ['boolean'],
        ]);

        $setting = AiSetting::firstOrNew(['user_id' => $request->user()->id]);
        $setting->provider        = $data['provider'];
        $setting->model           = $data['model'];
        $setting->custom_endpoint = $data['custom_endpoint'] ?? null;
        $setting->is_enabled      = $data['is_enabled'] ?? false;

        if (!empty($data['api_key'])) {
            $setting->api_key = $data['api_key'];
        }
        $setting->save();

        Cache::forget("ai_insights_{$request->user()->id}");

        return response()->json(['message' => 'AI settings saved.']);
    }

    /* ─── AI helpers ──────────────────────────────────────────────── */

    private function buildFinancialContext(int $userId): array
    {
        $now     = now();
        $thisMonthStart = $now->copy()->startOfMonth()->toDateString();
        $thisMonthEnd   = $now->copy()->endOfMonth()->toDateString();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth()->toDateString();
        $lastMonthEnd   = $now->copy()->subMonth()->endOfMonth()->toDateString();

        $thisMonthIncome   = (float) DB::table('transactions')->where('user_id', $userId)->where('type', 'income')->whereBetween('transaction_date', [$thisMonthStart, $thisMonthEnd])->sum('amount');
        $thisMonthExpense  = (float) DB::table('transactions')->where('user_id', $userId)->where('type', 'expense')->whereBetween('transaction_date', [$thisMonthStart, $thisMonthEnd])->sum('amount');
        $lastMonthIncome   = (float) DB::table('transactions')->where('user_id', $userId)->where('type', 'income')->whereBetween('transaction_date', [$lastMonthStart, $lastMonthEnd])->sum('amount');
        $lastMonthExpense  = (float) DB::table('transactions')->where('user_id', $userId)->where('type', 'expense')->whereBetween('transaction_date', [$lastMonthStart, $lastMonthEnd])->sum('amount');

        $topCategories = DB::table('transactions')
            ->where('transactions.user_id', $userId)
            ->where('transactions.type', 'expense')
            ->whereBetween('transaction_date', [$thisMonthStart, $thisMonthEnd])
            ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('SUM(transactions.amount) as total'))
            ->groupBy('categories.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $overdueLoans = DB::table('loans')
            ->where('user_id', $userId)
            ->whereIn('status', ['pending', 'partial'])
            ->whereDate('due_date', '<', now()->toDateString())
            ->get();

        $budgets = DB::table('budgets')
            ->where('budgets.user_id', $userId)
            ->whereDate('start_date', '<=', $now->toDateString())
            ->whereDate('end_date', '>=', $now->toDateString())
            ->leftJoin('categories', 'budgets.category_id', '=', 'categories.id')
            ->select('budgets.*', 'categories.name as category_name')
            ->get()
            ->map(function ($b) use ($userId) {
                $spent = (float) DB::table('transactions')
                    ->where('user_id', $userId)
                    ->where('category_id', $b->category_id)
                    ->where('type', 'expense')
                    ->whereBetween('transaction_date', [$b->start_date, $b->end_date])
                    ->sum('amount');
                return [
                    'name'       => $b->name,
                    'category'   => $b->category_name,
                    'limit'      => $b->amount,
                    'spent'      => $spent,
                    'percentage' => $b->amount > 0 ? round(($spent / $b->amount) * 100, 1) : 0,
                ];
            });

        $subscriptionTotal = (float) DB::table('subscriptions')
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->sum('amount');

        return compact(
            'thisMonthIncome', 'thisMonthExpense',
            'lastMonthIncome', 'lastMonthExpense',
            'topCategories', 'overdueLoans', 'budgets', 'subscriptionTotal'
        );
    }

    private function generateInsights(AiSetting $setting, array $ctx): ?array
    {
        $systemPrompt = $this->buildSystemPrompt($ctx);

        $cards = [
            'health_score'          => 'Give me a financial health score from 0-100 based on this data. Respond with JSON only: {"score": number, "label": "Good/Needs Attention/Critical", "summary": "one sentence"}',
            'top_spending'          => 'Analyze the top spending category. Is it concerning? Respond with JSON: {"title": "Highest Expense Category", "category": "name", "amount": number, "insight": "2-3 sentences", "level": "warning/danger/normal"}',
            'income_trend'          => 'Analyze income trend (this month vs last month). Respond with JSON: {"trend": "growing/stable/declining", "percentage_change": number, "insight": "2-3 sentences"}',
            'unnecessary_expenses'  => 'Identify discretionary expenses and estimate 20% savings. Respond with JSON: {"categories": ["name"], "potential_savings": number, "insight": "2-3 sentences"}',
            'loan_situation'        => 'Summarize debt situation and debt-to-income ratio. Respond with JSON: {"overdue_count": number, "total_overdue": number, "debt_to_income": "string", "insight": "2-3 sentences", "is_urgent": boolean}',
            'budget_performance'    => 'Evaluate budget performance. Respond with JSON: {"over_budget": [], "near_limit": [], "on_track": [], "insight": "2-3 sentences"}',
            'savings_opportunity'   => 'Calculate realistic savings opportunity. Respond with JSON: {"potential_savings": number, "top_cut": "category name", "insight": "2-3 sentences"}',
        ];

        $results = [];
        foreach ($cards as $key => $prompt) {
            $response = $this->callAI($setting, $systemPrompt, $prompt);
            if ($response) {
                $decoded = json_decode($response, true);
                $results[$key] = $decoded ?: ['raw' => $response];
            }
        }

        return empty($results) ? null : $results;
    }

    private function askAI(AiSetting $setting, array $ctx, string $question): ?string
    {
        $systemPrompt = $this->buildSystemPrompt($ctx);
        return $this->callAI($setting, $systemPrompt, $question, false);
    }

    private function buildSystemPrompt(array $ctx): string
    {
        $topCats = collect($ctx['topCategories'])->map(fn($c) => "{$c->name}: {$c->total}")->implode(', ');
        $budgetSummary = collect($ctx['budgets'])->map(fn($b) => "{$b['name']}: {$b['spent']}/{$b['limit']} ({$b['percentage']}%)")->implode(', ');

        return "You are a professional financial advisor analyzing a user's real financial data.
This month: Income={$ctx['thisMonthIncome']}, Expenses={$ctx['thisMonthExpense']}, Net=" . ($ctx['thisMonthIncome'] - $ctx['thisMonthExpense']) . "
Last month: Income={$ctx['lastMonthIncome']}, Expenses={$ctx['lastMonthExpense']}
Top 5 expense categories: {$topCats}
Overdue loans: " . count($ctx['overdueLoans']) . " loans
Active budgets: {$budgetSummary}
Monthly subscriptions total: {$ctx['subscriptionTotal']}
Currency: PKR (Pakistani Rupees)
Provide specific, data-driven advice in 2-3 concise sentences. Be direct and actionable. Always respond in JSON format unless asked a conversational question.";
    }

    private function callAI(AiSetting $setting, string $system, string $user, bool $jsonMode = true): ?string
    {
        $apiKey  = $setting->getDecryptedApiKey();
        if (!$apiKey) return null;

        try {
            if ($setting->provider === 'anthropic') {
                $response = Http::withHeaders([
                    'x-api-key'         => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type'      => 'application/json',
                ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
                    'model'      => $setting->model,
                    'max_tokens' => 1024,
                    'system'     => $system,
                    'messages'   => [['role' => 'user', 'content' => $user]],
                ]);

                return $response->json('content.0.text');
            } else {
                $endpoint = $setting->provider === 'custom'
                    ? $setting->custom_endpoint
                    : 'https://api.openai.com/v1/chat/completions';

                $body = [
                    'model'    => $setting->model,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $user],
                    ],
                    'max_tokens' => 1024,
                ];
                if ($jsonMode) {
                    $body['response_format'] = ['type' => 'json_object'];
                }

                $response = Http::withToken($apiKey)->timeout(30)->post($endpoint, $body);
                return $response->json('choices.0.message.content');
            }
        } catch (\Exception $e) {
            return null;
        }
    }

    private function ping(AiSetting $setting): array
    {
        $apiKey = $setting->getDecryptedApiKey();
        if (!$apiKey) return ['success' => false, 'message' => 'No API key found.'];

        try {
            if ($setting->provider === 'anthropic') {
                $response = Http::withHeaders([
                    'x-api-key'         => $apiKey,
                    'anthropic-version' => '2023-06-01',
                ])->timeout(10)->post('https://api.anthropic.com/v1/messages', [
                    'model'      => $setting->model,
                    'max_tokens' => 10,
                    'messages'   => [['role' => 'user', 'content' => 'Hi']],
                ]);
                return $response->successful()
                    ? ['success' => true, 'message' => 'Connected to Anthropic Claude successfully.']
                    : ['success' => false, 'message' => $response->json('error.message') ?? 'Connection failed.'];
            } else {
                $endpoint = $setting->provider === 'custom'
                    ? $setting->custom_endpoint
                    : 'https://api.openai.com/v1/chat/completions';

                $response = Http::withToken($apiKey)->timeout(10)->post($endpoint, [
                    'model'      => $setting->model,
                    'messages'   => [['role' => 'user', 'content' => 'Hi']],
                    'max_tokens' => 10,
                ]);
                return $response->successful()
                    ? ['success' => true, 'message' => 'Connected to ' . ucfirst($setting->provider) . ' successfully.']
                    : ['success' => false, 'message' => $response->json('error.message') ?? 'Connection failed.'];
            }
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Network error: ' . $e->getMessage()];
        }
    }
}
