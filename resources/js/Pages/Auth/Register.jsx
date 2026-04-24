import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';

/* ── Icons ─────────────────────────────────────────────── */
const TrendingIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
);
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);
const UserIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const MailIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const LockIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const EyeIcon   = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const EyeOffIcon= () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>);
const ArrowRight= () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>);
const SpinnerIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'rf-spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>);
const CheckIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const ShieldIcon= () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.rf-root *, .rf-root *::before, .rf-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
.rf-root { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
.rf-left { width: 45%; background: linear-gradient(145deg, #080D1A 0%, #0B1120 35%, #0F172A 70%, #0A1628 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 48px; position: relative; overflow: hidden; flex-shrink: 0; }
.rf-left-mesh { position: absolute; inset: 0; background: radial-gradient(ellipse at 15% 75%, rgba(16,185,129,0.09) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(99,102,241,0.06) 0%, transparent 50%); pointer-events: none; }
.rf-left-content { position: relative; z-index: 2; max-width: 380px; width: 100%; }
.rf-logo-row { display: flex; align-items: center; gap: 14px; margin-bottom: 44px; }
.rf-logo-icon { width: 52px; height: 52px; background: linear-gradient(135deg, #059669 0%, #10B981 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(16,185,129,0.4); flex-shrink: 0; }
.rf-logo-name { font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; }
.rf-headline { font-size: 40px; font-weight: 800; color: #FFFFFF; line-height: 1.1; letter-spacing: -1px; margin-bottom: 16px; }
.rf-subtitle { font-size: 17px; color: #64748B; line-height: 1.6; margin-bottom: 40px; }
.rf-features { display: flex; flex-direction: column; gap: 14px; }
.rf-feature { display: flex; align-items: center; gap: 12px; }
.rf-feature-check { width: 30px; height: 30px; border-radius: 50%; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rf-feature-text { font-size: 14px; color: #CBD5E1; font-weight: 500; }
.rf-right { width: 55%; background: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; overflow-y: auto; animation: rf-fadein 400ms ease both; }
.rf-form-wrap { width: 100%; max-width: 420px; }
.rf-drag-handle { width: 36px; height: 4px; background: #E2E8F0; border-radius: 99px; margin: 0 auto 24px; display: none; }
.rf-badge { display: inline-flex; align-items: center; gap: 6px; background: #F0FDF4; color: #059669; border: 1px solid #BBF7D0; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 20px; letter-spacing: 0.02em; }
.rf-heading { font-size: 30px; font-weight: 800; color: #0F172A; letter-spacing: -0.8px; margin-bottom: 8px; }
.rf-subhead { font-size: 14px; color: #64748B; margin-bottom: 28px; line-height: 1.5; }
.rf-banner { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 18px; line-height: 1.5; }
.rf-banner-error { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
.rf-banner-success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #065F46; }
.rf-field { margin-bottom: 16px; }
.rf-label { display: block; font-size: 11px; font-weight: 700; color: #374151; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 7px; }
.rf-input-wrap { position: relative; }
.rf-input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94A3B8; pointer-events: none; display: flex; align-items: center; }
.rf-input { width: 100%; height: 50px; background: #FAFBFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 0 16px 0 46px; font-size: 15px; color: #0F172A; font-family: inherit; transition: border-color 200ms ease, box-shadow 200ms ease; outline: none; }
.rf-input:focus { border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.08); background: #fff; }
.rf-input::placeholder { color: #CBD5E1; }
.rf-input.rf-err { border-color: #EF4444; }
.rf-input.rf-err:focus { box-shadow: 0 0 0 4px rgba(239,68,68,0.08); }
.rf-input-pr { padding-right: 46px; }
.rf-eye-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94A3B8; display: flex; align-items: center; padding: 4px; border-radius: 4px; transition: color 150ms; }
.rf-eye-btn:hover { color: #475569; }
.rf-field-error { font-size: 12px; color: #EF4444; margin-top: 5px; font-weight: 500; }
.rf-btn-submit { width: 100%; height: 50px; background: #0F172A; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 200ms; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 16px; }
.rf-btn-submit:hover:not(:disabled) { background: #1E293B; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(15,23,42,0.25); }
.rf-btn-submit:disabled { opacity: 0.75; cursor: not-allowed; }
.rf-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.rf-divider-line { flex: 1; height: 1px; background: #E2E8F0; }
.rf-divider-text { font-size: 12px; color: #94A3B8; font-weight: 500; }
.rf-btn-google { width: 100%; height: 48px; background: #fff; color: #374151; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 200ms; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
.rf-btn-google:hover { border-color: #CBD5E1; background: #F8FAFC; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.rf-signin-link { text-align: center; font-size: 14px; color: #64748B; }
.rf-signin-link a { color: #10B981; font-weight: 600; text-decoration: none; }
.rf-signin-link a:hover { text-decoration: underline; }
.rf-footer { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 24px; }
@keyframes rf-fadein { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rf-spin { to { transform: rotate(360deg); } }
@media (max-width: 767px) {
    .rf-root { flex-direction: column; }
    .rf-left { width: 100%; min-height: 36vh; padding: 48px 24px 64px; align-items: flex-start; justify-content: flex-end; }
    .rf-left-content { max-width: 100%; }
    .rf-headline { font-size: 26px; } .rf-subtitle { font-size: 14px; margin-bottom: 0; } .rf-features { display: none; } .rf-logo-row { margin-bottom: 16px; }
    .rf-right { width: 100%; border-radius: 28px 28px 0 0; padding: 24px 24px 36px; margin-top: -28px; position: relative; z-index: 10; box-shadow: 0 -12px 40px rgba(0,0,0,0.18); justify-content: flex-start; animation: rf-card-up 380ms ease both; overflow-y: auto; }
    .rf-drag-handle { display: block; } .rf-form-wrap { max-width: 100%; }
}
@keyframes rf-card-up { from { opacity: 0.7; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
@media (min-width: 768px) and (max-width: 1023px) {
    .rf-left { width: 40%; padding: 40px 32px; } .rf-right { width: 60%; padding: 40px; }
    .rf-features { display: none; } .rf-headline { font-size: 30px; }
}
`;

const FEATURES = [
    'Track income, expenses & transfers',
    'AI-powered financial insights',
    'Loans, salaries & subscriptions',
];

export default function Register({ flash }) {
    const [showPw, setShowPw] = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const hasErrors = Object.keys(errors).length > 0;

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Create Account — SkillLeo">
                <style>{CSS}</style>
            </Head>
            <div className="rf-root">
                <div className="rf-left">
                    <div className="rf-left-mesh" />
                    <div className="rf-left-content">
                        <div className="rf-logo-row">
                            <div className="rf-logo-icon"><TrendingIcon /></div>
                            <div className="rf-logo-name">SkillLeo</div>
                        </div>
                        <h1 className="rf-headline">Start your financial journey</h1>
                        <p className="rf-subtitle">Everything you need to manage money smarter, in one place.</p>
                        <div className="rf-features">
                            {FEATURES.map((f, i) => (
                                <div key={i} className="rf-feature">
                                    <div className="rf-feature-check"><CheckIcon /></div>
                                    <span className="rf-feature-text">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rf-right">
                    <div className="rf-form-wrap">
                        <div className="rf-drag-handle" />
                        <div className="rf-badge"><ShieldIcon /> Free to get started</div>
                        <h2 className="rf-heading">Create your account</h2>
                        <p className="rf-subhead">Join SkillLeo and take control of your finances</p>

                        {flash?.success && (
                            <div className="rf-banner rf-banner-success">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20 6 9 17 4 12"/></svg>
                                <span>{flash.success}</span>
                            </div>
                        )}
                        {hasErrors && (
                            <div className="rf-banner rf-banner-error">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                <span>Please fix the errors below and try again.</span>
                            </div>
                        )}

                        {/* Google Sign Up */}
                        <a href="/auth/google" className="rf-btn-google" style={{ textDecoration: 'none' }}>
                            <GoogleIcon />
                            Continue with Google
                        </a>

                        <div className="rf-divider">
                            <div className="rf-divider-line" />
                            <span className="rf-divider-text">or register with email</span>
                            <div className="rf-divider-line" />
                        </div>

                        <form onSubmit={submit}>
                            {/* Name */}
                            <div className="rf-field">
                                <label className="rf-label">Full Name</label>
                                <div className="rf-input-wrap">
                                    <span className="rf-input-icon"><UserIcon /></span>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                        className={`rf-input${errors.name ? ' rf-err' : ''}`} placeholder="Your full name" autoFocus />
                                </div>
                                {errors.name && <div className="rf-field-error">{errors.name}</div>}
                            </div>

                            {/* Email */}
                            <div className="rf-field">
                                <label className="rf-label">Email Address</label>
                                <div className="rf-input-wrap">
                                    <span className="rf-input-icon"><MailIcon /></span>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                        className={`rf-input${errors.email ? ' rf-err' : ''}`} placeholder="your@email.com" autoComplete="email" />
                                </div>
                                {errors.email && <div className="rf-field-error">{errors.email}</div>}
                            </div>

                            {/* Password */}
                            <div className="rf-field">
                                <label className="rf-label">Password</label>
                                <div className="rf-input-wrap">
                                    <span className="rf-input-icon"><LockIcon /></span>
                                    <input type={showPw ? 'text' : 'password'} value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className={`rf-input rf-input-pr${errors.password ? ' rf-err' : ''}`}
                                        placeholder="Min 8 characters" autoComplete="new-password" />
                                    <button type="button" className="rf-eye-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                                {errors.password && <div className="rf-field-error">{errors.password}</div>}
                            </div>

                            {/* Confirm Password */}
                            <div className="rf-field">
                                <label className="rf-label">Confirm Password</label>
                                <div className="rf-input-wrap">
                                    <span className="rf-input-icon"><LockIcon /></span>
                                    <input type={showCpw ? 'text' : 'password'} value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        className={`rf-input rf-input-pr${errors.password_confirmation ? ' rf-err' : ''}`}
                                        placeholder="Repeat your password" autoComplete="new-password" />
                                    <button type="button" className="rf-eye-btn" onClick={() => setShowCpw(v => !v)} tabIndex={-1}>
                                        {showCpw ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                                {errors.password_confirmation && <div className="rf-field-error">{errors.password_confirmation}</div>}
                            </div>

                            <button type="submit" disabled={processing} className="rf-btn-submit">
                                {processing ? <><SpinnerIcon />Creating account…</> : <>Create Account <ArrowRight /></>}
                            </button>
                        </form>

                        <div className="rf-signin-link">
                            Already have an account? <a href="/login">Sign in</a>
                        </div>

                        <div className="rf-footer">© {new Date().getFullYear()} SkillLeo</div>
                    </div>
                </div>
            </div>
        </>
    );
}
