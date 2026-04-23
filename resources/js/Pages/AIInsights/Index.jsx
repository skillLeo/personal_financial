import { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/* ── Icons ── */
const SparkleIco = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const RefreshIco = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const SendIco = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const SettingsIco = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const Spinner = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content;

/* ── Skeleton card ── */
const SkeletonCard = () => (
    <div className="card" style={{ minHeight: 140 }}>
        <div className="ai-skeleton" style={{ height: 14, width: '60%', borderRadius: 6, marginBottom: 12 }} />
        <div className="ai-skeleton" style={{ height: 11, width: '90%', borderRadius: 6, marginBottom: 8 }} />
        <div className="ai-skeleton" style={{ height: 11, width: '75%', borderRadius: 6, marginBottom: 8 }} />
        <div className="ai-skeleton" style={{ height: 11, width: '50%', borderRadius: 6 }} />
    </div>
);

/* ── Score circle ── */
function ScoreCircle({ score }) {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, score || 0));
    const offset = circ - (pct / 100) * circ;
    const color = pct >= 70 ? '#10B981' : pct >= 40 ? '#FBBF24' : '#EF4444';

    return (
        <svg width={128} height={128} viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="64" cy="64" r={r} fill="none" stroke="var(--sl-border)" strokeWidth="10" />
            <circle
                cx="64" cy="64" r={r} fill="none"
                stroke={color} strokeWidth="10"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
        </svg>
    );
}

