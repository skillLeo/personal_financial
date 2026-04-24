<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PeopleController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\AIInsightsController;
use App\Http\Controllers\Api\DraftController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\PreferencesController;
use App\Http\Controllers\Api\AppController;

Route::prefix('v1')->middleware('throttle:api')->group(function () {

    /* ── App Version (public) ──────────────────────────── */
    Route::get('/app/version', [AppController::class, 'version']);

    /* ── Public Auth ───────────────────────────────────── */
    Route::prefix('auth')->group(function () {
        Route::post('/register',             [AuthController::class, 'register']);
        Route::post('/login',                [AuthController::class, 'login']);
        Route::post('/verify-email',         [AuthController::class, 'verifyEmail'])
            ->middleware('throttle:otp-verify');
        Route::post('/resend-verification',  [AuthController::class, 'resendVerification'])
            ->middleware('throttle:otp-resend');
        Route::post('/forgot-password',      [AuthController::class, 'forgotPassword']);
        Route::post('/verify-reset-otp',     [AuthController::class, 'verifyResetOtp'])
            ->middleware('throttle:otp-verify');
        Route::post('/reset-password',       [AuthController::class, 'resetPassword']);
        Route::post('/google',               [AuthController::class, 'googleLogin']);

        /* Web Google OAuth (for browser flow) */
        Route::get('/google/redirect',  [\App\Http\Controllers\GoogleAuthController::class, 'redirect']);
        Route::get('/google/callback',  [\App\Http\Controllers\GoogleAuthController::class, 'callback']);
    });

    /* ── Authenticated ─────────────────────────────────── */
    Route::middleware(['auth:sanctum', 'email.verified'])->group(function () {

        /* Auth & Profile */
        Route::prefix('auth')->group(function () {
            Route::post('/logout',        [AuthController::class, 'logout']);
            Route::post('/logout-all',    [AuthController::class, 'logoutAll']);
            Route::get('/me',             [AuthController::class, 'me']);
            Route::put('/profile',        [AuthController::class, 'updateProfile']);
            Route::post('/profile/photo', [AuthController::class, 'updatePhoto']);
            Route::put('/password',       [AuthController::class, 'changePassword']);
        });

        /* Dashboard */
        Route::get('/dashboard', [DashboardController::class, 'summary']);

        /* Transactions */
        Route::prefix('transactions')->group(function () {
            Route::get('/',        [TransactionController::class, 'index']);
            Route::post('/',       [TransactionController::class, 'store']);
            Route::get('/{id}',    [TransactionController::class, 'show']);
            Route::put('/{id}',    [TransactionController::class, 'update']);
            Route::delete('/{id}', [TransactionController::class, 'destroy']);
        });

        /* Accounts */
        Route::prefix('accounts')->group(function () {
            Route::get('/',               [AccountController::class, 'index']);
            Route::post('/',              [AccountController::class, 'store']);
            Route::get('/{id}',           [AccountController::class, 'show']);
            Route::put('/{id}',           [AccountController::class, 'update']);
            Route::delete('/{id}',        [AccountController::class, 'destroy']);
            Route::get('/{id}/statement', [AccountController::class, 'statement']);
        });

        /* Categories */
        Route::prefix('categories')->group(function () {
            Route::get('/',        [CategoryController::class, 'index']);
            Route::post('/',       [CategoryController::class, 'store']);
            Route::put('/{id}',    [CategoryController::class, 'update']);
            Route::delete('/{id}', [CategoryController::class, 'destroy']);
        });

        /* People */
        Route::prefix('people')->group(function () {
            Route::get('/',             [PeopleController::class, 'index']);
            Route::post('/',            [PeopleController::class, 'store']);
            Route::get('/{id}',         [PeopleController::class, 'show']);
            Route::put('/{id}',         [PeopleController::class, 'update']);
            Route::delete('/{id}',      [PeopleController::class, 'destroy']);
            Route::get('/{id}/history', [PeopleController::class, 'history']);
        });

        /* Loans */
        Route::prefix('loans')->group(function () {
            Route::get('/',                [LoanController::class, 'index']);
            Route::post('/',               [LoanController::class, 'store']);
            Route::get('/{id}',            [LoanController::class, 'show']);
            Route::put('/{id}',            [LoanController::class, 'update']);
            Route::delete('/{id}',         [LoanController::class, 'destroy']);
            Route::post('/{id}/repayment', [LoanController::class, 'recordRepayment']);
        });

        /* Subscriptions */
        Route::prefix('subscriptions')->group(function () {
            Route::get('/',            [SubscriptionController::class, 'index']);
            Route::post('/',           [SubscriptionController::class, 'store']);
            Route::get('/{id}',        [SubscriptionController::class, 'show']);
            Route::put('/{id}',        [SubscriptionController::class, 'update']);
            Route::delete('/{id}',     [SubscriptionController::class, 'destroy']);
            Route::post('/{id}/pay',   [SubscriptionController::class, 'markPaid']);
            Route::post('/{id}/toggle',[SubscriptionController::class, 'toggleStatus']);
        });

        /* Employees */
        Route::prefix('employees')->group(function () {
            Route::get('/',                     [EmployeeController::class, 'index']);
            Route::post('/',                    [EmployeeController::class, 'store']);
            Route::get('/{id}',                 [EmployeeController::class, 'show']);
            Route::put('/{id}',                 [EmployeeController::class, 'update']);
            Route::delete('/{id}',              [EmployeeController::class, 'destroy']);
            Route::post('/{id}/pay-salary',     [EmployeeController::class, 'paySalary']);
            Route::get('/{id}/payment-history', [EmployeeController::class, 'paymentHistory']);
        });

        /* Budgets */
        Route::prefix('budgets')->group(function () {
            Route::get('/',        [BudgetController::class, 'index']);
            Route::post('/',       [BudgetController::class, 'store']);
            Route::get('/{id}',    [BudgetController::class, 'show']);
            Route::put('/{id}',    [BudgetController::class, 'update']);
            Route::delete('/{id}', [BudgetController::class, 'destroy']);
        });

        /* Reports */
        Route::prefix('reports')->group(function () {
            Route::get('/summary',           [ReportController::class, 'summary']);
            Route::get('/income-statement',  [ReportController::class, 'incomeStatement']);
            Route::get('/expense-breakdown', [ReportController::class, 'expenseBreakdown']);
            Route::get('/cash-flow',         [ReportController::class, 'cashFlow']);
        });

        /* Notifications */
        Route::prefix('notifications')->group(function () {
            Route::get('/',              [NotificationController::class, 'index']);
            Route::get('/unread-count',  [NotificationController::class, 'unreadCount']);
            Route::post('/{id}/read',    [NotificationController::class, 'markRead']);
            Route::post('/read-all',     [NotificationController::class, 'markAllRead']);
            Route::delete('/{id}',       [NotificationController::class, 'dismiss']);
        });

        /* Settings */
        Route::prefix('settings')->group(function () {
            Route::get('/',     [SettingsController::class, 'show']);
            Route::get('/ai',   [SettingsController::class, 'getAiSettings']);
            Route::post('/ai',  [SettingsController::class, 'saveAiSettings']);
        });

        /* AI Insights — stricter rate limit */
        Route::prefix('ai-insights')->middleware('throttle:ai-insights')->group(function () {
            Route::get('/status',      [AIInsightsController::class, 'status']);
            Route::get('/card/{card}', [AIInsightsController::class, 'card']);
            Route::post('/refresh',    [AIInsightsController::class, 'refresh']);
            Route::post('/ask',        [AIInsightsController::class, 'ask']);
        });

        /* Transaction Drafts */
        Route::prefix('drafts')->group(function () {
            Route::get('/',              [DraftController::class, 'index']);
            Route::get('/count',         [DraftController::class, 'count']);
            Route::post('/',             [DraftController::class, 'store']);
            Route::post('/{id}/convert', [DraftController::class, 'convert']);
            Route::post('/{id}/discard', [DraftController::class, 'discard']);
        });

        /* Backups */
        Route::prefix('backups')->group(function () {
            Route::get('/',              [BackupController::class, 'index']);
            Route::post('/',             [BackupController::class, 'create']);
            Route::delete('/{filename}', [BackupController::class, 'destroy']);
        });

        /* Device Tokens (Push Notifications) */
        Route::prefix('devices')->group(function () {
            Route::post('/register',   [DeviceController::class, 'register']);
            Route::post('/unregister', [DeviceController::class, 'unregister']);
        });

        /* User Preferences */
        Route::prefix('preferences')->group(function () {
            Route::get('/',  [PreferencesController::class, 'show']);
            Route::put('/',  [PreferencesController::class, 'update']);
        });
    });
});
