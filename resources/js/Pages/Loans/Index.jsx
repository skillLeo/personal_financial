import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import ExportButton from '@/Components/ExportButton';

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
const LoanIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
);

function LoanCard({ loan, onRepayment, onDelete }) {
    const dueColor = { overdue: '#EF4444', urgent: '#F59E0B', approaching: '#3B82F6', ok: '#10B981', none: '#94A3B8' };
    const color = dueColor[loan.due_date_status] || '#94A3B8';
    const statusColors = { completed: { bg: '#DCFCE7', color: '#16A34A' }, partial: { bg: '#FEF9C3', color: '#A16207' }, active: { bg: '#FEE2E2', color: '#DC2626' } };
    const st = statusColors[loan.status] || statusColors.active;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {loan.person?.photo_url ? (
                        <img src={loan.person.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
                            {loan.person?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{loan.person?.name || 'Unknown'}</div>
                        {loan.due_date && (
                            <div style={{ fontSize: 11, fontWeight: 600, color, marginTop: 2 }}>
                                {loan.due_date_status === 'overdue' ? '⚠ Overdue: ' : 'Due: '}{loan.due_date}
                            </div>
                        )}
                    </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, textTransform: 'capitalize' }}>
                    {loan.status}
                </span>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: '#EF4444', letterSpacing: '-0.5px' }}>{loan.formatted_remaining}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>of {loan.formatted_total} remaining</div>

            <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${loan.progress_percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: '#10B981', borderRadius: 99 }}
                />
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: loan.notes ? 8 : 16 }}>{loan.progress_percentage}% paid back</div>

            {loan.notes && <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic', marginBottom: 14 }}>{loan.notes}</div>}

            <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid #F1F5F9', marginTop: 'auto' }}>
                {loan.status !== 'completed' && (
                    <button onClick={() => onRepayment(loan)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '8px 12px' }}>
                        Record Repayment
                    </button>
                )}
                <button onClick={() => onDelete(loan.id)} style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
            </div>
        </motion.div>
    );
}

