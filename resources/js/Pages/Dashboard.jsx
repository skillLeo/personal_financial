import { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

/* ── Count-up hook ──────────────────────────────────────── */
function useCountUp(target, duration = 1100) {
    const [value, setValue] = useState(0);
    const frame = useRef(null);
    useEffect(() => {
        const numTarget = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
        if (numTarget === 0) { setValue(0); return; }
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * numTarget));
            if (progress < 1) frame.current = requestAnimationFrame(step);
            else setValue(numTarget);
        };
        frame.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame.current);
    }, [target, duration]);
    return value;
}

/* ── Animated currency value ────────────────────────────── */
function AnimatedAmount({ value, color }) {
    const num = typeof value === 'number' ? value : parseFloat(String(value || '').replace(/[^0-9.-]/g, '')) || 0;
    const animated = useCountUp(Math.abs(num));
    const isNeg = num < 0;
    const display = `Rs. ${animated.toLocaleString('en-PK')}`;
    return <span style={{ color }}>{isNeg ? '-' : ''}{display}</span>;
}

/* ── Chart tooltip ──────────────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0F172A', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', minWidth: 160 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: '#94A3B8', fontSize: 12 }}>{p.name}:</span>
                    <span style={{ color: '#F8FAFC', fontWeight: 700, fontSize: 13 }}>Rs. {Number(p.value).toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

/* ── Icons ──────────────────────────────────────────────── */
const TrendUp   = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const TrendDown = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
const Scale     = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v19"/><path d="M5 12H2L12 3l10 9h-3"/><path d="M5 12l-3 6h6z"/><path d="M19 12l-3 6h6z"/></svg>;
const Bank      = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>;
const AlertCircle = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const RefreshIcon = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
const PlusCirc  = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const MinusCirc = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const HandCoin  = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg>;
const Transfer  = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"/></svg>;
const CreditCard = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const ArrowRight = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const ArrowUpIcon = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const CloseIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

/* ── Stat Card ──────────────────────────────────────────── */
function StatCard({ label, rawValue, prefix = 'Rs.', suffix, accent, iconBg, icon, trend, trendLabel }) {
    const animated = useCountUp(rawValue || 0);
    const isNeg = (rawValue || 0) < 0;

    return (
        <div className="stat-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#7A8899', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0, opacity: 0.85 }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.6px', lineHeight: 1, color: '#0D1117', marginBottom: 10 }}>
                {isNeg ? '-' : ''}{prefix} {Math.abs(animated).toLocaleString('en-PK')}{suffix}
            </div>
            {trend !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={trend >= 0 ? 'trend-up' : 'trend-down'}>
                        {trend >= 0 ? ArrowUpIcon : ArrowUpIcon}
                        {Math.abs(trend)}%
                    </span>
                    <span style={{ fontSize: 11, color: '#7A8899' }}>{trendLabel || 'vs last month'}</span>
                </div>
            )}
        </div>
    );
}

