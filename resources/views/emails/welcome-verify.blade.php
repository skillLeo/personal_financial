@extends('emails.layout')

@section('subject', 'Welcome to SkillLeo')

@section('content')
<p class="greeting">Welcome to SkillLeo, {{ $name }}! 🎉</p>
<p class="text">
  We're thrilled to have you on board. SkillLeo helps you track every rupee, manage loans, subscriptions, employees, and get AI-powered financial insights — all in one place.
</p>
<p class="text">
  Before you dive in, please verify your email address using the 6-digit code below. This code expires in <strong>15 minutes</strong>.
</p>

<div class="otp-box">
  <div class="otp-label">Your Verification Code</div>
  <div class="otp-code">{{ $otp }}</div>
  <div class="otp-expiry">Expires in 15 minutes · Do not share this code</div>
</div>

<p class="text">
  Enter this code on the verification screen to activate your account. Once verified, you'll have full access to all SkillLeo features.
</p>

<div class="divider"></div>

<p class="text" style="font-size:13px; color:#94A3B8;">
  If you didn't create a SkillLeo account, you can safely ignore this email. Someone may have entered your email address by mistake.
</p>
@endsection
