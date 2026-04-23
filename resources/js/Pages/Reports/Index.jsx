import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const DownloadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

const TABS = ['Income Statement', 'Cash Flow', 'Expense Breakdown', 'Monthly Comparison'];

const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0F172A', color: '#fff', padding: '10px 14px', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: '#94A3B8' }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: '#CBD5E1' }}>{p.name}:</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>Rs. {Number(p.value).toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

export default function ReportsIndex({ income_statement, cash_flow, expense_breakdown, monthly_comparison, filters }) {
    const [activeTab, setActiveTab] = useState(0);
    const [fromDate, setFromDate] = useState(filters?.from_date || '');
    const [toDate, setToDate] = useState(filters?.to_date || '');

    const applyFilters = () => router.get('/reports', { from_date: fromDate, to_date: toDate }, { preserveState: true });
    const exportPdf = () => window.open(`/reports/export-pdf?from_date=${fromDate}&to_date=${toDate}`);
    const exportExcel = () => window.open(`/reports/export-excel?from_date=${fromDate}&to_date=${toDate}`);

    const PRESETS = [
        { label: 'This Month', from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
        { label: 'Last Month', from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0], to: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0] },
        { label: 'This Year', from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
    ];

    return (
        <AppLayout>
            <Head title="Reports" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Financial insights and export tools</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={exportPdf} className="btn btn-secondary">
                        <DownloadIcon /> PDF
                    </button>
                    <button onClick={exportExcel} className="btn btn-secondary">
                        <DownloadIcon /> Excel
                    </button>
                </div>
            </div>

            {/* Date filter */}
            <div className="card" style={{ padding: '14px 18px', marginBottom: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
                    <div>
                        <label className="label">From</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="label">To</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input-field" />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {PRESETS.map(p => (
                            <button key={p.label} onClick={() => { setFromDate(p.from); setToDate(p.to); }} className="btn btn-secondary" style={{ fontSize: 12, padding: '8px 12px' }}>
                                {p.label}
                            </button>
                        ))}
                        <button onClick={applyFilters} className="btn btn-primary" style={{ fontSize: 13 }}>Apply</button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="pill-tabs" style={{ marginBottom: 20, display: 'inline-flex' }}>
                {TABS.map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(i)} className={`pill-tab ${activeTab === i ? 'active' : ''}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Income Statement */}
            {activeTab === 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#10B981' }} />
                            <div className="section-title" style={{ color: '#10B981' }}>Income</div>
                        </div>
                        <div>
                            {income_statement?.income_categories?.map((cat, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8FAFC', fontSize: 13 }}>
                                    <span style={{ color: '#64748B' }}>{cat.name}</span>
                                    <span style={{ fontWeight: 600, color: '#10B981' }}>{cat.formatted}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', fontWeight: 700, fontSize: 15 }}>
                                <span style={{ color: '#0F172A' }}>Total Income</span>
                                <span style={{ color: '#10B981' }}>{income_statement?.income_formatted}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#EF4444' }} />
                            <div className="section-title" style={{ color: '#EF4444' }}>Expenses</div>
                        </div>
                        <div>
                            {income_statement?.expense_categories?.map((cat, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8FAFC', fontSize: 13 }}>
                                    <span style={{ color: '#64748B' }}>{cat.name}</span>
                                    <span style={{ fontWeight: 600, color: '#EF4444' }}>{cat.formatted}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', fontWeight: 700, fontSize: 15 }}>
                                <span style={{ color: '#0F172A' }}>Total Expenses</span>
                                <span style={{ color: '#EF4444' }}>{income_statement?.expense_formatted}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <div className="card" style={{ textAlign: 'center', padding: '32px 24px', background: income_statement?.is_profit ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${income_statement?.is_profit ? '#BBF7D0' : '#FECACA'}` }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                                {income_statement?.is_profit ? 'Net Profit' : 'Net Loss'}
                            </div>
                            <div style={{ fontSize: 40, fontWeight: 800, color: income_statement?.is_profit ? '#10B981' : '#EF4444', letterSpacing: '-1.5px' }}>
                                {income_statement?.is_profit ? '' : '-'}{income_statement?.net_formatted}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cash Flow */}
            {activeTab === 1 && (
                <div className="card">
                    <div className="section-title" style={{ marginBottom: 20 }}>Weekly Cash Flow (Last 12 Weeks)</div>
                    <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={cash_flow} barGap={3} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip content={<ChartTip />} cursor={{ fill: '#F8FAFC' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: 16 }} />
                            <Bar dataKey="income"  name="Income"   fill="#10B981" radius={[5,5,0,0]} maxBarSize={24} />
                            <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[5,5,0,0]} maxBarSize={24} />
                            <Bar dataKey="net"     name="Net"      fill="#3B82F6" radius={[5,5,0,0]} maxBarSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Expense Breakdown */}
            {activeTab === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 16 }}>Expense Breakdown</div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expense_breakdown}
                                    cx="50%" cy="50%"
                                    outerRadius={120}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {expense_breakdown?.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => [`Rs. ${Number(v).toLocaleString()}`, 'Amount']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 16 }}>Category Details</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {expense_breakdown?.map((cat, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                                    <div style={{ flex: 1, fontSize: 13, color: '#0F172A' }}>{cat.name}</div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: '#EF4444' }}>{cat.formatted}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly Comparison */}
            {activeTab === 3 && (
                <div className="card">
                    <div className="section-title" style={{ marginBottom: 20 }}>Current vs Previous Month</div>
                    <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={monthly_comparison} barGap={3} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip content={<ChartTip />} cursor={{ fill: '#F8FAFC' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: 16 }} />
                            <Bar dataKey="current"  name="This Month" fill="#10B981" radius={[5,5,0,0]} maxBarSize={24} />
                            <Bar dataKey="previous" name="Last Month" fill="#94A3B8" radius={[5,5,0,0]} maxBarSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </AppLayout>
    );
}
