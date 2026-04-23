<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('business_name')->default('SkillLeo')->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->string('profile_photo')->nullable()->after('phone');
            $table->string('currency', 10)->default('PKR')->after('profile_photo');
            $table->string('timezone')->default('Asia/Karachi')->after('currency');
            $table->string('pin_code')->nullable()->after('timezone');
            $table->timestamp('last_login_at')->nullable()->after('pin_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'business_name', 'phone', 'profile_photo',
                'currency', 'timezone', 'pin_code', 'last_login_at',
            ]);
        });
    }
};
