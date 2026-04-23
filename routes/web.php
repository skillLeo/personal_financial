<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
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

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

Route::middleware('auth')->group(function () {

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('transactions', TransactionController::class);

    Route::resource('accounts', AccountController::class)->except(['show']);
    Route::get('/accounts/{account}/statement', [AccountController::class, 'statement'])->name('accounts.statement');

    Route::resource('people', PeopleController::class)->except(['create', 'edit']);

    Route::resource('loans', LoanController::class)->except(['show', 'create', 'edit']);
    Route::post('/loans/{loan}/repayment', [LoanController::class, 'recordRepayment'])->name('loans.repayment');

    Route::resource('subscriptions', SubscriptionController::class)->except(['show', 'create', 'edit']);
    Route::post('/subscriptions/{subscription}/pay', [SubscriptionController::class, 'markAsPaid'])->name('subscriptions.pay');
    Route::post('/subscriptions/{subscription}/toggle', [SubscriptionController::class, 'toggleStatus'])->name('subscriptions.toggle');

    Route::resource('employees', EmployeeController::class)->except(['show', 'create', 'edit']);
    Route::post('/employees/{employee}/pay-salary', [EmployeeController::class, 'paySalary'])->name('employees.pay-salary');
    Route::get('/employees/{employee}/history', [EmployeeController::class, 'paymentHistory'])->name('employees.history');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.export-pdf');
    Route::get('/reports/export-excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');

    Route::resource('budgets', BudgetController::class)->except(['show', 'create', 'edit']);

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'dismiss'])->name('notifications.dismiss');
    Route::get('/notifications/recent', [NotificationController::class, 'getRecent'])->name('notifications.recent');

    Route::get('/settings', [ProfileController::class, 'show'])->name('settings.index');
    Route::put('/settings/profile', [ProfileController::class, 'updateProfile'])->name('settings.profile');
    Route::post('/settings/photo', [ProfileController::class, 'updatePhoto'])->name('settings.photo');
    Route::put('/settings/password', [ProfileController::class, 'updatePassword'])->name('settings.password');
    Route::put('/settings/pin', [ProfileController::class, 'updatePin'])->name('settings.pin');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/search', [SearchController::class, 'search'])->name('search');
});
