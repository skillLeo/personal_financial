<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewDeviceLoginMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $ip,
        public string $loginAt,
        public string $userAgent
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New Login Detected — SkillLeo');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new-device-login');
    }
}
