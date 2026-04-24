import { useState, useRef, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';

const TrendingIcon  = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>);
const SpinnerIcon   = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'vr-spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>);
const KeyIcon       = () => (<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: linear-gradient(135deg, #080D1A 0%, #0F172A 100%); min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; }
.vr-card { background: #fff; border-radius: 20px; padding: 48px 44px; max-width: 460px; width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.35); animation: vr-in 350ms ease both; }
.vr-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.vr-logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #059669, #10B981); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.vr-logo-name { font-size: 22px; font-weight: 800; color: #0F172A; }
.vr-icon-wrap { width: 72px; height: 72px; background: #F0FDF4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 2px solid #BBF7D0; }
.vr-title { font-size: 26px; font-weight: 800; color: #0F172A; text-align: center; letter-spacing: -0.5px; margin-bottom: 10px; }
.vr-desc { font-size: 14px; color: #64748B; text-align: center; line-height: 1.6; margin-bottom: 32px; }
.vr-email { font-weight: 700; color: #0F172A; }
.vr-otp-row { display: flex; gap: 10px; justify-content: center; margin-bottom: 8px; }
.vr-otp-input { width: 52px; height: 60px; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 24px; font-weight: 800; color: #0F172A; text-align: center; font-family: inherit; background: #FAFBFC; transition: border-color 200ms, box-shadow 200ms; outline: none; }
.vr-otp-input:focus { border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.12); background: #fff; }
.vr-otp-input.vr-filled { border-color: #10B981; background: #F0FDF4; }
.vr-otp-input.vr-err { border-color: #EF4444; background: #FEF2F2; }
.vr-field-error { font-size: 12px; color: #EF4444; text-align: center; margin-bottom: 16px; font-weight: 500; min-height: 18px; }
.vr-btn { width: 100%; height: 52px; background: #0F172A; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 200ms; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
.vr-btn:hover:not(:disabled) { background: #1E293B; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(15,23,42,0.25); }
.vr-btn:disabled { opacity: 0.75; cursor: not-allowed; }
.vr-back { display: block; text-align: center; font-size: 14px; color: #94A3B8; text-decoration: none; transition: color 150ms; }
.vr-back:hover { color: #64748B; }
@keyframes vr-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes vr-spin { to { transform: rotate(360deg); } }
@media (max-width: 500px) {
    .vr-card { padding: 36px 24px; }
    .vr-otp-input { width: 44px; height: 54px; font-size: 20px; }
    .vr-otp-row { gap: 8px; }
}
`;

export default function VerifyResetOtp({ email: initialEmail, flash }) {
    const inputRefs = useRef([]);
    const [digits, setDigits] = useState(['', '', '', '', '', '']);

    const { data, setData, post, processing, errors } = useForm({
        email: initialEmail || '',
        otp: '',
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
        post('/reset-password/verify');
    };

    const hasError = !!errors.otp || !!errors.email;

    return (
        <>
            <Head title="Enter Reset Code — SkillLeo"><style>{CSS}</style></Head>
            <div className="vr-card">
                <div className="vr-logo">
                    <div className="vr-logo-icon"><TrendingIcon /></div>
                    <div className="vr-logo-name">SkillLeo</div>
                </div>

                <div className="vr-icon-wrap"><KeyIcon /></div>
                <h1 className="vr-title">Enter reset code</h1>
                <p className="vr-desc">
                    We sent a 6-digit reset code to<br />
                    <span className="vr-email">{data.email}</span>.<br />
                    The code expires in 10 minutes.
                </p>

                <form onSubmit={submit}>
                    <input type="hidden" value={data.email} />
                    <div className="vr-otp-row" onPaste={handlePaste}>
                        {digits.map((d, i) => (
                            <input key={i} ref={el => inputRefs.current[i] = el} type="text" inputMode="numeric"
                                maxLength={1} value={d} onChange={e => handleDigit(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`vr-otp-input${d ? ' vr-filled' : ''}${hasError ? ' vr-err' : ''}`}
                                autoFocus={i === 0} />
                        ))}
                    </div>

                    <div className="vr-field-error">{errors.otp || errors.email || ''}</div>

                    <button type="submit" disabled={processing || digits.join('').length < 6} className="vr-btn">
                        {processing ? <><SpinnerIcon />Verifying…</> : 'Continue'}
                    </button>
                </form>

                <a href="/forgot-password" className="vr-back">← Request a new code</a>
            </div>
        </>
    );
}
