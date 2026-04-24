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
    /* ─── Page render (returns shell immediately) ─────────────────── */

    public function index(Request $request)
    {
        $user      = $request->user();
        $aiSetting = AiSetting::where('user_id', $user->id)->first();
        $isSetup   = $aiSetting && $aiSetting->is_enabled && $aiSetting->getDecryptedApiKey();

        $cacheKey   = "ai_insights_v2_{$user->id}";
        $isCached   = $isSetup && Cache::has($cacheKey);
        $cachedAt   = $isSetup ? Cache::get("ai_insights_cached_at_{$user->id}") : null;

        return Inertia::render('AIInsights/Index', [
            'isSetup'   => $isSetup,
            'isCached'  => $isCached,
            'cachedAt'  => $cachedAt,
            'currency'  => $user->currency ?? 'PKR',
        ]);
    }

    /* ─── Async card endpoints ────────────────────────────────────── */

    public function cardData(Request $request, string $card)
    {
        $allowed = ['health', 'controllable', 'risks', 'income', 'budgets', 'plan'];
        if (!in_array($card, $allowed)) {
            return response()->json(['error' => 'Unknown card.'], 404);
        }

        $user      = $request->user();
        $aiSetting = AiSetting::where('user_id', $user->id)->first();

        if (!$aiSetting || !$aiSetting->is_enabled || !$aiSetting->getDecryptedApiKey()) {
            return response()->json(['error' => 'AI not configured.'], 422);
        }

        $cacheKey = "ai_card_{$user->id}_{$card}";
        $cached   = Cache::get($cacheKey);
        if ($cached) {
            return response()->json(['data' => $cached, 'cached' => true]);
        }

        // Build full context and generate all cards at once if none cached
        $masterCacheKey = "ai_insights_v2_{$user->id}";
        $allInsights    = Cache::get($masterCacheKey);

        if (!$allInsights) {
            $ctx         = $this->buildDeepFinancialContext($user->id);
            $allInsights = $this->generateAllInsights($aiSetting, $ctx);

            if ($allInsights) {
                Cache::put($masterCacheKey, $allInsights, now()->addHours(6));
                Cache::put("ai_insights_cached_at_{$user->id}", now()->toIso8601String(), now()->addHours(6));
                foreach ($allowed as $c) {
                    if (isset($allInsights[$c])) {
                        Cache::put("ai_card_{$user->id}_{$c}", $allInsights[$c], now()->addHours(6));
                    }
                }
            }
        }

        $data = $allInsights[$card] ?? null;
        return response()->json([
            'data'   => $data,
            'cached' => false,
        ]);
    }

    /* ─── Refresh all ────────────────────────────────────────────── */

    public function refresh(Request $request)
    {
        $user = $request->user();
        $this->clearCache($user->id);

        $aiSetting = AiSetting::where('user_id', $user->id)->first();
        if (!$aiSetting || !$aiSetting->is_enabled || !$aiSetting->getDecryptedApiKey()) {
            return response()->json(['error' => 'AI not configured.'], 422);
        }

        $ctx         = $this->buildDeepFinancialContext($user->id);
        $allInsights = $this->generateAllInsights($aiSetting, $ctx);

        if ($allInsights) {
            $allowed = ['health', 'controllable', 'risks', 'income', 'budgets', 'plan'];
            Cache::put("ai_insights_v2_{$user->id}", $allInsights, now()->addHours(6));
            Cache::put("ai_insights_cached_at_{$user->id}", now()->toIso8601String(), now()->addHours(6));
            foreach ($allowed as $c) {
                if (isset($allInsights[$c])) {
                    Cache::put("ai_card_{$user->id}_{$c}", $allInsights[$c], now()->addHours(6));
                }
            }
        }

        return response()->json(['message' => 'Insights refreshed.', 'success' => (bool)$allInsights]);
    }

    /* ─── Ask AI chat ────────────────────────────────────────────── */

    public function ask(Request $request)
    {
        $request->validate(['question' => ['required', 'string', 'max:500']]);

        $user      = $request->user();
        $aiSetting = AiSetting::where('user_id', $user->id)->first();

        if (!$aiSetting || !$aiSetting->is_enabled || !$aiSetting->getDecryptedApiKey()) {
            return response()->json(['error' => 'AI not configured.'], 422);
        }

        $ctx      = $this->buildDeepFinancialContext($user->id);
        $question = $request->input('question');
        $answer   = $this->askAI($aiSetting, $ctx, $question);

        return response()->json(['answer' => $answer ?? 'Sorry, could not get a response. Please try again.']);
    }

    /* ─── Settings ───────────────────────────────────────────────── */

    public function testConnection(Request $request)
    {
        $user      = $request->user();
        $aiSetting = AiSetting::where('user_id', $user->id)->first();

        if (!$aiSetting || !$aiSetting->getDecryptedApiKey()) {
            return response()->json(['error' => 'No API key saved.'], 422);
        }

        return response()->json($this->ping($aiSetting));
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

        $this->clearCache($request->user()->id);

        return response()->json(['message' => 'AI settings saved.']);
    }

    /* ─── Deep financial context builder ─────────────────────────── */

    private function buildDeepFinancialContext(int $userId): array
    {
        $now = now();

        $periods = [];
        for ($i = 0; $i < 3; $i++) {
            $start = $now->copy()->subMonths($i)->startOfMonth()->toDateString();
            $end   = $now->copy()->subMonths($i)->endOfMonth()->toDateString();
            $label = $now->copy()->subMonths($i)->format('M Y');

            $income  = (float) DB::table('transactions')->where('user_id', $userId)->where('type', 'income')->whereBetween('transaction_date', [$start, $end])->sum('amount');
            $expense = (float) DB::table('transactions')->where('user_id', $userId)->where('type', 'expense')->whereBetween('transaction_date', [$start, $end])->sum('amount');

            $incomeByCategory = DB::table('transactions')
                ->where('transactions.user_id', $userId)->where('transactions.type', 'income')
                ->whereBetween('transaction_date', [$start, $end])
                ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
                ->select('categories.name as category', DB::raw('SUM(transactions.amount) as total'), DB::raw('COUNT(*) as count'))
                ->groupBy('categories.name')->orderByDesc('total')->get()->toArray();

            $expenseByCategory = DB::table('transactions')
                ->where('transactions.user_id', $userId)->where('transactions.type', 'expense')
                ->whereBetween('transaction_date', [$start, $end])
                ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
                ->select('categories.name as category', DB::raw('SUM(transactions.amount) as total'), DB::raw('COUNT(*) as count'))
                ->groupBy('categories.name')->orderByDesc('total')->get()->toArray();

            $periods[$label] = [
                'start'               => $start,
                'end'                 => $end,
                'income'              => $income,
                'expense'             => $expense,
                'net'                 => $income - $expense,
                'income_by_category'  => $incomeByCategory,
                'expense_by_category' => $expenseByCategory,
            ];
        }

        $thisMonthStart = $now->copy()->startOfMonth()->toDateString();
        $thisMonthEnd   = $now->copy()->endOfMonth()->toDateString();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth()->toDateString();
        $lastMonthEnd   = $now->copy()->subMonth()->endOfMonth()->toDateString();

        // Spending changes between this and last month
        $thisExpCats = collect(array_values($periods)[0]['expense_by_category'])->keyBy('category');
        $lastExpCats = collect(array_values($periods)[1]['expense_by_category'])->keyBy('category');

        $increased = [];
        $decreased = [];
        foreach ($thisExpCats as $cat => $row) {
            $lastTotal = $lastExpCats[$cat]->total ?? 0;
            if ($lastTotal > 0) {
                $change = (($row->total - $lastTotal) / $lastTotal) * 100;
                if ($change > 20)  $increased[] = ['category' => $cat, 'this' => $row->total, 'last' => $lastTotal, 'pct' => round($change, 1)];
                if ($change < -20) $decreased[] = ['category' => $cat, 'this' => $row->total, 'last' => $lastTotal, 'pct' => round(abs($change), 1)];
            }
        }

        // Top 5 most frequent expense categories this month
        $frequentCats = DB::table('transactions')
            ->where('transactions.user_id', $userId)->where('transactions.type', 'expense')
            ->whereBetween('transaction_date', [$thisMonthStart, $thisMonthEnd])
            ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name as category', DB::raw('COUNT(*) as count'), DB::raw('SUM(transactions.amount) as total'))
            ->groupBy('categories.name')->orderByDesc('count')->limit(5)->get()->toArray();

        // Active subscriptions
        $subscriptions = DB::table('subscriptions')
            ->where('user_id', $userId)->where('status', 'active')
            ->select('name', 'amount', 'billing_cycle', 'next_due_date')
            ->orderByDesc('amount')->get()->toArray();

        // Pending loans
        $loans = DB::table('loans')
            ->where('user_id', $userId)->whereIn('status', ['pending', 'partial'])
            ->select('total_amount', 'remaining_amount', 'due_date', 'type', 'status')
            ->get()->map(function ($l) use ($now) {
                return [
                    'total'         => $l->total_amount,
                    'remaining'     => $l->remaining_amount,
                    'due_date'      => $l->due_date,
                    'type'          => $l->type,
                    'is_overdue'    => $l->due_date && $l->due_date < $now->toDateString(),
                ];
            })->toArray();

        // Active budgets with current spending
        $budgets = DB::table('budgets')
            ->where('budgets.user_id', $userId)
            ->whereDate('start_date', '<=', $now->toDateString())
            ->whereDate('end_date', '>=', $now->toDateString())
            ->leftJoin('categories', 'budgets.category_id', '=', 'categories.id')
            ->select('budgets.*', 'categories.name as category_name')
            ->get()->map(function ($b) use ($userId) {
                $spent = (float) DB::table('transactions')
                    ->where('user_id', $userId)->where('category_id', $b->category_id)
                    ->where('type', 'expense')
                    ->whereBetween('transaction_date', [$b->start_date, $b->end_date])
                    ->sum('amount');
                $pct = $b->amount > 0 ? round(($spent / $b->amount) * 100, 1) : 0;
                return [
                    'name'       => $b->name,
                    'category'   => $b->category_name,
                    'limit'      => (float) $b->amount,
                    'spent'      => $spent,
                    'percentage' => $pct,
                ];
            })->toArray();

        // Largest single transaction this month
        $largestTxn = DB::table('transactions')
            ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)->where('transactions.type', 'expense')
            ->whereBetween('transactions.transaction_date', [$thisMonthStart, $thisMonthEnd])
            ->select('transactions.amount', 'transactions.description', 'categories.name as category')
            ->orderByDesc('transactions.amount')->first();

        // Average daily spending this month
        $daysPassed = max(1, $now->day);
        $totalExpThisMonth = (float) (array_values($periods)[0]['expense'] ?? 0);
        $avgDaily = round($totalExpThisMonth / $daysPassed, 2);

        // Day of month with highest spending
        $highestDay = DB::table('transactions')
            ->where('transactions.user_id', $userId)->where('transactions.type', 'expense')
            ->whereBetween('transactions.transaction_date', [$thisMonthStart, $thisMonthEnd])
            ->select(DB::raw('DAY(transactions.transaction_date) as day'), DB::raw('SUM(transactions.amount) as total'))
            ->groupBy(DB::raw('DAY(transactions.transaction_date)'))->orderByDesc('total')->first();

        // 6-month income history for sparkline
        $incomeHistory = [];
        for ($i = 5; $i >= 0; $i--) {
            $mStart = $now->copy()->subMonths($i)->startOfMonth()->toDateString();
            $mEnd   = $now->copy()->subMonths($i)->endOfMonth()->toDateString();
            $incomeHistory[] = [
                'month'  => $now->copy()->subMonths($i)->format('M'),
                'amount' => (float) DB::table('transactions')->where('user_id', $userId)->where('type', 'income')->whereBetween('transaction_date', [$mStart, $mEnd])->sum('amount'),
            ];
        }

        return [
            'periods'        => $periods,
            'increased_cats' => $increased,
            'decreased_cats' => $decreased,
            'frequent_cats'  => $frequentCats,
            'subscriptions'  => $subscriptions,
            'loans'          => $loans,
            'budgets'        => $budgets,
            'largest_txn'    => $largestTxn ? (array)$largestTxn : null,
            'avg_daily_spend'=> $avgDaily,
            'highest_spend_day' => $highestDay ? $highestDay->day : null,
            'income_history' => $incomeHistory,
        ];
    }

    /* ─── Single comprehensive AI call ───────────────────────────── */

    private function generateAllInsights(AiSetting $setting, array $ctx): ?array
    {
        $systemPrompt = $this->buildDeepSystemPrompt($ctx);

        $userPrompt = <<<PROMPT
Analyze the financial data above and return a single JSON object with exactly these keys:

health: {"score": int 0-100, "label": "Excellent|Good|Needs Attention|Critical", "summary": "2 sentences max"}

controllable: {"categories": [{"name": string, "monthly_amount": number, "recommended_max": number, "status": "danger|warning|ok", "verdict": string}], "total_potential_saving": number, "top_3_actions": [string]}

risks: [{"severity": "critical|warning|info", "signal": string, "action_label": string, "action_url": string}]

income: {"trend": "growing|stable|declining", "percentage_change": number, "current_month": number, "last_month": number, "insight": string, "history": [{"month": string, "amount": number}]}

budgets: [{"name": string, "category": string, "limit": number, "spent": number, "percentage": number, "status": "exceeded|danger|warning|ok"}]

plan: {"actions": [{"rank": int, "title": string, "description": string, "impact_pkr": number}], "total_30_day_saving": int}

Use actual category names and real rupee amounts from the data. Be specific and direct. Return only valid JSON.
PROMPT;

        $response = $this->callAI($setting, $systemPrompt, $userPrompt, true, 3000);
        if (!$response) return null;

        // Strip markdown code fences if present
        $clean = preg_replace('/^```json\s*/i', '', trim($response));
        $clean = preg_replace('/\s*```$/', '', $clean);

        $decoded = json_decode($clean, true);
        if (!$decoded) return null;

        // Merge AI income history with our real DB history
        if (isset($decoded['income'])) {
            $decoded['income']['history'] = $ctx['income_history'];
        }

        return $decoded;
    }

    /* ─── Deep system prompt ─────────────────────────────────────── */

    private function buildDeepSystemPrompt(array $ctx): string
    {
        $periodLines = '';
        foreach ($ctx['periods'] as $label => $p) {
            $expCats = collect($p['expense_by_category'])->map(fn($c) => "  {$c->category}: PKR " . number_format($c->total))->implode("\n");
            $incCats = collect($p['income_by_category'])->map(fn($c) => "  {$c->category}: PKR " . number_format($c->total))->implode("\n");
            $periodLines .= "
{$label}:
  Income: PKR " . number_format($p['income']) . " | Expenses: PKR " . number_format($p['expense']) . " | Net: PKR " . number_format($p['net']) . "
  Income breakdown:\n{$incCats}
  Expense breakdown:\n{$expCats}\n";
        }

        $increased = collect($ctx['increased_cats'])->map(fn($c) => "  {$c['category']}: +{$c['pct']}% (PKR " . number_format($c['last']) . " → PKR " . number_format($c['this']) . ")")->implode("\n");
        $decreased = collect($ctx['decreased_cats'])->map(fn($c) => "  {$c['category']}: -{$c['pct']}% (PKR " . number_format($c['last']) . " → PKR " . number_format($c['this']) . ")")->implode("\n");

        $subs = collect($ctx['subscriptions'])->map(fn($s) => "  {$s->name}: PKR " . number_format($s->amount) . "/{$s->billing_cycle}, next due: {$s->next_due_date}")->implode("\n");

        $loans = collect($ctx['loans'])->map(fn($l) => "  Remaining: PKR " . number_format($l['remaining']) . ", due: {$l['due_date']}, overdue: " . ($l['is_overdue'] ? 'YES' : 'no'))->implode("\n");

        $budgets = collect($ctx['budgets'])->map(fn($b) => "  {$b['category']} — spent PKR " . number_format($b['spent']) . " of PKR " . number_format($b['limit']) . " ({$b['percentage']}%)")->implode("\n");

        $largest = $ctx['largest_txn'] ? "PKR " . number_format($ctx['largest_txn']['amount']) . " — {$ctx['largest_txn']['category']} — {$ctx['largest_txn']['description']}" : 'None';

        return "You are a professional CFO assistant analyzing a business owner's personal financial data in Pakistan (currency: PKR).

=== FINANCIAL DATA ===
{$periodLines}

Categories with >20% spending increase vs last month:
{$increased}

Categories with >20% spending decrease vs last month:
{$decreased}

Top frequent expense categories this month:
" . collect($ctx['frequent_cats'])->map(fn($c) => "  {$c->category}: {$c->count} transactions, PKR " . number_format($c->total))->implode("\n") . "

Active subscriptions:
{$subs}

Active loans:
{$loans}

Active budgets:
{$budgets}

Largest single transaction this month: {$largest}
Average daily spending this month: PKR " . number_format($ctx['avg_daily_spend']) . "
Highest spending day of month: day {$ctx['highest_spend_day']}

Always use real category names and actual rupee amounts from the data. Never give generic advice. Be direct and specific.";
    }

    /* ─── Ask AI ─────────────────────────────────────────────────── */

    private function askAI(AiSetting $setting, array $ctx, string $question): ?string
    {
        $system = $this->buildDeepSystemPrompt($ctx) . "\n\nAnswer the user's question with specific data-driven insights. Reference real amounts and categories from the data. Be concise and actionable.";
        return $this->callAI($setting, $system, $question, false, 800);
    }

    /* ─── AI HTTP call ───────────────────────────────────────────── */

    private function callAI(AiSetting $setting, string $system, string $user, bool $jsonMode = true, int $maxTokens = 2048): ?string
    {
        $apiKey = $setting->getDecryptedApiKey();
        if (!$apiKey) return null;

        try {
            if ($setting->provider === 'anthropic') {
                $response = Http::withHeaders([
                    'x-api-key'         => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type'      => 'application/json',
                ])->timeout(60)->post('https://api.anthropic.com/v1/messages', [
                    'model'      => $setting->model,
                    'max_tokens' => $maxTokens,
                    'system'     => $system,
                    'messages'   => [['role' => 'user', 'content' => $user]],
                ]);

                return $response->json('content.0.text');
            } else {
                $endpoint = $setting->provider === 'custom'
                    ? $setting->custom_endpoint
                    : 'https://api.openai.com/v1/chat/completions';

                $body = [
                    'model'      => $setting->model,
                    'messages'   => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user',   'content' => $user],
                    ],
                    'max_tokens' => $maxTokens,
                ];
                if ($jsonMode) {
                    $body['response_format'] = ['type' => 'json_object'];
                }

                $response = Http::withToken($apiKey)->timeout(60)->post($endpoint, $body);
                return $response->json('choices.0.message.content');
            }
        } catch (\Exception $e) {
            return null;
        }
    }

    /* ─── Ping ───────────────────────────────────────────────────── */

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
                    'model'    => $setting->model,
                    'max_tokens' => 10,
                    'messages' => [['role' => 'user', 'content' => 'Hi']],
                ]);
                return $response->successful()
                    ? ['success' => true,  'message' => 'Connected to Anthropic Claude successfully.']
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
                    ? ['success' => true,  'message' => 'Connected to ' . ucfirst($setting->provider) . ' successfully.']
                    : ['success' => false, 'message' => $response->json('error.message') ?? 'Connection failed.'];
            }
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Network error: ' . $e->getMessage()];
        }
    }

    /* ─── Cache helper ───────────────────────────────────────────── */

    private function clearCache(int $userId): void
    {
        $cards = ['health', 'controllable', 'risks', 'income', 'budgets', 'plan'];
        Cache::forget("ai_insights_v2_{$userId}");
        Cache::forget("ai_insights_cached_at_{$userId}");
        Cache::forget("ai_insights_{$userId}"); // legacy key
        foreach ($cards as $c) {
            Cache::forget("ai_card_{$userId}_{$c}");
        }
    }
}
