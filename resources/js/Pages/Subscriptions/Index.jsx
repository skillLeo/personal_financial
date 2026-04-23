import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);
const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);
const PauseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>
);
const PlayIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
);
const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
);
const SubIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
);

const CYCLE_COLORS = { monthly: '#3B82F6', yearly: '#8B5CF6', weekly: '#10B981', quarterly: '#F59E0B', daily: '#EF4444' };

function SubscriptionCard({ sub, onPay, onToggle, onEdit, onDelete }) {
    const daysColor = sub.days_until_due <= 0 ? '#EF4444' : sub.days_until_due <= 3 ? '#F59E0B' : '#64748B';
    const cycleColor = CYCLE_COLORS[sub.billing_cycle] || '#64748B';
    const isPaused = sub.status !== 'active';

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="sub-card"
            style={{ opacity: isPaused ? 0.65 : 1, border: isPaused ? '1.5px dashed #E2E8F0' : '1px solid #E2E8F0' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#0F172A' }}>
                        {sub.logo_url ? <img src={sub.logo_url} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} /> : sub.name[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{sub.name}</div>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cycleColor + '18', color: cycleColor, textTransform: 'capitalize' }}>{sub.billing_cycle}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', letterSpacing: '-0.3px' }}>{sub.formatted}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: daysColor, marginTop: 2 }}>
                        {sub.days_until_due <= 0 ? 'Due TODAY' : `Due in ${sub.days_until_due}d`}
                    </div>
                </div>
            </div>

            {sub.category && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: sub.category.color, display: 'inline-block', flexShrink: 0 }} />
                    {sub.category.name}
                </div>
            )}

            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>Next: {sub.next_due_date}</div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, paddingTop: 12, borderTop: '1px solid #F1F5F9', alignItems: 'center' }}>
                {sub.status === 'active' && (
                    <button onClick={() => onPay(sub.id)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '8px 10px' }}>
                        <CheckIcon /> Mark Paid
                    </button>
                )}
                <button onClick={() => onToggle(sub.id)} title={isPaused ? 'Activate' : 'Pause'} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2E8F0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', flexShrink: 0 }}>
                    {isPaused ? <PlayIcon /> : <PauseIcon />}
                </button>
                <button onClick={() => onEdit(sub)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2E8F0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', flexShrink: 0 }}>
                    <EditIcon />
                </button>
                <button onClick={() => onDelete(sub.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}>
                    <TrashIcon />
                </button>
            </div>
        </motion.div>
    );
}

export default function SubscriptionsIndex({ subscriptions, monthly_total, accounts, categories }) {
    const [showForm, setShowForm] = useState(false);
    const [editSub, setEditSub] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '', description: '', amount: '', billing_cycle: 'monthly',
        next_due_date: '', account_id: '', category_id: '', reminder_days: 3, logo_url: '',
    });

    const openCreate = () => { setEditSub(null); reset(); setShowForm(true); };
    const openEdit = (sub) => {
        setEditSub(sub);
        setData({ name: sub.name, description: sub.description || '', amount: sub.amount, billing_cycle: sub.billing_cycle, next_due_date: sub.next_due_date, account_id: sub.account?.id || '', category_id: sub.category?.id || '', reminder_days: sub.reminder_days, logo_url: sub.logo_url || '' });
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editSub) {
            router.put(`/subscriptions/${editSub.id}`, data, { onSuccess: () => { setShowForm(false); toast.success('Updated.'); } });
        } else {
            router.post('/subscriptions', data, { onSuccess: () => { setShowForm(false); reset(); toast.success('Subscription added.'); } });
        }
    };

    const handlePay = (id) => router.post(`/subscriptions/${id}/pay`, {}, { onSuccess: () => toast.success('Marked as paid!') });
    const handleToggle = (id) => router.post(`/subscriptions/${id}/toggle`, {}, { onSuccess: () => toast.success('Status updated.') });

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/subscriptions/${deleteId}`, {
            onSuccess: () => { setDeleteId(null); toast.success('Deleted.'); },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Subscriptions" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Subscriptions</h1>
                    <p className="page-subtitle">Monthly cost: <strong style={{ color: '#EF4444' }}>{monthly_total}</strong></p>
                </div>
                <button onClick={openCreate} className="btn-primary">
                    <PlusIcon /> Add Subscription
                </button>
            </div>

            {subscriptions?.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><SubIcon /></div>
                        <div className="empty-state-title">No subscriptions</div>
                        <div className="empty-state-desc">Track your recurring bills and software subscriptions.</div>
                        <button onClick={openCreate} className="btn-primary">Add first subscription</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                    {subscriptions?.map(sub => (
                        <SubscriptionCard
                            key={sub.id}
                            sub={sub}
                            onPay={handlePay}
                            onToggle={handleToggle}
                            onEdit={openEdit}
                            onDelete={setDeleteId}
                        />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showForm && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowForm(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b">
                                <h2 className="font-bold text-lg">{editSub ? 'Edit Subscription' : 'New Subscription'}</h2>
                                <button onClick={() => setShowForm(false)}><XIcon /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                                <div>
                                    <label className="label">Subscription Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field" placeholder="e.g. Netflix, Google Workspace" />
                                    {errors.name && <p className="text-xs text-[#EF4444] mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="label">Amount (Rs.) *</label>
                                    <input type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} className="input-field" placeholder="0" />
                                    {errors.amount && <p className="text-xs text-[#EF4444] mt-1">{errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="label">Billing Cycle</label>
                                    <select value={data.billing_cycle} onChange={e => setData('billing_cycle', e.target.value)} className="input-field">
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Next Due Date *</label>
                                    <input type="date" value={data.next_due_date} onChange={e => setData('next_due_date', e.target.value)} className="input-field" />
                                    {errors.next_due_date && <p className="text-xs text-[#EF4444] mt-1">{errors.next_due_date}</p>}
                                </div>
                                <div>
                                    <label className="label">Account (for auto-deduction)</label>
                                    <select value={data.account_id} onChange={e => setData('account_id', e.target.value)} className="input-field">
                                        <option value="">Select account</option>
                                        {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Category</label>
                                    <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="input-field">
                                        <option value="">Select category</option>
                                        {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Remind me before (days)</label>
                                    <input type="number" value={data.reminder_days} onChange={e => setData('reminder_days', e.target.value)} className="input-field" min={0} max={30} />
                                </div>
                                <div>
                                    <label className="label">Notes</label>
                                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="input-field resize-none" rows={2} />
                                </div>
                            </form>
                            <div className="p-6 border-t flex gap-3">
                                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                                <button onClick={handleSubmit} disabled={processing} className="btn-primary flex-1 justify-center">
                                    {processing ? 'Saving...' : (editSub ? 'Update' : 'Add')}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmModal open={!!deleteId} title="Delete Subscription" message="This subscription will be removed permanently." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
        </AppLayout>
    );
}
