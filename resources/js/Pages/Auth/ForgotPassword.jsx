import { useForm, Head } from '@inertiajs/react';

const TrendingIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>);
const MailIcon    = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const ArrowRight  = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>);
const SpinnerIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'fp-spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>);
const LockOpenIcon= () => (<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: linear-gradient(135deg, #080D1A 0%, #0F172A 100%); min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; }
.fp-card { background: #fff; border-radius: 20px; padding: 48px 44px; max-width: 440px; width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.35); animation: fp-in 350ms ease both; }
.fp-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.fp-logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #059669, #10B981); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.fp-logo-name { font-size: 22px; font-weight: 800; color: #0F172A; }
.fp-icon-wrap { width: 72px; height: 72px; background: #F0FDF4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 2px solid #BBF7D0; }
.fp-title { font-size: 26px; font-weight: 800; color: #0F172A; text-align: center; letter-spacing: -0.5px; margin-bottom: 10px; }
.fp-desc { font-size: 14px; color: #64748B; text-align: center; line-height: 1.6; margin-bottom: 28px; }
.fp-banner { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 16px; }
.fp-banner-error { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
.fp-banner-success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #065F46; }
.fp-field { margin-bottom: 18px; }
.fp-label { display: block; font-size: 11px; font-weight: 700; color: #374151; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 7px; }
.fp-input-wrap { position: relative; }
.fp-input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94A3B8; pointer-events: none; display: flex; align-items: center; }
.fp-input { width: 100%; height: 50px; background: #FAFBFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 0 16px 0 46px; font-size: 15px; color: #0F172A; font-family: inherit; transition: border-color 200ms, box-shadow 200ms; outline: none; }
.fp-input:focus { border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.08); background: #fff; }
.fp-input::placeholder { color: #CBD5E1; }
.fp-input.fp-err { border-color: #EF4444; }
.fp-field-error { font-size: 12px; color: #EF4444; margin-top: 5px; font-weight: 500; }
.fp-btn { width: 100%; height: 52px; background: #0F172A; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 200ms; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
.fp-btn:hover:not(:disabled) { background: #1E293B; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(15,23,42,0.25); }
.fp-btn:disabled { opacity: 0.75; cursor: not-allowed; }
.fp-back { display: block; text-align: center; font-size: 14px; color: #94A3B8; text-decoration: none; transition: color 150ms; }
.fp-back:hover { color: #64748B; }
@keyframes fp-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fp-spin { to { transform: rotate(360deg); } }
@media (max-width: 500px) { .fp-card { padding: 36px 24px; } }
`;

export default function ForgotPassword({ flash }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Forgot Password — SkillLeo"><style>{CSS}</style></Head>
            <div className="fp-card">
                <div className="fp-logo">
                    <div className="fp-logo-icon"><TrendingIcon /></div>
                    <div className="fp-logo-name">SkillLeo</div>
                </div>

                <div className="fp-icon-wrap"><LockOpenIcon /></div>
                <h1 className="fp-title">Forgot your password?</h1>
                <p className="fp-desc">Enter your email address and we'll send you a 6-digit reset code. The code expires in 10 minutes.</p>

                {flash?.success && (
                    <div className="fp-banner fp-banner-success">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                        {flash.success}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="fp-field">
                        <label className="fp-label">Email Address</label>
                        <div className="fp-input-wrap">
                            <span className="fp-input-icon"><MailIcon /></span>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                className={`fp-input${errors.email ? ' fp-err' : ''}`} placeholder="your@email.com" autoFocus autoComplete="email" />
                        </div>
                        {errors.email && <div className="fp-field-error">{errors.email}</div>}
                    </div>

                    <button type="submit" disabled={processing} className="fp-btn">
                        {processing ? <><SpinnerIcon />Sending code…</> : <>Send Reset Code <ArrowRight /></>}
                    </button>
                </form>

                <a href="/login" className="fp-back">← Back to sign in</a>
            </div>
        </>
    );
}
