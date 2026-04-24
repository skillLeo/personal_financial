import { useState, useRef, useEffect, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content;
const fmt  = (n) => 'PKR ' + Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });

/* ── Icons ── */
const SparkleIco  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const RefreshIco  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const SendIco     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const SettingsIco = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const RetryIco    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const CheckIco    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const WarnIco     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

/* ── Shimmer CSS injected once ── */
const SHIMMER_STYLE = `
@keyframes shimmer { 0%{background-position:200% 0} to{background-position:-200% 0} }
@keyframes pulse-dot { 0%,100%{opacity:0.3} 50%{opacity:1} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes fill-bar { from{width:0} }
.ai-card-enter{animation:ai-card-in 0.4s cubic-bezier(0.22,1,0.36,1) both}
@keyframes ai-card-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
`;

/* ── Shimmer skeleton ── */
const Shimmer = ({ h = 14, w = '100%', r = 6, mb = 0 }) => (
    <div style={{ height: h, width: w, borderRadius: r, marginBottom: mb,
        background: 'linear-gradient(90deg,var(--sl-surface-2) 25%,var(--sl-border) 50%,var(--sl-surface-2) 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.6s infinite' }} />
);

/* ── Stage 1 data sources ── */
const DATA_SOURCES = [
    'Transactions — last 90 days',
    'Active budgets and categories',
    'Loan and debt records',
    'Subscription commitments',
    'Income streams',
];

