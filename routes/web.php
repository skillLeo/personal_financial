<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\AIInsightsController;
use App\Http\Controllers\TransactionDraftController;
use App\Http\Controllers\AdminController;

/* ── Guest routes ────────────────────────────────────────── */
Route::middleware('guest')->group(function () {
    Route::get('/login',    [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login',   [AuthController::class, 'login'])->name('login.post');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register',[AuthController::class, 'register'])->name('register.post')
        ->middleware('throttle:register');

    /* ── Google OAuth ────────────────────────────────────── */
    Route::get('/auth/google',          [GoogleAuthController::class, 'redirect'])->name('auth.google');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

    /* ── Forgot Password ─────────────────────────────────── */
    Route::get('/forgot-password',      [AuthController::class, 'showForgotPassword'])->name('password.forgot');
    Route::post('/forgot-password',     [AuthController::class, 'sendForgotOtp'])->name('password.forgot.send');
    Route::get('/reset-password/verify',[AuthController::class, 'showVerifyResetOtp'])->name('password.verify-otp.show');
    Route::post('/reset-password/verify',[AuthController::class, 'verifyResetOtp'])->name('password.verify-otp');
    Route::get('/reset-password',       [AuthController::class, 'showResetPassword'])->name('password.reset.show');
    Route::post('/reset-password',      [AuthController::class, 'resetPassword'])->name('password.reset');
});

/* ── Email verification (accessible while logged in OR out) ─ */
Route::get('/verify-email',    [AuthController::class, 'showVerifyEmail'])->name('verify-email.show');
Route::post('/verify-email',   [AuthController::class, 'verifyEmail'])->name('verify-email');
Route::post('/verify-email/resend', [AuthController::class, 'resendVerification'])
    ->name('verify-email.resend')
    ->middleware('throttle:otp-resend');

/* ── Auth ────────────────────────────────────────────────── */
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

/* ── Protected + Email Verified ─────────────────────────── */
Route::middleware(['auth', 'email.verified'])->group(function () {

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('transactions', TransactionController::class);

    Route::resource('accounts', AccountController::class)->except(['show']);
    Route::get('/accounts/{account}/statement', [AccountController::class, 'statement'])->name('accounts.statement');

    Route::resource('people', PeopleController::class)->except(['create', 'edit']);

    Route::resource('loans', LoanController::class)->except(['show', 'create', 'edit']);
    Route::post('/loans/{loan}/repayment', [LoanController::class, 'recordRepayment'])->name('loans.repayment');

    Route::resource('subscriptions', SubscriptionController::class)->except(['show', 'create', 'edit']);
    Route::post('/subscriptions/{subscription}/pay',    [SubscriptionController::class, 'markAsPaid'])->name('subscriptions.pay');
    Route::post('/subscriptions/{subscription}/toggle', [SubscriptionController::class, 'toggleStatus'])->name('subscriptions.toggle');

    Route::resource('employees', EmployeeController::class)->except(['show', 'create', 'edit']);
    Route::post('/employees/{employee}/pay-salary', [EmployeeController::class, 'paySalary'])->name('employees.pay-salary');
    Route::get('/employees/{employee}/history',     [EmployeeController::class, 'paymentHistory'])->name('employees.history');

    Route::get('/reports',              [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export-pdf',   [ReportController::class, 'exportPdf'])->name('reports.export-pdf');
    Route::get('/reports/export-excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');

    Route::resource('budgets', BudgetController::class)->except(['show', 'create', 'edit']);

    Route::get('/notifications',                              [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read',         [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all',                    [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{notification}',            [NotificationController::class, 'dismiss'])->name('notifications.dismiss');
    Route::get('/notifications/recent',                       [NotificationController::class, 'getRecent'])->name('notifications.recent');

    Route::get('/settings',             [ProfileController::class, 'show'])->name('settings.index');
    Route::put('/settings/profile',     [ProfileController::class, 'updateProfile'])->name('settings.profile');
    Route::post('/settings/photo',      [ProfileController::class, 'updatePhoto'])->name('settings.photo');
    Route::put('/settings/password',    [ProfileController::class, 'updatePassword'])->name('settings.password');
    Route::put('/settings/pin',         [ProfileController::class, 'updatePin'])->name('settings.pin');
    Route::post('/settings/dark-mode',  [ProfileController::class, 'toggleDarkMode'])->name('settings.dark-mode');
    Route::post('/settings/google/disconnect', [ProfileController::class, 'disconnectGoogle'])->name('settings.google.disconnect');

    Route::get('/categories',              [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories',             [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}',   [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}',[CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/search', [SearchController::class, 'search'])->name('search');

    /* ── Backup System ──────────────────────────────────────────── */
    Route::prefix('backups')->name('backups.')->group(function () {
        Route::get('/',                           [BackupController::class, 'index'])->name('index');
        Route::post('/create',                    [BackupController::class, 'create'])->name('create');
        Route::get('/download/{filename}',        [BackupController::class, 'download'])->name('download')->where('filename', '[a-zA-Z0-9_\-\.]+');
        Route::post('/restore/{filename}',        [BackupController::class, 'restore'])->name('restore')->where('filename', '[a-zA-Z0-9_\-\.]+');
        Route::post('/upload-restore',            [BackupController::class, 'uploadRestore'])->name('upload-restore');
        Route::delete('/delete/{filename}',       [BackupController::class, 'destroy'])->name('destroy')->where('filename', '[a-zA-Z0-9_\-\.]+');
        Route::post('/settings',                  [BackupController::class, 'saveSettings'])->name('settings');
    });

    /* ── Full System Data Export / Import ───────────────────────── */
    Route::prefix('data')->name('data.')->group(function () {
        Route::get('/export-sql',    [DataController::class, 'exportSql'])->name('export-sql');
        Route::get('/export-excel',  [DataController::class, 'exportExcel'])->name('export-excel');
        Route::get('/export-zip-csv',[DataController::class, 'exportZipCsv'])->name('export-zip-csv');
        Route::post('/import-sql',   [DataController::class, 'importSql'])->name('import-sql');
        Route::post('/import-excel', [DataController::class, 'importExcel'])->name('import-excel');
        Route::post('/import-csv',   [DataController::class, 'importCsv'])->name('import-csv');
    });

    /* ── Per-Page Exports ───────────────────────────────────────── */
    Route::prefix('export')->name('export.')->group(function () {
        Route::get('/transactions', [ExportController::class, 'transactions'])->name('transactions');
        Route::get('/accounts',     [ExportController::class, 'accounts'])->name('accounts');
        Route::get('/people',       [ExportController::class, 'people'])->name('people');
        Route::get('/loans',        [ExportController::class, 'loans'])->name('loans');
        Route::get('/subscriptions',[ExportController::class, 'subscriptions'])->name('subscriptions');
        Route::get('/employees',    [ExportController::class, 'employees'])->name('employees');
        Route::get('/budgets',      [ExportController::class, 'budgets'])->name('budgets');
    });

    /* ── AI Insights ────────────────────────────────────────────── */
    Route::get('/ai-insights',              [AIInsightsController::class, 'index'])->name('ai-insights.index');
    Route::get('/ai-insights/card/{card}',  [AIInsightsController::class, 'cardData'])->name('ai-insights.card');
    Route::post('/ai-insights/refresh',     [AIInsightsController::class, 'refresh'])->name('ai-insights.refresh');
    Route::post('/ai-insights/ask',         [AIInsightsController::class, 'ask'])->name('ai-insights.ask');
    Route::post('/ai-insights/test-connection', [AIInsightsController::class, 'testConnection'])->name('ai-insights.test');
    Route::post('/ai-insights/settings',    [AIInsightsController::class, 'saveSettings'])->name('ai-insights.settings');

    /* ── Transaction Drafts ─────────────────────────────────────── */
    Route::get('/drafts',                  [TransactionDraftController::class, 'index'])->name('drafts.index');
    Route::post('/drafts',                 [TransactionDraftController::class, 'store'])->name('drafts.store');
    Route::get('/drafts/count',            [TransactionDraftController::class, 'count'])->name('drafts.count');
    Route::post('/drafts/{draft}/discard', [TransactionDraftController::class, 'discard'])->name('drafts.discard');
    Route::post('/drafts/{draft}/convert', [TransactionDraftController::class, 'convert'])->name('drafts.convert');
    Route::get('/drafts/{draft}/voice',    [TransactionDraftController::class, 'voiceNote'])->name('drafts.voice');
});

/* ── Admin Panel ─────────────────────────────────────────── */
Route::middleware(['auth', 'email.verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('index');
});
