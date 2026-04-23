<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TransactionController;

Route::prefix('v1')->group(function () {

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/user', [AuthController::class, 'me']);

        Route::get('/dashboard/summary', [SyncController::class, 'dashboard']);

        Route::get('/transactions', [SyncController::class, 'getTransactions']);
        Route::post('/transactions', [SyncController::class, 'storeTransaction']);
        Route::post('/transactions/bulk-sync', [SyncController::class, 'bulkSync']);

        Route::get('/accounts', [AccountController::class, 'index']);
        Route::post('/accounts', [AccountController::class, 'store']);
        Route::put('/accounts/{account}', [AccountController::class, 'update']);

        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);

        Route::get('/people', [PeopleController::class, 'index']);
        Route::post('/people', [PeopleController::class, 'store']);

        Route::get('/loans', [LoanController::class, 'index']);
        Route::post('/loans', [LoanController::class, 'store']);
        Route::post('/loans/{loan}/repayment', [LoanController::class, 'recordRepayment']);

        Route::get('/subscriptions', [SubscriptionController::class, 'index']);

        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees/{employee}/pay-salary', [EmployeeController::class, 'paySalary']);

        Route::get('/sync/pending-changes', [SyncController::class, 'pendingChanges']);
        Route::post('/sync/acknowledge', [SyncController::class, 'acknowledge']);
    });
});
