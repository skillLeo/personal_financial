import { useState, useRef, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';

const TrendingIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>);
const LockIcon     = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const EyeIcon      = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const EyeOffIcon   = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>);
const SpinnerIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'rp-spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>);
const ShieldCheck  = () => (<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: linear-gradient(135deg, #080D1A 0%, #0F172A 100%); min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; }
.rp-card { background: #fff; border-radius: 20px; padding: 48px 44px; max-width: 440px; width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.35); animation: rp-in 350ms ease both; }
.rp-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.rp-logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #059669, #10B981); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.rp-logo-name { font-size: 22px; font-weight: 800; color: #0F172A; }
.rp-icon-wrap { width: 72px; height: 72px; background: #F0FDF4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 2px solid #BBF7D0; }
.rp-title { font-size: 26px; font-weight: 800; color: #0F172A; text-align: center; letter-spacing: -0.5px; margin-bottom: 10px; }
.rp-desc { font-size: 14px; color: #64748B; text-align: center; line-height: 1.6; margin-bottom: 28px; }
.rp-banner { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 16px; }
.rp-banner-error { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
.rp-otp-label { font-size: 11px; font-weight: 700; color: #374151; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 7px; display: block; }
.rp-otp-row { display: flex; gap: 8px; margin-bottom: 4px; }
.rp-otp-input { width: 44px; height: 52px; border: 2px solid #E2E8F0; border-radius: 10px; font-size: 20px; font-weight: 800; color: #0F172A; text-align: center; font-family: inherit; background: #FAFBFC; transition: border-color 200ms; outline: none; }
.rp-otp-input:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); background: #fff; }
.rp-otp-input.rp-filled { border-color: #10B981; background: #F0FDF4; }
.rp-otp-input.rp-err { border-color: #EF4444; }
.rp-field { margin-bottom: 16px; margin-top: 20px; }
.rp-label { display: block; font-size: 11px; font-weight: 700; color: #374151; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 7px; }
.rp-input-wrap { position: relative; }
.rp-input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94A3B8; pointer-events: none; display: flex; align-items: center; }
.rp-input { width: 100%; height: 50px; background: #FAFBFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 0 46px 0 46px; font-size: 15px; color: #0F172A; font-family: inherit; transition: border-color 200ms; outline: none; }
.rp-input:focus { border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.08); background: #fff; }
.rp-input::placeholder { color: #CBD5E1; }
.rp-input.rp-err { border-color: #EF4444; }
.rp-eye-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94A3B8; display: flex; align-items: center; padding: 4px; }
.rp-field-error { font-size: 12px; color: #EF4444; margin-top: 5px; font-weight: 500; }
.rp-btn { width: 100%; height: 52px; background: #0F172A; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 200ms; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 8px; margin-bottom: 20px; }
.rp-btn:hover:not(:disabled) { background: #1E293B; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(15,23,42,0.25); }
.rp-btn:disabled { opacity: 0.75; cursor: not-allowed; }
.rp-back { display: block; text-align: center; font-size: 14px; color: #94A3B8; text-decoration: none; transition: color 150ms; }
.rp-back:hover { color: #64748B; }
@keyframes rp-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rp-spin { to { transform: rotate(360deg); } }
@media (max-width: 500px) { .rp-card { padding: 36px 24px; } }
`;

export default function ResetPassword({ flash }) {
    const inputRefs = useRef([]);
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [showPw, setShowPw] = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        otp: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => { setData('otp', digits.join('')); }, [digits]);

    const handleDigit = (i, val) => {
        const ch = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[i] = ch;
        setDigits(next);
        if (ch && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
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
        post('/reset-password');
    };

    const hasOtpError = !!errors.otp;
    const hasAnyError = Object.keys(errors).length > 0;

    return (
        <>
            <Head title="Set New Password — SkillLeo"><style>{CSS}</style></Head>
            <div className="rp-card">
                <div className="rp-logo">
                    <div className="rp-logo-icon"><TrendingIcon /></div>
                    <div className="rp-logo-name">SkillLeo</div>
                </div>

                <div className="rp-icon-wrap"><ShieldCheck /></div>
                <h1 className="rp-title">Set new password</h1>
                <p className="rp-desc">Enter the 6-digit code from your email, then choose a strong new password.</p>

                {hasAnyError && (
                    <div className="rp-banner rp-banner-error">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {errors.otp || errors.password || 'Please fix the errors below.'}
                    </div>
                )}

                <form onSubmit={submit}>
                    {/* OTP */}
                    <span className="rp-otp-label">Verification Code</span>
                    <div className="rp-otp-row" onPaste={handlePaste}>
                        {digits.map((d, i) => (
                            <input key={i} ref={el => inputRefs.current[i] = el} type="text" inputMode="numeric"
                                maxLength={1} value={d} onChange={e => handleDigit(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`rp-otp-input${d ? ' rp-filled' : ''}${hasOtpError ? ' rp-err' : ''}`}
                                autoFocus={i === 0} />
                        ))}
                    </div>
                    {errors.otp && <div className="rp-field-error" style={{ marginBottom: 4 }}>{errors.otp}</div>}

                    {/* New Password */}
                    <div className="rp-field">
                        <label className="rp-label">New Password</label>
                        <div className="rp-input-wrap">
                            <span className="rp-input-icon"><LockIcon /></span>
                            <input type={showPw ? 'text' : 'password'} value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className={`rp-input${errors.password ? ' rp-err' : ''}`}
                                placeholder="Min 8 characters" autoComplete="new-password" />
                            <button type="button" className="rp-eye-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                                {showPw ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && <div className="rp-field-error">{errors.password}</div>}
                    </div>

                    {/* Confirm Password */}
                    <div className="rp-field" style={{ marginTop: 0 }}>
                        <label className="rp-label">Confirm Password</label>
                        <div className="rp-input-wrap">
                            <span className="rp-input-icon"><LockIcon /></span>
                            <input type={showCpw ? 'text' : 'password'} value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                className={`rp-input${errors.password_confirmation ? ' rp-err' : ''}`}
                                placeholder="Repeat password" autoComplete="new-password" />
                            <button type="button" className="rp-eye-btn" onClick={() => setShowCpw(v => !v)} tabIndex={-1}>
                                {showCpw ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password_confirmation && <div className="rp-field-error">{errors.password_confirmation}</div>}
                    </div>

                    <button type="submit" disabled={processing} className="rp-btn">
                        {processing ? <><SpinnerIcon />Resetting…</> : 'Reset Password'}
                    </button>
                </form>

                <a href="/forgot-password" className="rp-back">← Start over</a>
            </div>
        </>
    );
}
