<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_drafts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2)->nullable();
            $table->string('label')->nullable();
            $table->enum('type', ['income', 'expense', 'unknown'])->nullable();
            $table->string('voice_note_path')->nullable();
            $table->timestamps();
            $table->timestamp('converted_at')->nullable();
            $table->timestamp('discarded_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_drafts');
    }
};