/* ─────────────────────────────────────────────────────────────
   LOADING SCREEN
───────────────────────────────────────────────────────────── */
function LoadingScreen({ isCached, onDone }) {
    const [stage, setStage]     = useState(isCached ? 3 : 1);
    const [checked, setChecked] = useState([]);
    const [progress, setProgress] = useState(isCached ? 95 : 0);
    const [txnCount, setTxnCount] = useState(0);

    useEffect(() => {
        if (isCached) { const t = setTimeout(onDone, 600); return () => clearTimeout(t); }

        const timers = [];
        DATA_SOURCES.forEach((_, i) => {
            timers.push(setTimeout(() => {
                setChecked(prev => [...prev, i]);
                if (i === 0) {
                    let n = 0;
                    const iv = setInterval(() => {
                        n += Math.floor(Math.random() * 45) + 10;
                        if (n >= 312) { clearInterval(iv); n = 312; }
                        setTxnCount(n);
                    }, 40);
                }
                setProgress(Math.round(((i + 1) / DATA_SOURCES.length) * 30));
            }, 300 + i * 220));
        });
        timers.push(setTimeout(() => setStage(2), 1600));
        timers.push(setTimeout(() => setProgress(85), 2200));
        timers.push(setTimeout(() => { setStage(3); setProgress(95); }, 3500));
        timers.push(setTimeout(onDone, 4000));
        return () => timers.forEach(clearTimeout);
    }, [isCached]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ height: 3, background: 'var(--sl-border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg,#10B981,#34D399)', borderRadius: 99, width: `${progress}%`, transition: 'width 0.8s ease' }} />
            </div>
            <AnimatePresence mode="wait">
                {stage === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="card" style={{ padding: '24px 28px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
                            Collecting Financial Data
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {DATA_SOURCES.map((src, i) => {
                                const done = checked.includes(i);
                                return (
                                    <div key={i} style={{ opacity: i <= checked.length ? 1 : 0.25, transition: 'opacity 300ms' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: done ? 6 : 0 }}>
                                            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${done ? '#10B981' : 'var(--sl-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: done ? '#10B981' : 'transparent', transition: 'all 300ms' }}>
                                                {done && <span style={{ color: '#fff', display: 'flex' }}><CheckIco /></span>}
                                            </div>
                                            <span style={{ fontSize: 13, color: 'var(--sl-t2)', fontWeight: 500 }}>
                                                {src}
                                                {i === 0 && txnCount > 0 && (
                                                    <strong style={{ color: '#10B981', marginLeft: 8 }}>{txnCount}</strong>
                                                )}
                                            </span>
                                        </div>
                                        {done && (
                                            <div style={{ marginLeft: 28, height: 2, background: 'var(--sl-border)', borderRadius: 99, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', background: '#10B981', animation: 'fill-bar 0.5s ease forwards', width: '100%' }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
                {stage === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="card" style={{ padding: '28px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
                            AI Processing
                        </div>
                        {[['Income', '#10B981', 75], ['Expenses', '#EF4444', 60], ['Net Balance', '#6366F1', 45]].map(([label, color, w]) => (
                            <div key={label} style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 12, color: 'var(--sl-t3)', marginBottom: 5 }}>{label}</div>
                                <div style={{ height: 8, background: 'var(--sl-border)', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: color, borderRadius: 99, animation: 'fill-bar 1.2s cubic-bezier(0.22,1,0.36,1) forwards', width: `${w}%` }} />
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 13, color: 'var(--sl-t3)' }}>Analyzing patterns with AI</span>
                            {[0, 1, 2].map(i => (
                                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: `pulse-dot 1s ease infinite ${i * 0.25}s` }} />
                            ))}
                        </div>
                    </motion.div>
                )}
                {stage === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--sl-t3)', marginBottom: 12, textAlign: 'center' }}>
                            Generating insights
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card" style={{ minHeight: 160 }}>
                                    <Shimmer h={11} w="55%" r={5} mb={14} />
                                    <Shimmer h={32} w="45%" r={6} mb={12} />
                                    <Shimmer h={9} w="90%" r={5} mb={7} />
                                    <Shimmer h={9} w="70%" r={5} mb={7} />
                                    <Shimmer h={9} w="80%" r={5} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   CARD HELPERS
───────────────────────────────────────────────────────────── */
function CardShell({ children, style = {} }) {
    return <div className="card ai-card-enter" style={style}>{children}</div>;
}

function CardSkeleton() {
    return (
        <div className="card" style={{ minHeight: 160 }}>
            <Shimmer h={11} w="55%" r={5} mb={14} />
            <Shimmer h={32} w="45%" r={6} mb={12} />
            <Shimmer h={9} w="90%" r={5} mb={7} />
            <Shimmer h={9} w="70%" r={5} mb={7} />
            <Shimmer h={9} w="80%" r={5} />
        </div>
    );
}

function CardError({ onRetry }) {
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120, gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--sl-t3)' }}>Failed to load</div>
            <button onClick={onRetry} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10B981', fontWeight: 600, background: 'none', border: '1px solid #10B981', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <RetryIco /> Retry
            </button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   HEALTH SCORE CARD
───────────────────────────────────────────────────────────── */
function HealthScoreCard({ data }) {
    const score  = data?.score ?? 0;
    const r      = 54;
    const circ   = 2 * Math.PI * r;
    const pct    = Math.max(0, Math.min(100, score));
    const offset = circ - (pct / 100) * circ;
    const color  = score >= 70 ? '#10B981' : score >= 40 ? '#FBBF24' : '#EF4444';

    return (
        <CardShell style={{ background: 'linear-gradient(135deg,var(--sl-surface) 0%,var(--sl-surface-2) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <svg width={128} height={128} viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--sl-border)" strokeWidth="10" />
                        <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10"
                            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: '-1px' }}>{score}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sl-t3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>/100</div>
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.5px', marginBottom: 6 }}>{data?.label || '—'}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sl-t1)', marginBottom: 10 }}>Financial Health Score</div>
                    <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.65, maxWidth: 480, margin: 0 }}>{data?.summary}</p>
                </div>
            </div>
        </CardShell>
    );
}

/* ─────────────────────────────────────────────────────────────
   CONTROLLABLE EXPENSES CARD
───────────────────────────────────────────────────────────── */
function ControllableCard({ data }) {
    const cats   = data?.categories || [];
    const maxAmt = Math.max(...cats.map(c => c.monthly_amount || 0), 1);

    return (
        <CardShell>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sl-t3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Most Important</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--sl-t1)', marginBottom: 20 }}>What You Can Control This Month</div>
            <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: cats.length > 4 ? cats.length * 90 : 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {cats.map((cat, i) => {
                        const pct    = Math.min(100, (cat.monthly_amount / maxAmt) * 100);
                        const recPct = cat.recommended_max ? Math.min(100, (cat.recommended_max / maxAmt) * 100) : pct * 0.7;
                        const isOver = cat.monthly_amount > (cat.recommended_max || cat.monthly_amount);
                        return (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sl-t2)' }}>{cat.name}</span>
                                    <span style={{ fontSize: 12, color: isOver ? '#EF4444' : '#10B981', fontWeight: 700 }}>{fmt(cat.monthly_amount)}</span>
                                </div>
                                <div style={{ position: 'relative', height: 12, background: 'var(--sl-border)', borderRadius: 6, overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: isOver ? '#EF4444' : '#10B981', borderRadius: 6, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
                                    <div style={{ position: 'absolute', left: `${recPct}%`, top: 0, width: 2, height: '100%', background: '#F59E0B', opacity: 0.9 }} />
                                </div>
                                {cat.verdict && <div style={{ fontSize: 11, color: 'var(--sl-t3)', marginTop: 3 }}>{cat.verdict}</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
            {data?.total_potential_saving > 0 && (
                <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#10B981' }}>{fmt(data.total_potential_saving)}</div>
                    <div style={{ fontSize: 12, color: 'var(--sl-t3)', marginTop: 2 }}>potential monthly saving if you follow these reductions</div>
                </div>
            )}
            {data?.top_3_actions?.length > 0 && (
                <ol style={{ marginTop: 16, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.top_3_actions.map((action, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#10B981', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                            <span style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.5 }}>{action}</span>
                        </li>
                    ))}
                </ol>
            )}
        </CardShell>
    );
}

/* ─────────────────────────────────────────────────────────────
   RISK SIGNALS CARD
───────────────────────────────────────────────────────────── */
function RisksCard({ data }) {
    const risks = Array.isArray(data) ? data : [];
    const dotColor = { critical: '#EF4444', warning: '#F59E0B', info: '#6366F1' };

    return (
        <CardShell>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sl-t1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#EF4444', display: 'flex' }}><WarnIco /></span>
                Financial Risk Signals
            </div>
            {risks.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--sl-t3)', margin: 0 }}>No critical risk signals detected.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {risks.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor[r.severity] || '#94A3B8', flexShrink: 0, marginTop: 5 }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.55, margin: 0 }}>{r.signal}</p>
                                {r.action_label && (
                                    <a href={r.action_url || '/transactions'}
                                        style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 4, display: 'inline-block', textDecoration: 'none' }}>
                                        {r.action_label} →
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardShell>
    );
}

/* ─────────────────────────────────────────────────────────────
   INCOME TREND CARD
───────────────────────────────────────────────────────────── */
function IncomeCard({ data }) {
    const history     = data?.history || [];
    const pct         = data?.percentage_change ?? 0;
    const isGrowing   = data?.trend === 'growing';
    const isDeclining = data?.trend === 'declining';
    const trendColor  = isGrowing ? '#10B981' : isDeclining ? '#EF4444' : '#6366F1';

    return (
        <CardShell>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sl-t1)', marginBottom: 8 }}>Income Trend</div>
            {history.length > 0 && (
                <div style={{ height: 80, marginBottom: 12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                            <Line type="monotone" dataKey="amount" stroke={trendColor} strokeWidth={2.5} dot={false} />
                            <Tooltip
                                formatter={(v) => [fmt(v), 'Income']}
                                contentStyle={{ background: 'var(--sl-surface)', border: '1px solid var(--sl-border)', borderRadius: 8, fontSize: 12 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: trendColor, textTransform: 'capitalize' }}>{data?.trend || '—'}</span>
                {pct !== 0 && (
                    <span style={{ fontSize: 12, padding: '2px 9px', borderRadius: 99, background: `${trendColor}18`, color: trendColor, fontWeight: 700 }}>
                        {pct > 0 ? '+' : ''}{pct}%
                    </span>
                )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.6, margin: 0 }}>{data?.insight}</p>
        </CardShell>
    );
}

/* ─────────────────────────────────────────────────────────────
   BUDGET PERFORMANCE CARD
───────────────────────────────────────────────────────────── */
function BudgetsCard({ data }) {
    const budgets = Array.isArray(data) ? data : [];

    return (
        <CardShell>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sl-t1)', marginBottom: 16 }}>Budget Performance</div>
            {budgets.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--sl-t3)', margin: 0 }}>No active budgets found.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {budgets.map((b, i) => {
                        const pct   = Math.min(100, b.percentage || 0);
                        const color = pct >= 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : pct >= 60 ? '#FBBF24' : '#10B981';
                        return (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sl-t2)' }}>{b.category || b.name}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 11, color: 'var(--sl-t3)' }}>{fmt(b.spent)} / {fmt(b.limit)}</span>
                                        {pct >= 100 && (
                                            <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.12)', padding: '1px 6px', borderRadius: 99 }}>EXCEEDED</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ height: 6, background: 'var(--sl-border)', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
                                </div>
                                <div style={{ fontSize: 10, color, fontWeight: 600, marginTop: 3 }}>{pct}%</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </CardShell>
    );
}

/* ─────────────────────────────────────────────────────────────
   ACTION PLAN CARD
───────────────────────────────────────────────────────────── */
function ActionPlanCard({ data }) {
    const actions = data?.actions || [];

    return (
        <CardShell>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Priority Actions</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--sl-t1)', marginBottom: 20 }}>Your 30-Day Financial Action Plan</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                {actions.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: 16, background: 'var(--sl-surface-2)', borderRadius: 10, border: '1px solid var(--sl-border)' }}>
                        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--sl-border)', lineHeight: 1, flexShrink: 0 }}>
                            {String(a.rank || i + 1).padStart(2, '0')}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sl-t1)', marginBottom: 4 }}>{a.title}</div>
                            <p style={{ fontSize: 12, color: 'var(--sl-t2)', lineHeight: 1.55, margin: '0 0 8px' }}>{a.description}</p>
                            {a.impact_pkr > 0 && (
                                <div style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>Save: {fmt(a.impact_pkr)}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {data?.total_30_day_saving > 0 && (
                <div style={{ marginTop: 20, textAlign: 'center', padding: 16, background: 'rgba(16,185,129,0.06)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)' }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#10B981' }}>{fmt(data.total_30_day_saving)}</div>
                    <div style={{ fontSize: 12, color: 'var(--sl-t3)', marginTop: 2 }}>total savings potential this month if all actions followed</div>
                </div>
            )}
        </CardShell>
    );
}

/* ─────────────────────────────────────────────────────────────
   AI CHAT — safe plain-text renderer
───────────────────────────────────────────────────────────── */
function AiMessage({ text }) {
    const lines = (text || '').split('\n').filter(Boolean);
    return (
        <div style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.65 }}>
            {lines.map((line, i) => {
                const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
                const isNum    = /^\d+\./.test(line.trim());
                return (
                    <p key={i} style={{ margin: i > 0 ? '6px 0 0' : 0, paddingLeft: isBullet || isNum ? 12 : 0 }}>
                        {isBullet ? '• ' + line.replace(/^[-•]\s*/, '') : line}
                    </p>
                );
            })}
        </div>
    );
}

function AskAISection() {
    const [chatLog, setChatLog]   = useState([]);
    const [question, setQuestion] = useState('');
    const [asking, setAsking]     = useState(false);
    const chatEndRef              = useRef(null);

    const suggestions = [
        "What's my biggest money problem?",
        'Which subscription should I cancel?',
        'How to save PKR 20,000 this month?',
        'Am I spending too much on any category?',
        'Predict my balance end of month',
    ];

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLog]);

    const askQuestion = async (q) => {
        const text = q || question.trim();
        if (!text) return;
        setQuestion('');
        setChatLog(prev => [...prev, { role: 'user', text }]);
        setAsking(true);
        try {
            const r = await fetch('/ai-insights/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' },
                body: JSON.stringify({ question: text }),
            });
            const d = await r.json();
            setChatLog(prev => [...prev, { role: 'ai', text: d.answer || d.error || 'No response.' }]);
        } catch {
            setChatLog(prev => [...prev, { role: 'ai', text: 'Error connecting to AI. Please try again.' }]);
        }
        setAsking(false);
    };

    return (
        <div className="card" style={{ marginBottom: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ color: '#A78BFA' }}><SparkleIco /></span>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sl-t1)' }}>Ask AI about your finances</div>
            </div>

            {chatLog.length === 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {suggestions.map(s => (
                        <button key={s} onClick={() => askQuestion(s)}
                            style={{ padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.25)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(167,139,250,0.1)'}
                        >{s}</button>
                    ))}
                </div>
            )}

            {chatLog.length > 0 && (
                <div style={{ maxHeight: 420, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {chatLog.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            {msg.role === 'ai' ? (
                                <div style={{ maxWidth: '85%', padding: '14px 16px', borderRadius: 14, borderBottomLeftRadius: 4, background: 'var(--sl-surface-2)', border: '1px solid var(--sl-border)' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', marginBottom: 8 }}>AI Advisor</div>
                                    <AiMessage text={msg.text} />
                                </div>
                            ) : (
                                <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: 14, borderBottomRightRadius: 4, background: '#0F172A', color: '#F1F5F9', fontSize: 13, lineHeight: 1.55 }}>
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    ))}
                    {asking && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div style={{ padding: '12px 18px', borderRadius: 14, background: 'var(--sl-surface-2)', display: 'flex', gap: 5, alignItems: 'center' }}>
                                {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: `pulse-dot 1s ease infinite ${i * 0.2}s` }} />)}
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
                <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !asking && askQuestion()}
                    placeholder="Ask about your spending, savings, or budget…"
                    className="input-field" style={{ flex: 1 }} disabled={asking}
                />
                <button onClick={() => askQuestion()} disabled={asking || !question.trim()}
                    style={{ width: 44, height: 44, borderRadius: 10, background: '#A78BFA', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (asking || !question.trim()) ? 0.5 : 1, transition: 'opacity 150ms' }}>
                    <SendIco />
                </button>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const CARD_NAMES = ['health', 'controllable', 'risks', 'income', 'budgets', 'plan'];

function timeAgoFmt(dateStr) {
    if (!dateStr) return null;
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function AIInsightsIndex({ isSetup, isCached, cachedAt, currency }) {
    const [cardData, setCardData]   = useState({});
    const [cardState, setCardState] = useState(() => Object.fromEntries(CARD_NAMES.map(c => [c, 'loading'])));
    // view: 'idle' = show generate CTA | 'generating' = loading animation | 'showing' = show cards
    const [view, setView]           = useState(isCached ? 'showing' : 'idle');
    const [refreshing, setRefreshing] = useState(false);

    const loadCard = useCallback(async (card) => {
        setCardState(prev => ({ ...prev, [card]: 'loading' }));
        try {
            const r = await fetch(`/ai-insights/card/${card}`, { headers: { Accept: 'application/json' } });
            if (!r.ok) throw new Error('Failed');
            const d = await r.json();
            setCardData(prev => ({ ...prev, [card]: d.data }));
            setCardState(prev => ({ ...prev, [card]: 'ready' }));
        } catch {
            setCardState(prev => ({ ...prev, [card]: 'error' }));
        }
    }, []);

    const loadAllCards = useCallback(() => {
        CARD_NAMES.forEach((card, i) => setTimeout(() => loadCard(card), i * 80));
    }, [loadCard]);

    // If cached, load from server cache immediately on mount (no animation)
    useEffect(() => {
        if (isCached) loadAllCards();
    }, []); // eslint-disable-line

    const handleLoadingDone = useCallback(() => {
        setView('showing');
        loadAllCards();
    }, [loadAllCards]);

    const generate = () => {
        setCardData({});
        setCardState(Object.fromEntries(CARD_NAMES.map(c => [c, 'loading'])));
        setView('generating');
    };

    const fetchLatest = async () => {
        setRefreshing(true);
        try {
            await fetch('/ai-insights/refresh', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' } });
        } catch {}
        setRefreshing(false);
        setCardData({});
        setCardState(Object.fromEntries(CARD_NAMES.map(c => [c, 'loading'])));
        setView('generating');
    };

    const renderCard = (key) => {
        if (cardState[key] === 'loading') return <CardSkeleton key={key} />;
        if (cardState[key] === 'error')   return <CardError key={key} onRetry={() => loadCard(key)} />;
        const d = cardData[key];
        switch (key) {
            case 'health':       return <HealthScoreCard key={key} data={d} />;
            case 'controllable': return <ControllableCard key={key} data={d} currency={currency} />;
            case 'risks':        return <RisksCard key={key} data={d} />;
            case 'income':       return <IncomeCard key={key} data={d} currency={currency} />;
            case 'budgets':      return <BudgetsCard key={key} data={d} />;
            case 'plan':         return <ActionPlanCard key={key} data={d} currency={currency} />;
            default: return null;
        }
    };

    /* ── Not set up ── */
    if (!isSetup) {
        return (
            <AppLayout>
                <Head title="AI Insights" />
                <div className="page-header" style={{ marginBottom: 28 }}>
                    <div>
                        <h1 className="page-title">AI Insights</h1>
                        <p className="page-subtitle">Smart financial analysis powered by AI</p>
                    </div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 20px', background: 'rgba(167,139,250,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}>
                        <SparkleIco />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--sl-t1)', marginBottom: 10 }}>Connect your AI to unlock financial insights</div>
                    <p style={{ fontSize: 14, color: 'var(--sl-t3)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
                        Add your OpenAI or Anthropic Claude API key in Settings to get personalized financial advice, spending analysis, and more — all based on your real data.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
                        {['Financial health score', 'Spending alerts', 'Income trend analysis', 'Savings opportunities', 'Budget coaching', 'Ask any question'].map(f => (
                            <span key={f} style={{ padding: '5px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: 99, fontSize: 13, color: '#10B981', fontWeight: 500 }}>{f}</span>
                        ))}
                    </div>
                    <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#0F172A', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                        <SettingsIco /> Open AI Settings
                    </Link>
                </div>
            </AppLayout>
        );
    }

    const CardsView = () => (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div style={{ marginBottom: 16 }}>{renderCard('health')}</div>
            <div style={{ marginBottom: 16 }}>{renderCard('controllable')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16, marginBottom: 16 }}>
                {renderCard('risks')}
                {renderCard('income')}
                {renderCard('budgets')}
            </div>
            <div style={{ marginBottom: 24 }}>{renderCard('plan')}</div>
            <AskAISection />
        </motion.div>
    );

    return (
        <AppLayout>
            <Head title="AI Insights" />
            <style>{SHIMMER_STYLE}</style>

            <div className="page-header" style={{ marginBottom: 24 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#A78BFA' }}><SparkleIco /></span> AI Insights
                    </h1>
                    <p className="page-subtitle">Personalized financial analysis</p>
                </div>
                {view === 'showing' && (
                    <button onClick={fetchLatest} disabled={refreshing}
                        className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ display: 'inline-flex', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}><RefreshIco /></span>
                        {refreshing ? 'Clearing cache…' : 'Fetch Latest'}
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                            <div style={{ width: 64, height: 64, margin: '0 auto 20px', background: 'rgba(167,139,250,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}>
                                <SparkleIco />
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--sl-t1)', marginBottom: 10 }}>
                                Ready to analyse your finances
                            </div>
                            <p style={{ fontSize: 14, color: 'var(--sl-t3)', maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.7 }}>
                                AI will review your last 3 months of transactions, budgets, loans, and subscriptions to generate personalized insights.
                            </p>
                            <button onClick={generate}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
                                <SparkleIco /> Generate AI Insights
                            </button>
                        </div>
                    </motion.div>
                )}

                {view === 'generating' && (
                    <motion.div key="generating" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}>
                        <LoadingScreen isCached={false} onDone={handleLoadingDone} />
                    </motion.div>
                )}

                {view === 'showing' && (
                    <motion.div key="showing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                        {cachedAt && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16, padding: '12px 18px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ color: '#10B981', display: 'flex' }}><RefreshIco /></span>
                                    <span style={{ fontSize: 13, color: 'var(--sl-t2)', fontWeight: 500 }}>
                                        Last generated <strong style={{ color: 'var(--sl-t1)' }}>{timeAgoFmt(cachedAt)}</strong>
                                        <span style={{ color: 'var(--sl-t3)', marginLeft: 6, fontSize: 12 }}>
                                            ({new Date(cachedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })})
                                        </span>
                                    </span>
                                </div>
                                <button onClick={fetchLatest} disabled={refreshing}
                                    style={{ fontSize: 12, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ display: 'inline-flex', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}><RefreshIco /></span>
                                    {refreshing ? 'Clearing…' : 'Fetch Latest'}
                                </button>
                            </div>
                        )}
                        <CardsView />
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
