<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->enum('account_type', [
                'business_bank', 'personal_bank', 'cash', 'mobile_wallet', 'savings'
            ])->default('personal_bank')->after('type');
            $table->boolean('is_cash_account')->default(false)->after('account_type');
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn(['account_type', 'is_cash_account']);
        });
    }
};
