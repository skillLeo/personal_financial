import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import ExportButton from '@/Components/ExportButton';

const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const AlertIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const BudgetIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;

function CircularProgress({ percentage, color = '#10B981' }) {
    const r = 44, c = 2 * Math.PI * r;
    const pct = Math.min(Math.max(percentage, 0), 100);
    const ringColor = pct >= 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : color;
    return (
        <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r={r} stroke="#F1F5F9" strokeWidth="9" fill="none" />
            <circle cx="55" cy="55" r={r} stroke={ringColor} strokeWidth="9" fill="none"
                strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
                strokeLinecap="round" transform="rotate(-90 55 55)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x="55" y="51" textAnchor="middle" style={{ fontSize: 20, fontWeight: 800, fill: '#0F172A' }}>{Math.round(pct)}%</text>
            <text x="55" y="66" textAnchor="middle" style={{ fontSize: 11, fill: '#94A3B8' }}>used</text>
        </svg>
    );
}

export default function BudgetsIndex({ budgets, categories }) {
    const [showForm, setShowForm] = useState(false);
    const [editBudget, setEditBudget] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const now = new Date().toISOString().split('T')[0];
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    const { data, setData, processing, errors, reset } = useForm({
        name: '', amount: '', period: 'monthly', start_date: now, end_date: monthEnd,
        alert_at_percentage: 80, category_id: '',
    });

    const openCreate = () => { setEditBudget(null); reset(); setShowForm(true); };
    const openEdit = (b) => {
        setEditBudget(b);
        setData({ name: b.name, amount: b.amount, period: b.period, start_date: b.start_date, end_date: b.end_date, alert_at_percentage: b.alert_at_percentage, category_id: b.category?.id || '' });
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editBudget) {
            router.put(`/budgets/${editBudget.id}`, data, { onSuccess: () => { setShowForm(false); toast.success('Budget updated.'); } });
        } else {
            router.post('/budgets', data, { onSuccess: () => { setShowForm(false); reset(); toast.success('Budget created.'); } });
        }
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/budgets/${deleteId}`, {
            onSuccess: () => { setDeleteId(null); toast.success('Deleted.'); },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Budgets" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Budgets & Limits</h1>
                    <p className="page-subtitle">Set spending limits to stay in control</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ExportButton baseUrl="/export/budgets" filters={{}} />
                    <button onClick={openCreate} className="btn btn-primary">
                        <PlusIcon /> New Budget
                    </button>
                </div>
            </div>

            {budgets?.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><BudgetIcon /></div>
                        <div className="empty-state-title">No budgets set</div>
                        <div className="empty-state-desc">Set spending limits per category to stay in control of your finances.</div>
                        <button onClick={openCreate} className="btn btn-primary">Create your first budget</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {budgets?.map((b, i) => {
                        const isOver = b.percentage_used >= 100;
                        const isAlert = b.is_over_alert;
                        return (
                            <motion.div
                                key={b.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="card"
                                style={{ border: isOver ? '1px solid #FECACA' : isAlert ? '1px solid #FDE68A' : '1px solid #E2E8F0' }}
                            >
                                {(isAlert || isOver) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: isOver ? '#EF4444' : '#F59E0B', marginBottom: 12, justifyContent: 'center' }}>
                                        <AlertIcon />
                                        {isOver ? 'Budget exceeded!' : `Alert: ${Math.round(b.percentage_used)}% used`}
                                    </div>
                                )}
                                <div style={{ marginBottom: 6 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{b.name}</div>
                                    {b.category && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{b.category.name}</div>}
                                </div>
                                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>{b.start_date} to {b.end_date}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                    <CircularProgress percentage={b.percentage_used} color={b.category?.color || '#10B981'} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                    {[
                                        { label: 'Spent', val: b.spent_formatted, color: '#EF4444' },
                                        { label: 'Budget', val: b.formatted_amount, color: '#0F172A' },
                                        { label: 'Remaining', val: b.remaining_formatted, color: parseFloat(b.remaining) > 0 ? '#10B981' : '#EF4444' },
                                    ].map(row => (
                                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: '#64748B' }}>{row.label}</span>
                                            <span style={{ fontWeight: 700, color: row.color }}>{row.val}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
                                    <button onClick={() => openEdit(b)} style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #E2E8F0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 150ms' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => setDeleteId(b.id)} style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', transition: 'all 150ms' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {showForm && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
                            onClick={() => setShowForm(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 420, background: '#fff', zIndex: 50, boxShadow: '-8px 0 40px rgba(15,23,42,0.15)', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
                                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>{editBudget ? 'Edit Budget' : 'New Budget'}</h2>
                                <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2E8F0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                    <XIcon />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label className="label">Budget Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field" placeholder="e.g. Marketing Budget" />
                                    {errors.name && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="label">Budget Amount (Rs.) *</label>
                                    <input type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} className="input-field" placeholder="0" />
                                    {errors.amount && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="label">Category (optional)</label>
                                    <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="input-field">
                                        <option value="">All Expenses</option>
                                        {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Period</label>
                                    <select value={data.period} onChange={e => setData('period', e.target.value)} className="input-field">
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label className="label">Start Date</label>
                                        <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">End Date</label>
                                        <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="input-field" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Alert threshold: {data.alert_at_percentage}%</label>
                                    <input type="range" min={10} max={100} value={data.alert_at_percentage} onChange={e => setData('alert_at_percentage', e.target.value)} style={{ width: '100%', accentColor: '#10B981' }} />
                                </div>
                            </form>
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 10 }}>
                                <button onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button onClick={handleSubmit} disabled={processing} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    {processing ? 'Saving…' : (editBudget ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmModal open={!!deleteId} title="Delete Budget" message="This budget will be permanently removed." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
        </AppLayout>
    );
}