export default function LoansIndex({ given_loans, taken_loans, summary, people }) {
    const [activeTab, setActiveTab] = useState('given');
    const [showAddForm, setShowAddForm] = useState(false);
    const [repaymentLoan, setRepaymentLoan] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        person_id: '', type: 'given', total_amount: '', interest_rate: 0,
        loan_date: new Date().toISOString().split('T')[0], due_date: '', notes: '',
    });

    const repayForm = useForm({ amount: '', repayment_date: new Date().toISOString().split('T')[0], notes: '' });

    const handleAddLoan = (e) => {
        e.preventDefault();
        post('/loans', { onSuccess: () => { setShowAddForm(false); reset(); toast.success('Loan recorded.'); } });
    };

    const handleRepayment = (e) => {
        e.preventDefault();
        router.post(`/loans/${repaymentLoan.id}/repayment`, repayForm.data, {
            onSuccess: () => { setRepaymentLoan(null); repayForm.reset(); toast.success('Repayment recorded.'); },
        });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/loans/${deleteId}`, {
            onSuccess: () => { setDeleteId(null); toast.success('Loan deleted.'); },
            onFinish: () => setDeleting(false),
        });
    };

    const loans = activeTab === 'given' ? given_loans : taken_loans;

    return (
        <AppLayout>
            <Head title="Loans" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Loans</h1>
                    <p className="page-subtitle">Track money lent and borrowed</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ExportButton baseUrl="/export/loans" filters={{}} />
                    <button onClick={() => setShowAddForm(true)} className="btn-primary">
                        <PlusIcon /> New Loan
                    </button>
                </div>
            </div>

            {/* Summary stats */}
            <div className="loans-summary-grid">
                {[
                    { label: 'Money I Lent', value: summary?.total_given, color: '#10B981', icon: '↑' },
                    { label: 'Money I Borrowed', value: summary?.total_borrowed, color: '#EF4444', icon: '↓' },
                    { label: 'Net Position', value: summary?.net_position, color: summary?.is_positive ? '#10B981' : '#EF4444', icon: '⇄' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.value || 'Rs. 0'}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="pill-tabs" style={{ marginBottom: 20 }}>
                {[
                    { key: 'given', label: 'Money I Lent', count: given_loans?.length },
                    { key: 'taken', label: 'Money I Borrowed', count: taken_loans?.length },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pill-tab ${activeTab === tab.key ? 'active' : ''}`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : '#E2E8F0', color: activeTab === tab.key ? '#fff' : '#64748B' }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loans?.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><LoanIcon /></div>
                        <div className="empty-state-title">No loans here</div>
                        <div className="empty-state-desc">Track money you've lent or borrowed.</div>
                        <button onClick={() => setShowAddForm(true)} className="btn-primary">Record a Loan</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {loans?.map(loan => (
                        <LoanCard key={loan.id} loan={loan} onRepayment={setRepaymentLoan} onDelete={setDeleteId} />
                    ))}
                </div>
            )}

            {/* Add Loan slide-over */}
            <AnimatePresence>
                {showAddForm && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddForm(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b">
                                <h2 className="font-bold text-lg">New Loan</h2>
                                <button onClick={() => setShowAddForm(false)}><XIcon /></button>
                            </div>
                            <form onSubmit={handleAddLoan} className="flex-1 overflow-y-auto p-6 space-y-4">
                                <div>
                                    <label className="label">Person *</label>
                                    <select value={data.person_id} onChange={e => setData('person_id', e.target.value)} className="input-field">
                                        <option value="">Select person</option>
                                        {people?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    {errors.person_id && <p className="text-xs text-[#EF4444] mt-1">{errors.person_id}</p>}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {[['given', '💸 I Lent'], ['taken', '🤲 I Borrowed']].map(([v, l]) => (
                                        <button key={v} type="button" onClick={() => setData('type', v)}
                                            style={{ flex: 1, padding: '12px 8px', borderRadius: 12, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 150ms', background: data.type === v ? '#0F172A' : '#F1F5F9', color: data.type === v ? '#fff' : '#64748B' }}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <label className="label">Amount (Rs.) *</label>
                                    <input type="number" value={data.total_amount} onChange={e => setData('total_amount', e.target.value)} className="input-field" placeholder="0" />
                                    {errors.total_amount && <p className="text-xs text-[#EF4444] mt-1">{errors.total_amount}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">Loan Date *</label>
                                        <input type="date" value={data.loan_date} onChange={e => setData('loan_date', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Due Date</label>
                                        <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} className="input-field" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Notes</label>
                                    <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="input-field resize-none" rows={3} />
                                </div>
                            </form>
                            <div className="p-6 border-t flex gap-3">
                                <button onClick={() => setShowAddForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                                <button onClick={handleAddLoan} disabled={processing} className="btn-primary flex-1 justify-center">
                                    {processing ? 'Saving...' : 'Record Loan'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Repayment modal */}
            <AnimatePresence>
                {repaymentLoan && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setRepaymentLoan(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                                <h3 className="font-bold text-[#0F172A] mb-1">Record Repayment</h3>
                                <p className="text-sm text-[#64748B] mb-4">
                                    Remaining: <strong>{repaymentLoan.formatted_remaining}</strong>
                                </p>
                                <form onSubmit={handleRepayment} className="space-y-3">
                                    <div>
                                        <label className="label">Amount (Rs.) *</label>
                                        <input type="number" value={repayForm.data.amount} onChange={e => repayForm.setData('amount', e.target.value)} className="input-field" placeholder="0" max={repaymentLoan.remaining_amount} />
                                    </div>
                                    <div>
                                        <label className="label">Date *</label>
                                        <input type="date" value={repayForm.data.repayment_date} onChange={e => repayForm.setData('repayment_date', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Notes</label>
                                        <input type="text" value={repayForm.data.notes} onChange={e => repayForm.setData('notes', e.target.value)} className="input-field" />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setRepaymentLoan(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                                        <button type="submit" disabled={repayForm.processing} className="btn-primary flex-1 justify-center">Record</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmModal open={!!deleteId} title="Delete Loan" message="This loan record will be permanently deleted." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
        </AppLayout>
    );
}
