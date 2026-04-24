@extends('emails.layout')

@section('subject', 'Email Verification Code')

@section('content')
<p class="greeting">Verify Your Email Address</p>
<p class="text">
  Hi {{ $name }}, you requested a new verification code for your SkillLeo account. Use the code below to verify your email address.
</p>

<div class="otp-box">
  <div class="otp-label">Verification Code</div>
  <div class="otp-code">{{ $otp }}</div>
  <div class="otp-expiry">Expires in 15 minutes · Single use only</div>
</div>

<div class="alert-box">
  <p class="alert-text">
    <strong>Security notice:</strong> Never share this code with anyone, including SkillLeo support. We will never ask for your OTP code.
  </p>
</div>

<p class="text">
  If you didn't request this code, your account may be at risk. Please change your password immediately and contact us.
</p>
@endsection
