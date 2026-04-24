@extends('emails.layout')

@section('subject', 'New Login Detected')

@section('content')
<p class="greeting">New Login to Your Account</p>
<p class="text">
  Hi {{ $name }}, we detected a new login to your SkillLeo account from a new device or location.
</p>

<div style="background:#F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px 24px; margin: 24px 0;">
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9;">
        <span class="info-label">Time</span><br>
        <span class="info-value">{{ $loginAt }}</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9;">
        <span class="info-label">IP Address</span><br>
        <span class="info-value">{{ $ip }}</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 0;">
        <span class="info-label">Device / Browser</span><br>
        <span class="info-value" style="font-size:13px;">{{ Str::limit($userAgent, 80) }}</span>
      </td>
    </tr>
  </table>
</div>

<div class="alert-box">
  <p class="alert-text">
    <strong>Wasn't you?</strong> If you don't recognize this login, reset your password immediately to secure your account.
  </p>
</div>

<p class="text">
  If this was you, no action is needed. We send this alert to help keep your account secure.
</p>
@endsection