export default function Dashboard({ stats, recent_transactions, chart_data, top_categories, accounts, upcoming_subscriptions, pending_loans_count, pending_loans_total, budget_alerts }) {
    const [dismissedAlerts, setDismissedAlerts] = useState([]);
    const [chartRange, setChartRange] = useState('7d');
    const visibleAlerts = budget_alerts?.filter((_, i) => !dismissedAlerts.includes(i)) || [];

    const income   = stats?.income   || 0;
    const expenses = stats?.expenses || 0;
    const net      = stats?.net_balance ?? (income - expenses);
    const savings  = stats?.savings  || 0;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* ── Page Header ───────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Dashboard</h1>
                    <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Financial overview — live data from all accounts</p>
                </div>
                <Link href="/transactions/create" className="btn-primary" style={{ fontSize: 13, padding: '10px 20px' }}>
                    {PlusIcon}
                    Add Transaction
                </Link>
            </div>

            {/* ── Stat Cards ────────────────────────────────── */}
            <div className="dash-stat-grid" style={{ marginBottom: 20 }}>
                <StatCard label="Income This Month" rawValue={income}   accent="#10B981" iconBg="#ECFDF5" icon={TrendUp}   trend={stats?.income_trend} />
                <StatCard label="Expenses This Month" rawValue={expenses} accent="#EF4444" iconBg="#FEF2F2" icon={TrendDown} trend={stats?.expense_trend} />
                <StatCard label="Net Balance"         rawValue={net}      accent={net >= 0 ? '#10B981' : '#EF4444'} iconBg={net >= 0 ? '#ECFDF5' : '#FEF2F2'} icon={Scale} />
                <StatCard label="Total Savings"       rawValue={savings}  accent="#8B5CF6" iconBg="#F5F3FF" icon={Bank} />
            </div>

            {/* ── Alert Banners ─────────────────────────────── */}
            {(visibleAlerts.length > 0 || upcoming_subscriptions?.length > 0 || pending_loans_count > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {pending_loans_count > 0 && (
                        <div className="alert alert-warning" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                                <span style={{ flexShrink: 0 }}>{AlertCircle}</span>
                                <span style={{ fontSize: 13 }}>
                                    {pending_loans_count} pending loan{pending_loans_count > 1 ? 's' : ''} — total{' '}
                                    <strong style={{ color: '#92400E' }}>{pending_loans_total}</strong>
                                </span>
                            </div>
                            <Link href="/loans" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#92400E', whiteSpace: 'nowrap', textDecoration: 'none' }}>
                                View {ArrowRight}
                            </Link>
                        </div>
                    )}
                    {upcoming_subscriptions?.map(s => (
                        <div key={s.id} className={`alert ${s.days_until <= 1 ? 'alert-danger' : 'alert-info'}`} style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                                <span style={{ flexShrink: 0 }}>{RefreshIcon}</span>
                                <span style={{ fontSize: 13 }}>
                                    <strong>{s.name}</strong> renews {s.days_until === 0 ? 'TODAY' : `in ${s.days_until} day${s.days_until > 1 ? 's' : ''}`} — <strong>{s.formatted}</strong>
                                </span>
                            </div>
                            <Link href="/subscriptions" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'inherit', whiteSpace: 'nowrap' }}>
                                Manage {ArrowRight}
                            </Link>
                        </div>
                    ))}
                    {visibleAlerts.map((alert, i) => (
                        <div key={i} className="alert alert-warning" style={{ justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13 }}>Budget <strong>{alert.name}</strong> is at <strong>{alert.percentage}%</strong> of limit</span>
                            <button onClick={() => setDismissedAlerts(d => [...d, i])}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', padding: 0, display: 'flex' }}>
                                {CloseIcon}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Main Grid: Chart + Right Panel ────────────── */}
            <div className="dash-main-grid">

                {/* Cash Flow Chart */}
                <div className="card" style={{ padding: '22px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.2px' }}>Cash Flow</div>
                            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>Income vs Expenses — last 7 days</div>
                        </div>
                        <div style={{ display: 'flex', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 3, gap: 2 }}>
                            {['7d','30d','90d'].map(r => (
                                <button key={r} onClick={() => setChartRange(r)}
                                    style={{
                                        height: 28, padding: '0 12px', borderRadius: 6, border: 'none',
                                        fontSize: 12, fontWeight: chartRange === r ? 600 : 500, cursor: 'pointer',
                                        background: chartRange === r ? '#fff' : 'transparent',
                                        color: chartRange === r ? '#0F172A' : '#94A3B8',
                                        boxShadow: chartRange === r ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
                                        transition: 'all 150ms', fontFamily: 'inherit',
                                    }}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={234}>
                        <BarChart data={chart_data} margin={{ top: 0, right: 4, left: -10, bottom: 0 }} barGap={4}>
                            <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={40} />
                            <Tooltip content={<ChartTip />} cursor={{ fill: '#F8FAFC', radius: 6 }} />
                            <Bar dataKey="income"  name="Income"   fill="#10B981" radius={[5,5,0,0]} maxBarSize={26} />
                            <Bar dataKey="expense" name="Expenses" fill="#EF4444" fillOpacity={0.85} radius={[5,5,0,0]} maxBarSize={26} />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
                        {[{ color: '#10B981', label: 'Income' }, { color: '#EF4444', label: 'Expenses' }].map(l => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                                <span style={{ fontSize: 12, color: '#64748B' }}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Accounts */}
                    <div className="card" style={{ padding: '18px 20px', flex: '1 1 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Accounts</div>
                            <Link href="/accounts" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#10B981', fontWeight: 600 }}>
                                Manage {ArrowRight}
                            </Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {accounts?.slice(0, 4).map(acc => (
                                <div key={acc.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 12px', background: '#F8FAFC',
                                    borderRadius: 10, border: '1px solid #F1F5F9',
                                }}>
                                    <div style={{
                                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: (acc.color || '#3B82F6') + '18',
                                        color: acc.color || '#3B82F6',
                                    }}>
                                        {CreditCard}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</div>
                                        <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'capitalize', marginTop: 1 }}>{acc.type}</div>
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: acc.balance >= 0 ? '#10B981' : '#EF4444', flexShrink: 0 }}>
                                        {acc.formatted_balance}
                                    </div>
                                </div>
                            ))}
                            {(!accounts || accounts.length === 0) && (
                                <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, padding: '20px 0' }}>No accounts yet</div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Quick Actions</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {[
                                { label: 'Expense',  href: '/transactions/create?type=expense',  icon: MinusCirc, color: '#EF4444', bg: '#FEF2F2' },
                                { label: 'Income',   href: '/transactions/create?type=income',   icon: PlusCirc,  color: '#10B981', bg: '#ECFDF5' },
                                { label: 'Loan',     href: '/loans',       icon: HandCoin, color: '#F59E0B', bg: '#FFFBEB' },
                                { label: 'Transfer', href: '/transactions/create?type=transfer', icon: Transfer,  color: '#3B82F6', bg: '#EFF6FF' },
                            ].map(a => (
                                <Link key={a.label} href={a.href} className="quick-action">
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color }}>
                                        {a.icon}
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{a.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Grid: Transactions + Categories ─────── */}
            <div className="dash-main-grid" style={{ marginBottom: 0 }}>

                {/* Recent Transactions */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Recent Transactions</div>
                        <Link href="/transactions" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#10B981', fontWeight: 600 }}>
                            View all {ArrowRight}
                        </Link>
                    </div>
                    {!recent_transactions?.length ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8', fontSize: 13 }}>
                            No transactions yet.{' '}
                            <Link href="/transactions/create" style={{ color: '#10B981', fontWeight: 600 }}>Add your first.</Link>
                        </div>
                    ) : (
                        <>
                            {recent_transactions.map((t, i) => (
                                <motion.div
                                    key={t.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '14px 20px',
                                        borderBottom: i < recent_transactions.length - 1 ? '1px solid #F8FAFC' : 'none',
                                        transition: 'background 150ms', cursor: 'default',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#FAFBFD'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Category avatar */}
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: (t.category?.color || '#64748B') + '20',
                                        color: t.category?.color || '#64748B',
                                        fontSize: 13, fontWeight: 800,
                                    }}>
                                        {t.category?.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {t.description || t.category?.name || 'Transaction'}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                                            {[t.category?.name, t.person?.name, t.transaction_date].filter(Boolean).join(' · ')}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 800, flexShrink: 0, color: t.type === 'income' ? '#10B981' : t.type === 'transfer' ? '#8B5CF6' : '#EF4444' }}>
                                        {t.type === 'income' ? '+' : t.type === 'transfer' ? '⇄' : '-'}{t.formatted_amount}
                                    </div>
                                </motion.div>
                            ))}
                        </>
                    )}
                </div>

                {/* Top Expense Categories */}
                <div className="card" style={{ padding: '18px 20px' }}>
                    <div style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.1px' }}>Top Expenses</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>By category this month</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {top_categories?.map((cat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{cat.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{cat.formatted}</span>
                                        <span style={{ fontSize: 11, color: '#94A3B8', background: '#F1F5F9', padding: '1px 6px', borderRadius: 99 }}>{cat.percentage}%</span>
                                    </div>
                                </div>
                                <div className="progress-track">
                                    <motion.div
                                        className="progress-bar"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.percentage}%` }}
                                        transition={{ delay: i * 0.08 + 0.2, duration: 0.7, ease: 'easeOut' }}
                                        style={{ background: cat.color }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                        {(!top_categories || top_categories.length === 0) && (
                            <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, padding: '24px 0' }}>No expense data yet</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
