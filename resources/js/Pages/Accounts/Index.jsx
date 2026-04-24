import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ExportButton from '@/Components/ExportButton';

const PlusIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EditIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const XIcon       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const WalletIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;

/* ── Account type icon map ── */
const ACCOUNT_TYPE_META = {
    business_bank: { label: 'Business Bank', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    personal_bank: { label: 'Personal Bank',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    cash:          { label: 'Cash / Wallet',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
    mobile_wallet: { label: 'Mobile Wallet',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
    savings:       { label: 'Savings',        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> },
};

function AccountTypeIcon({ type, size = 20, color }) {
    const meta = ACCOUNT_TYPE_META[type];
    if (!meta) return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
    return <span style={{ color: color || 'currentColor', display: 'flex' }}>{meta.icon}</span>;
}

function NetWorthSummary({ accounts }) {
    const total = (accounts || []).reduce((s, a) => s + (a.balance || 0), 0);
    return (
        <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
                <div style={{ fontSize: 11, color: 'var(--sl-t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Total Net Worth</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: total >= 0 ? '#10B981' : '#EF4444', letterSpacing: '-0.5px' }}>
                    PKR {Math.abs(total).toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {(accounts || []).map(a => {
                    const pct = total !== 0 ? Math.abs((a.balance / total) * 100) : 0;
                    return (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color || '#10B981', flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: 'var(--sl-t3)' }}>{a.name}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sl-t2)' }}>{pct.toFixed(0)}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function AccountsIndex({ accounts }) {
    const [showForm, setShowForm] = useState(false);
    const [editAccount, setEditAccount] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, processing, errors, reset } = useForm({
        name: '', type: 'cash', account_type: 'personal_bank', is_cash_account: false,
        balance: 0, color: '#10B981', notes: '', is_default: false,
    });

    const openEdit = (acc) => {
        setEditAccount(acc);
        setData({
            name: acc.name, type: acc.type,
            account_type: acc.account_type || 'personal_bank',
            is_cash_account: acc.is_cash_account || false,
            balance: acc.balance, color: acc.color, notes: acc.notes || '', is_default: acc.is_default,
        });
        setShowForm(true);
    };
    const openCreate = () => { setEditAccount(null); reset(); setShowForm(true); };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editAccount) {
            router.put(`/accounts/${editAccount.id}`, data, {
                onSuccess: () => { setShowForm(false); toast.success('Account updated.'); },
            });
        } else {
            router.post('/accounts', data, {
                onSuccess: () => { setShowForm(false); reset(); toast.success('Account created.'); },
            });
        }
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/accounts/${deleteId}`, {
            onSuccess: () => { setDeleteId(null); toast.success('Account deleted.'); },
            onError: (e) => toast.error(e.message || 'Cannot delete.'),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Accounts" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Accounts</h1>
                    <p className="page-subtitle">{accounts?.length || 0} accounts tracked</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ExportButton baseUrl="/export/accounts" filters={{}} />
                    <button onClick={openCreate} className="btn btn-primary">
                        <PlusIcon /> New Account
                    </button>
                </div>
            </div>

            {accounts?.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><WalletIcon /></div>
                        <div className="empty-state-title">No accounts yet</div>
                        <div className="empty-state-desc">Add bank accounts, cash wallets, or investment accounts to start tracking.</div>
                        <button onClick={openCreate} className="btn btn-primary">Add your first account</button>
                    </div>
                </div>
            ) : (
                <>
                    <NetWorthSummary accounts={accounts} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                        {accounts?.map((acc, i) => {
                            const color    = acc.color || '#10B981';
                            const typeMeta = ACCOUNT_TYPE_META[acc.account_type] || ACCOUNT_TYPE_META.personal_bank;
                            return (
                                <motion.div key={acc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    style={{ background: 'var(--sl-surface)', borderRadius: 14, border: '1px solid var(--sl-border)', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms' }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--sh-card)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div style={{ height: 4, background: `linear-gradient(90deg,${color},${color}80)` }} />
                                    <div style={{ padding: '18px 20px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                            <div style={{ width: 42, height: 42, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                                                <AccountTypeIcon type={acc.account_type} size={20} color={color} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sl-t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                                    <span style={{ fontSize: 11, color: 'var(--sl-t3)' }}>{typeMeta.label}</span>
                                                    {acc.is_cash_account && <span style={{ fontSize: 9, fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.12)', padding: '1px 5px', borderRadius: 99 }}>CASH</span>}
                                                    {acc.is_default && <span style={{ fontSize: 9, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '1px 5px', borderRadius: 99 }}>DEFAULT</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: 14 }}>
                                            <div style={{ fontSize: 11, color: 'var(--sl-t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Balance</div>
                                            <div style={{ fontSize: 26, fontWeight: 800, color: acc.balance >= 0 ? '#10B981' : '#EF4444', letterSpacing: '-0.5px' }}>{acc.formatted_balance}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--sl-border)', paddingTop: 14 }}>
                                            <Link href={`/accounts/${acc.id}/statement`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '6px 10px' }}>
                                                Statement
                                            </Link>
                                            <button onClick={() => openEdit(acc)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--sl-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sl-t2)', transition: 'all 150ms' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--sl-surface-2)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            ><EditIcon /></button>
                                            <button onClick={() => setDeleteId(acc.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', transition: 'all 150ms' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                                            ><TrashIcon /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Slide-over Form */}
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
                                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>{editAccount ? 'Edit Account' : 'New Account'}</h2>
                                <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2E8F0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                    <XIcon />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label className="label">Account Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field" placeholder="e.g. Main Bank Account" />
                                    {errors.name && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="label">Account Category *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {Object.entries(ACCOUNT_TYPE_META).map(([key, meta]) => (
                                            <button key={key} type="button" onClick={() => {
                                                setData('account_type', key);
                                                setData('is_cash_account', key === 'cash');
                                                if (key === 'cash') setData('type', 'cash');
                                                else if (key === 'mobile_wallet') setData('type', 'jazzcash');
                                                else setData('type', 'bank');
                                            }} style={{
                                                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                                                borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                                border: `1.5px solid ${data.account_type === key ? '#10B981' : 'var(--sl-border)'}`,
                                                background: data.account_type === key ? 'rgba(16,185,129,0.08)' : 'transparent',
                                                color: data.account_type === key ? '#10B981' : 'var(--sl-t2)',
                                            }}>
                                                <AccountTypeIcon type={key} size={15} color={data.account_type === key ? '#10B981' : undefined} />
                                                {meta.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Platform Type</label>
                                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="input-field">
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank Account</option>
                                        <option value="jazzcash">JazzCash</option>
                                        <option value="easypaisa">EasyPaisa</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Color</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <input type="color" value={data.color} onChange={e => setData('color', e.target.value)} style={{ width: 48, height: 40, borderRadius: 8, border: '1.5px solid #E2E8F0', cursor: 'pointer', padding: 2 }} />
                                        <span style={{ fontSize: 13, color: '#64748B', fontFamily: 'monospace' }}>{data.color}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Notes</label>
                                    <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="input-field" style={{ resize: 'none' }} rows={3} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input type="checkbox" id="default" checked={data.is_default} onChange={e => setData('is_default', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#10B981' }} />
                                    <label htmlFor="default" style={{ fontSize: 13, color: '#0F172A', cursor: 'pointer' }}>Set as default account</label>
                                </div>
                            </form>
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 10 }}>
                                <button onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button onClick={handleSubmit} disabled={processing} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    {processing ? 'Saving…' : (editAccount ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmModal
                open={!!deleteId}
                title="Delete Account"
                message="You can only delete accounts with no transactions. This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                loading={deleting}
            />
        </AppLayout>
    );
}
