<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $ip,
        public string $changedAt
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your SkillLeo Password Was Changed');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.password-changed');
    }
}
