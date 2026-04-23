<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('person_id')->nullable()->constrained('people')->nullOnDelete();
            $table->enum('type', ['income', 'expense', 'transfer'])->default('expense');
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->date('transaction_date');
            $table->time('transaction_time')->nullable();
            $table->string('reference_number')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->enum('recurring_type', ['daily', 'weekly', 'monthly', 'yearly'])->nullable();
            $table->date('recurring_end_date')->nullable();
            $table->date('next_recurring_date')->nullable();
            $table->enum('sync_status', ['synced', 'pending', 'failed'])->default('synced');
            $table->string('local_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