/* ── Insight card ── */
function InsightCard({ title, icon, borderColor = '#334155', children }) {
    return (
        <div className="card" style={{ borderLeft: `4px solid ${borderColor}`, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sl-t1)' }}>{title}</div>
            </div>
            {children}
        </div>
    );
}

/* ── Main page ── */
export default function AIInsightsIndex({ isSetup, insights: initialInsights, currency }) {
    const [insights, setInsights]   = useState(initialInsights);
    const [refreshing, setRefreshing] = useState(false);
    const [chatLog, setChatLog]     = useState([]);
    const [question, setQuestion]   = useState('');
    const [asking, setAsking]       = useState(false);
    const chatEndRef                = useRef(null);

    const suggestions = [
        'What should I cut this month?',
        'Am I spending too much on food?',
        'How can I save faster?',
        'What is my biggest financial risk?',
        'Which expense is most wasteful?',
    ];

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog]);

    const refreshInsights = async () => {
        setRefreshing(true);
        try {
            const r = await fetch('/ai-insights/refresh', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' } });
            const d = await r.json();
            if (d.error) { toast.error(d.error); } else { setInsights(d.insights); toast.success('Insights refreshed!'); }
        } catch { toast.error('Refresh failed.'); }
        setRefreshing(false);
    };

    const askQuestion = async (q) => {
        const text = q || question.trim();
        if (!text) return;
        setQuestion('');
        setChatLog(prev => [...prev, { role: 'user', text }]);
        setAsking(true);
        try {
            const r = await fetch('/ai-insights/ask', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' }, body: JSON.stringify({ question: text }) });
            const d = await r.json();
            setChatLog(prev => [...prev, { role: 'ai', text: d.answer || d.error || 'No response.' }]);
        } catch { setChatLog(prev => [...prev, { role: 'ai', text: 'Error connecting to AI. Please try again.' }]); }
        setAsking(false);
    };

    /* ── Not set up state ── */
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
                    <div style={{ fontSize: 56, marginBottom: 20 }}>🤖</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--sl-t1)', marginBottom: 10 }}>Connect your AI to unlock financial insights</div>
                    <p style={{ fontSize: 14, color: 'var(--sl-t3)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
                        Add your OpenAI or Anthropic Claude API key in Settings to get personalized financial advice, spending analysis, budget coaching, and more — all based on your real data.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
                        {['Financial health score','Spending alerts','Income trend analysis','Savings opportunities','Budget coaching','Ask any question'].map(f => (
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

    const hs = insights?.health_score;
    const ts = insights?.top_spending;
    const it = insights?.income_trend;
    const ue = insights?.unnecessary_expenses;
    const ls = insights?.loan_situation;
    const bp = insights?.budget_performance;
    const so = insights?.savings_opportunity;

    const scoreLabel = hs?.label || (hs?.score >= 70 ? 'Good' : hs?.score >= 40 ? 'Needs Attention' : 'Critical');
    const scoreColor = hs?.score >= 70 ? '#10B981' : hs?.score >= 40 ? '#FBBF24' : '#EF4444';

    return (
        <AppLayout>
            <Head title="AI Insights" />

            {/* Header */}
            <div className="page-header" style={{ marginBottom: 24 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#A78BFA' }}><SparkleIco /></span> AI Insights
                    </h1>
                    <p className="page-subtitle">Personalized financial analysis • refreshed every 6 hours</p>
                </div>
                <button onClick={refreshInsights} disabled={refreshing} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {refreshing ? <><Spinner /> Refreshing…</> : <><RefreshIco /> Refresh Insights</>}
                </button>
            </div>

            {/* ── SECTION 1: Health Score ── */}
            <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, var(--sl-surface) 0%, var(--sl-surface-2) 100%)' }}>
                {!insights ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                        <div className="ai-skeleton" style={{ width: 128, height: 128, borderRadius: '50%' }} />
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div className="ai-skeleton" style={{ height: 18, width: '40%', borderRadius: 6, marginBottom: 10 }} />
                            <div className="ai-skeleton" style={{ height: 13, width: '70%', borderRadius: 6 }} />
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <ScoreCircle score={hs?.score} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor, letterSpacing: '-1px' }}>{hs?.score ?? '--'}</div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sl-t3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>/ 100</div>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor, letterSpacing: '-0.5px', marginBottom: 6 }}>{scoreLabel}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sl-t1)', marginBottom: 10 }}>Financial Health Score</div>
                            <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.65, maxWidth: 480 }}>{hs?.summary || 'Your financial health is being analyzed…'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── SECTION 2: Insight Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16, marginBottom: 24 }}>

                {/* Card 1: Top Spending */}
                {!insights ? <SkeletonCard /> : (
                    <InsightCard title="Highest Expense Category" icon="🔥" borderColor={ts?.level === 'danger' ? '#EF4444' : ts?.level === 'warning' ? '#FBBF24' : '#10B981'}>
                        {ts ? (
                            <>
                                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--sl-t1)', marginBottom: 6 }}>{ts.category}</div>
                                {ts.amount && <div style={{ fontSize: 13, color: 'var(--sl-t3)', marginBottom: 8 }}>{currency} {Number(ts.amount).toLocaleString()}</div>}
                                <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.6 }}>{ts.insight}</p>
                            </>
                        ) : <p style={{ fontSize: 13, color: 'var(--sl-t3)' }}>No spending data this month.</p>}
                    </InsightCard>
                )}

                {/* Card 2: Income Trend */}
                {!insights ? <SkeletonCard /> : (
                    <InsightCard title="Income Trend" icon={it?.trend === 'growing' ? '📈' : it?.trend === 'declining' ? '📉' : '➡️'} borderColor={it?.trend === 'growing' ? '#10B981' : it?.trend === 'declining' ? '#EF4444' : '#6366F1'}>
                        {it ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 15, fontWeight: 800, textTransform: 'capitalize', color: it.trend === 'growing' ? '#10B981' : it.trend === 'declining' ? '#EF4444' : '#6366F1' }}>{it.trend}</span>
                                    {it.percentage_change != null && <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 99, background: it.trend === 'growing' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: it.trend === 'growing' ? '#10B981' : '#EF4444', fontWeight: 600 }}>{it.percentage_change > 0 ? '+' : ''}{it.percentage_change}%</span>}
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.6 }}>{it.insight}</p>
                            </>
                        ) : <p style={{ fontSize: 13, color: 'var(--sl-t3)' }}>Insufficient income data.</p>}
                    </InsightCard>
                )}

                {/* Card 3: Unnecessary Expenses */}
                {!insights ? <SkeletonCard /> : (
                    <InsightCard title="Savings Opportunity" icon="✂️" borderColor="#F59E0B">
                        {ue ? (
                            <>
                                {ue.potential_savings != null && <div style={{ fontSize: 20, fontWeight: 900, color: '#10B981', marginBottom: 6 }}>{currency} {Number(ue.potential_savings).toLocaleString()}</div>}
                                <div style={{ fontSize: 11, color: 'var(--sl-t3)', marginBottom: 8 }}>potential monthly savings</div>
                                {ue.categories?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                                        {ue.categories.map(c => <span key={c} style={{ fontSize: 11, padding: '2px 8px', background: 'rgba(245,158,11,0.12)', color: '#F59E0B', borderRadius: 99 }}>{c}</span>)}
                                    </div>
                                )}
                                <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.6 }}>{ue.insight}</p>
                            </>
                        ) : <p style={{ fontSize: 13, color: 'var(--sl-t3)' }}>Not enough expense data.</p>}
                    </InsightCard>
                )}

                {/* Card 4: Loans */}
                {!insights ? <SkeletonCard /> : (
                    <InsightCard title="Loan & Debt Situation" icon={ls?.is_urgent ? '🚨' : '💳'} borderColor={ls?.is_urgent ? '#EF4444' : '#6366F1'}>
                        {ls ? (
                            <>
                                {ls.is_urgent && <div style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>⚠️ URGENT — overdue loans</div>}
                                <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
                                    {ls.overdue_count != null && <div><div style={{ fontSize: 18, fontWeight: 900, color: ls.is_urgent ? '#EF4444' : 'var(--sl-t1)' }}>{ls.overdue_count}</div><div style={{ fontSize: 11, color: 'var(--sl-t3)' }}>overdue</div></div>}
                                    {ls.total_overdue != null && <div><div style={{ fontSize: 18, fontWeight: 900, color: 'var(--sl-t1)' }}>{Number(ls.total_overdue).toLocaleString()}</div><div style={{ fontSize: 11, color: 'var(--sl-t3)' }}>overdue {currency}</div></div>}
                                </div>
                                {ls.debt_to_income && <div style={{ fontSize: 12, color: 'var(--sl-t3)', marginBottom: 6 }}>Debt-to-income: {ls.debt_to_income}</div>}
                                <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.6 }}>{ls.insight}</p>
                            </>
                        ) : <p style={{ fontSize: 13, color: 'var(--sl-t3)' }}>No active loans found.</p>}
                    </InsightCard>
                )}

                {/* Card 5: Budget */}
                {!insights ? <SkeletonCard /> : (
                    <InsightCard title="Budget Performance" icon="📊" borderColor="#60A5FA">
                        {bp ? (
                            <>
                                <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                                    {[['🔴 Over', bp.over_budget?.length || 0, '#EF4444'], ['🟡 Near limit', bp.near_limit?.length || 0, '#FBBF24'], ['🟢 On track', bp.on_track?.length || 0, '#10B981']].map(([label, val, color]) => (
                                        <div key={label} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 20, fontWeight: 900, color }}>{val}</div>
                                            <div style={{ fontSize: 10, color: 'var(--sl-t3)' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.6 }}>{bp.insight}</p>
                            </>
                        ) : <p style={{ fontSize: 13, color: 'var(--sl-t3)' }}>No active budgets found.</p>}
                    </InsightCard>
                )}

                {/* Card 6: Savings */}
                {!insights ? <SkeletonCard /> : (
                    <InsightCard title="Realistic Savings Goal" icon="🏦" borderColor="#10B981">
                        {so ? (
                            <>
                                {so.potential_savings != null && <div style={{ fontSize: 22, fontWeight: 900, color: '#10B981', marginBottom: 4 }}>{currency} {Number(so.potential_savings).toLocaleString()}</div>}
                                <div style={{ fontSize: 11, color: 'var(--sl-t3)', marginBottom: 8 }}>you could save per month</div>
                                {so.top_cut && <div style={{ fontSize: 12, marginBottom: 8, color: 'var(--sl-t2)' }}>Start with: <strong>{so.top_cut}</strong></div>}
                                <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.6 }}>{so.insight}</p>
                            </>
                        ) : <p style={{ fontSize: 13, color: 'var(--sl-t3)' }}>Add more transactions to see savings opportunities.</p>}
                    </InsightCard>
                )}
            </div>

            {/* ── SECTION 3: Ask AI ── */}
            <div className="card" style={{ marginBottom: 80 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <span style={{ color: '#A78BFA' }}><SparkleIco /></span>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sl-t1)' }}>Ask AI about your finances</div>
                </div>

                {/* Suggestions */}
                {chatLog.length === 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                        {suggestions.map(s => (
                            <button key={s} onClick={() => askQuestion(s)} style={{ padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.25)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(167,139,250,0.1)'}
                            >{s}</button>
                        ))}
                    </div>
                )}

                {/* Chat log */}
                {chatLog.length > 0 && (
                    <div style={{ maxHeight: 380, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {chatLog.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '80%', padding: '12px 16px', borderRadius: 14, fontSize: 13, lineHeight: 1.65,
                                    background: msg.role === 'user' ? '#0F172A' : 'var(--sl-surface-2)',
                                    color: msg.role === 'user' ? '#F1F5F9' : 'var(--sl-t2)',
                                    borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
                                    borderBottomLeftRadius: msg.role === 'ai' ? 4 : 14,
                                }}>
                                    {msg.role === 'ai' && <div style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', marginBottom: 5 }}>🤖 AI Advisor</div>}
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {asking && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{ padding: '12px 20px', borderRadius: 14, background: 'var(--sl-surface-2)', display: 'flex', gap: 5, alignItems: 'center' }}>
                                    {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: `pulse-dot 1s ease infinite ${i * 0.2}s` }} />)}
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}

                {/* Input */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        type="text"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !asking && askQuestion()}
                        placeholder="Ask about your spending, savings, or budget…"
                        className="input-field"
                        style={{ flex: 1 }}
                        disabled={asking}
                    />
                    <button onClick={() => askQuestion()} disabled={asking || !question.trim()} style={{
                        width: 44, height: 44, borderRadius: 10, background: '#A78BFA', color: '#fff',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, opacity: (asking || !question.trim()) ? 0.5 : 1, transition: 'opacity 150ms',
                    }}>
                        <SendIco />
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
