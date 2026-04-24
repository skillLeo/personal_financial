@extends('emails.layout')

@section('subject', 'Password Changed')

@section('content')
<p class="greeting">Your Password Was Changed</p>
<p class="text">
  Hi {{ $name }}, this is a confirmation that the password for your SkillLeo account was successfully changed.
</p>

<div style="background:#F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 20px 24px; margin: 24px 0;">
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #D1FAE5;">
        <span class="info-label">Date &amp; Time</span><br>
        <span class="info-value">{{ $changedAt }}</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 0;">
        <span class="info-label">IP Address</span><br>
        <span class="info-value">{{ $ip }}</span>
      </td>
    </tr>
  </table>
</div>

<div class="alert-box">
  <p class="alert-text">
    <strong>Not you?</strong> If you did not change your password, your account may be compromised. Please reset your password immediately and contact our support team.
  </p>
</div>

<p class="text">
  All your existing login sessions have been terminated for security. You'll need to log in again on all your devices.
</p>
@endsection
