<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>@yield('subject') — SkillLeo</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F1F5F9; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #080D1A 0%, #0F172A 100%); padding: 36px 40px; text-align: center; }
  .logo-icon { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: linear-gradient(135deg, #059669, #10B981); border-radius: 14px; margin-bottom: 12px; }
  .logo-icon svg { display: block; }
  .logo-name { font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; }
  .body { padding: 40px; }
  .greeting { font-size: 22px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
  .text { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 16px; }
  .otp-box { background: #F8FAFC; border: 2px dashed #10B981; border-radius: 12px; padding: 28px; text-align: center; margin: 28px 0; }
  .otp-label { font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .otp-code { font-size: 44px; font-weight: 800; color: #0F172A; letter-spacing: 12px; font-variant-numeric: tabular-nums; }
  .otp-expiry { font-size: 13px; color: #94A3B8; margin-top: 10px; }
  .alert-box { background: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 8px; padding: 16px 20px; margin: 24px 0; }
  .alert-text { font-size: 14px; color: #991B1B; line-height: 1.6; }
  .info-row { display: flex; gap: 12px; background: #F8FAFC; border-radius: 10px; padding: 16px 20px; margin: 16px 0; }
  .info-label { font-size: 12px; font-weight: 700; color: #94A3B8; letter-spacing: 0.5px; text-transform: uppercase; }
  .info-value { font-size: 14px; color: #334155; font-weight: 500; }
  .divider { height: 1px; background: #E2E8F0; margin: 28px 0; }
  .footer { background: #F8FAFC; padding: 28px 40px; text-align: center; border-top: 1px solid #E2E8F0; }
  .footer-text { font-size: 13px; color: #94A3B8; line-height: 1.6; }
  .footer-link { color: #10B981; text-decoration: none; }
  @media (max-width: 600px) {
    .wrapper { margin: 0; border-radius: 0; }
    .body, .footer { padding: 28px 24px; }
    .header { padding: 28px 24px; }
    .otp-code { font-size: 36px; letter-spacing: 8px; }
  }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo-icon">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    </div>
    <div class="logo-name">SkillLeo</div>
  </div>
  <div class="body">
    @yield('content')
  </div>
  <div class="footer">
    <p class="footer-text">
      © {{ date('Y') }} SkillLeo. All rights reserved.<br>
      This email was sent to you because an action was performed on your account.<br>
      If you did not perform this action, please <a href="mailto:{{ config('mail.from.address') }}" class="footer-link">contact support</a>.
    </p>
  </div>
</div>
</body>
</html>
