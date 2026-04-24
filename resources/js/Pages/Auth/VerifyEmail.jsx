import { useState, useRef, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';

const TrendingIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
);
const SpinnerIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 've-spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>);
const MailSentIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: linear-gradient(135deg, #080D1A 0%, #0F172A 100%); min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; }
.ve-card { background: #fff; border-radius: 20px; padding: 48px 44px; max-width: 460px; width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.35); animation: ve-in 350ms ease both; }
.ve-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.ve-logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #059669, #10B981); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.ve-logo-name { font-size: 22px; font-weight: 800; color: #0F172A; }
.ve-icon-wrap { width: 72px; height: 72px; background: #F0FDF4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 2px solid #BBF7D0; }
.ve-title { font-size: 26px; font-weight: 800; color: #0F172A; text-align: center; letter-spacing: -0.5px; margin-bottom: 10px; }
.ve-desc { font-size: 14px; color: #64748B; text-align: center; line-height: 1.6; margin-bottom: 32px; }
.ve-email { font-weight: 700; color: #0F172A; }
.ve-otp-row { display: flex; gap: 10px; justify-content: center; margin-bottom: 8px; }
.ve-otp-input { width: 52px; height: 60px; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 24px; font-weight: 800; color: #0F172A; text-align: center; font-family: inherit; background: #FAFBFC; transition: border-color 200ms, box-shadow 200ms; outline: none; }
.ve-otp-input:focus { border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.12); background: #fff; }
.ve-otp-input.ve-filled { border-color: #10B981; background: #F0FDF4; }
.ve-otp-input.ve-err { border-color: #EF4444; background: #FEF2F2; }
.ve-field-error { font-size: 12px; color: #EF4444; text-align: center; margin-bottom: 16px; font-weight: 500; min-height: 18px; }
.ve-btn { width: 100%; height: 52px; background: #0F172A; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 200ms; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
.ve-btn:hover:not(:disabled) { background: #1E293B; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(15,23,42,0.25); }
.ve-btn:disabled { opacity: 0.75; cursor: not-allowed; }
.ve-resend { text-align: center; font-size: 14px; color: #64748B; }
.ve-resend-btn { background: none; border: none; font-family: inherit; font-size: 14px; font-weight: 600; color: #10B981; cursor: pointer; padding: 0; transition: opacity 150ms; }
.ve-resend-btn:hover { opacity: 0.75; }
.ve-resend-btn:disabled { color: #94A3B8; cursor: default; }
.ve-banner { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 16px; }
.ve-banner-error { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
.ve-banner-success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #065F46; }
.ve-back { display: block; text-align: center; font-size: 14px; color: #94A3B8; margin-top: 20px; text-decoration: none; transition: color 150ms; }
.ve-back:hover { color: #64748B; }
@keyframes ve-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ve-spin { to { transform: rotate(360deg); } }
@media (max-width: 500px) {
    .ve-card { padding: 36px 24px; border-radius: 16px; }
    .ve-otp-input { width: 44px; height: 54px; font-size: 20px; }
    .ve-otp-row { gap: 8px; }
}
`;

export default function VerifyEmail({ email: initialEmail, flash }) {
    const inputRefs = useRef([]);
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resending, setResending] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: initialEmail || '',
        otp: '',
    });

    // Sync digits → otp field
    useEffect(() => {
        setData('otp', digits.join(''));
    }, [digits]);

    // Resend countdown
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(v => v - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const handleDigit = (i, val) => {
        const ch = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[i] = ch;
        setDigits(next);
        if (ch && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const next = [...digits];
        for (let j = 0; j < 6; j++) next[j] = text[j] || '';
        setDigits(next);
        inputRefs.current[Math.min(text.length, 5)]?.focus();
    };

    const submit = (e) => {
        e.preventDefault();
        post('/verify-email');
    };

    const resend = () => {
        if (resendCooldown > 0 || resending) return;
        setResending(true);
        fetch('/verify-email/resend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content || '' },
            body: JSON.stringify({ email: data.email }),
        }).finally(() => {
            setResending(false);
            setResendCooldown(60);
        });
    };

    const hasError = !!errors.otp || !!errors.email;

    return (
        <>
            <Head title="Verify Email — SkillLeo">
                <style>{CSS}</style>
            </Head>
            <div className="ve-card">
                <div className="ve-logo">
                    <div className="ve-logo-icon"><TrendingIcon /></div>
                    <div className="ve-logo-name">SkillLeo</div>
                </div>

                <div className="ve-icon-wrap"><MailSentIcon /></div>
                <h1 className="ve-title">Check your email</h1>
                <p className="ve-desc">
                    We sent a 6-digit verification code to<br />
                    <span className="ve-email">{data.email || 'your email address'}</span>.<br />
                    Enter it below to verify your account.
                </p>

                {flash?.success && (
                    <div className="ve-banner ve-banner-success">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                        {flash.success}
                    </div>
                )}
                {flash?.info && (
                    <div className="ve-banner ve-banner-success">{flash.info}</div>
                )}

                <form onSubmit={submit}>
                    {/* Hidden email */}
                    <input type="hidden" value={data.email} onChange={e => setData('email', e.target.value)} />

                    {/* OTP Boxes */}
                    <div className="ve-otp-row" onPaste={handlePaste}>
                        {digits.map((d, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={d}
                                onChange={e => handleDigit(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`ve-otp-input${d ? ' ve-filled' : ''}${hasError ? ' ve-err' : ''}`}
                                autoFocus={i === 0}
                            />
                        ))}
                    </div>

                    <div className="ve-field-error">{errors.otp || errors.email || ''}</div>

                    <button type="submit" disabled={processing || digits.join('').length < 6} className="ve-btn">
                        {processing ? <><SpinnerIcon />Verifying…</> : 'Verify Email'}
                    </button>
                </form>

                <div className="ve-resend">
                    Didn't receive it?{' '}
                    <button className="ve-resend-btn" onClick={resend} disabled={resendCooldown > 0 || resending}>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : resending ? 'Sending…' : 'Resend code'}
                    </button>
                </div>

                <a href="/login" className="ve-back">← Back to sign in</a>
            </div>
        </>
    );
}
