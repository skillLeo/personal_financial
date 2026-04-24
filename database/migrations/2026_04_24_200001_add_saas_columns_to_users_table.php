<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->after('email');
            $table->string('avatar_url')->nullable()->after('profile_photo');
            $table->boolean('is_active')->default(true)->after('avatar_url');
            $table->boolean('is_admin')->default(false)->after('is_active');
            $table->enum('plan', ['free', 'pro'])->default('free')->after('is_admin');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'avatar_url', 'is_active', 'is_admin', 'plan', 'last_login_ip']);
        });
    }
};
