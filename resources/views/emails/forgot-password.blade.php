@extends('emails.layout')

@section('subject', 'Reset Your Password')

@section('content')
<p class="greeting">Password Reset Request</p>
<p class="text">
  Hi {{ $name }}, we received a request to reset the password for your SkillLeo account. Use the code below to set a new password.
</p>

<div class="otp-box">
  <div class="otp-label">Password Reset Code</div>
  <div class="otp-code">{{ $otp }}</div>
  <div class="otp-expiry">Expires in 10 minutes · Single use only</div>
</div>

<p class="text">
  Enter this code on the reset password screen. After entering the code, you'll be able to choose a new password.
</p>

<div class="alert-box">
  <p class="alert-text">
    <strong>Didn't request this?</strong> If you didn't request a password reset, your account may be at risk. We recommend changing your password immediately.
  </p>
</div>

<div class="divider"></div>

<p class="text" style="font-size:13px; color:#94A3B8;">
  This reset code will expire in 10 minutes. If you need a new code, go back to the forgot password screen and request again.
</p>
@endsection
