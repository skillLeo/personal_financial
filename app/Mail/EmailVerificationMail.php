<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $otp
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your SkillLeo Verification Code');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.email-verification');
    }
}
