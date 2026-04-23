import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import PhotoGalleryModal from '@/Components/PhotoGalleryModal';
import ExportButton from '@/Components/ExportButton';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const FilterIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const PhotoIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ChevronLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

export default function TransactionsIndex({ transactions, filters, summary, accounts, categories, people }) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [galleryPhotos, setGalleryPhotos] = useState(null);
    const [localFilters, setLocalFilters] = useState(filters || {});

    const applyFilters = (e) => {
        e.preventDefault();
        router.get('/transactions', localFilters, { preserveState: true });
    };

    const clearFilters = () => { setLocalFilters({}); router.get('/transactions', {}); };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/transactions/${deleteId}`, {
            onSuccess: () => { setDeleteId(null); toast.success('Transaction deleted.'); },
            onError:   () => toast.error('Failed to delete.'),
            onFinish:  () => setDeleting(false),
        });
    };

    const hasActiveFilters = Object.values(localFilters).some(v => v);

    return (
        <AppLayout>
            <Head title="Transactions" />

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Transactions</h1>
                    <p className="page-subtitle">{summary?.count || 0} records found</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ExportButton baseUrl="/export/transactions" filters={localFilters} />
                    <Link href="/transactions/create" className="btn btn-primary">
                        <PlusIcon /> Add Transaction
                    </Link>
                </div>
            </div>

            {/* Summary */}
            <div className="summary-strip">
                <div className="summary-strip-cell">
                    <div className="summary-strip-label">Total Income</div>
                    <div className="summary-strip-value" style={{ color: '#10B981' }}>{summary?.total_income}</div>
                </div>
                <div className="summary-strip-cell">
                    <div className="summary-strip-label">Total Expenses</div>
                    <div className="summary-strip-value" style={{ color: '#EF4444' }}>{summary?.total_expenses}</div>
                </div>
                <div className="summary-strip-cell">
                    <div className="summary-strip-label">Net</div>
                    <div className="summary-strip-value" style={{ color: '#0F172A' }}>{summary?.net}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 13, fontWeight: 600, color: filtersOpen ? '#10B981' : '#64748B',
                            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        <FilterIcon />
                        Filters
                        {hasActiveFilters && (
                            <span style={{ width: 7, height: 7, background: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
                        )}
                    </button>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                            Clear all
                        </button>
                    )}
                </div>

                {filtersOpen && (
                    <form onSubmit={applyFilters} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}><SearchIcon /></span>
                            <input type="text" placeholder="Search…" value={localFilters.search || ''}
                                onChange={e => setLocalFilters(p => ({ ...p, search: e.target.value }))}
                                className="input-field" style={{ paddingLeft: 34, fontSize: 13, padding: '8px 12px 8px 32px' }} />
                        </div>
                        <select value={localFilters.type || ''} onChange={e => setLocalFilters(p => ({ ...p, type: e.target.value }))} className="input-field" style={{ fontSize: 13, padding: '8px 12px' }}>
                            <option value="">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                            <option value="transfer">Transfer</option>
                        </select>
                        <select value={localFilters.category_id || ''} onChange={e => setLocalFilters(p => ({ ...p, category_id: e.target.value }))} className="input-field" style={{ fontSize: 13, padding: '8px 12px' }}>
                            <option value="">All Categories</option>
                            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={localFilters.account_id || ''} onChange={e => setLocalFilters(p => ({ ...p, account_id: e.target.value }))} className="input-field" style={{ fontSize: 13, padding: '8px 12px' }}>
                            <option value="">All Accounts</option>
                            {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <input type="date" value={localFilters.from_date || ''} onChange={e => setLocalFilters(p => ({ ...p, from_date: e.target.value }))} className="input-field" style={{ fontSize: 13, padding: '8px 12px' }} />
                        <input type="date" value={localFilters.to_date || ''} onChange={e => setLocalFilters(p => ({ ...p, to_date: e.target.value }))} className="input-field" style={{ fontSize: 13, padding: '8px 12px' }} />
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button type="submit" className="btn btn-primary btn-sm">Apply</button>
                        </div>
                    </form>
                )}
            </div>

            {/* Table */}
            {!transactions?.data?.length ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                        </div>
                        <div className="empty-state-title">No transactions found</div>
                        <div className="empty-state-desc">Start adding your income and expense transactions to get started.</div>
                        <Link href="/transactions/create" className="btn btn-primary">Add your first transaction</Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* Desktop table — hidden on mobile via CSS */}
                    <div className="txn-desktop-table card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Account</th>
                                    <th>Person</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th style={{ width: 80 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.data.map((t, i) => (
                                    <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                                        <td style={{ color: '#64748B', fontSize: 13, whiteSpace: 'nowrap' }}>{t.transaction_date}</td>
                                        <td style={{ maxWidth: 220 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {t.description || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            {t.category && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 500 }}>
                                                    <span style={{ width: 8, height: 8, borderRadius: 2, background: t.category.color, display: 'inline-block', flexShrink: 0 }} />
                                                    {t.category.name}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: 12, color: '#64748B' }}>{t.account?.name}</td>
                                        <td style={{ fontSize: 12, color: '#64748B' }}>{t.person?.name || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: 14, fontWeight: 800, color: t.type === 'income' ? '#10B981' : t.type === 'expense' ? '#EF4444' : '#6366F1' }}>
                                                {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '⇄'}{t.formatted_amount}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                {t.photos?.length > 0 && (
                                                    <button onClick={() => setGalleryPhotos(t.photos)} className="btn-ghost" style={{ padding: 6 }}>
                                                        <PhotoIcon />
                                                    </button>
                                                )}
                                                <Link href={`/transactions/${t.id}/edit`} className="btn-ghost" style={{ padding: 6, display: 'inline-flex' }}>
                                                    <EditIcon />
                                                </Link>
                                                <button onClick={() => setDeleteId(t.id)} style={{
                                                    width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#EF4444', transition: 'background 150ms',
                                                }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile card list — shown on mobile (<768px) via CSS */}
                    <div className="txn-mobile-list">
                        {transactions.data.map((t, i) => {
                            const typeColor = t.type === 'income' ? '#10B981' : t.type === 'transfer' ? '#8B5CF6' : '#EF4444';
                            const typeBg    = t.type === 'income' ? '#ECFDF5' : t.type === 'transfer' ? '#F5F3FF' : '#FEF2F2';
                            const typePrefix = t.type === 'income' ? '+' : t.type === 'transfer' ? '⇄' : '-';
                            return (
                                <motion.div key={t.id} className="txn-m-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                    {/* Category icon */}
                                    <div className="txn-m-icon" style={{ background: typeBg, color: typeColor }}>
                                        {t.category?.name?.[0]?.toUpperCase() || typePrefix}
                                    </div>

                                    {/* Info */}
                                    <div className="txn-m-info">
                                        <div className="txn-m-name">{t.description || t.category?.name || 'Transaction'}</div>
                                        <div className="txn-m-meta">
                                            {[t.transaction_date, t.account?.name, t.category?.name].filter(Boolean).join(' · ')}
                                        </div>
                                    </div>

                                    {/* Amount + actions */}
                                    <div className="txn-m-right">
                                        <span className="txn-m-amount" style={{ color: typeColor }}>
                                            {typePrefix}{t.formatted_amount}
                                        </span>
                                        <div className="txn-m-actions">
                                            {t.photos?.length > 0 && (
                                                <button onClick={() => setGalleryPhotos(t.photos)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E2E8F0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                                    <PhotoIcon />
                                                </button>
                                            )}
                                            <Link href={`/transactions/${t.id}/edit`} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E2E8F0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                                <EditIcon />
                                            </Link>
                                            <button onClick={() => setDeleteId(t.id)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                            <span style={{ fontSize: 13, color: '#64748B' }}>
                                Page {transactions.current_page} of {transactions.last_page} · {transactions.total} records
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {transactions.prev_page_url && (
                                    <Link href={transactions.prev_page_url} className="btn-icon"><ChevronLeft /></Link>
                                )}
                                {transactions.next_page_url && (
                                    <Link href={transactions.next_page_url} className="btn-icon"><ChevronRight /></Link>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            <ConfirmModal
                open={!!deleteId}
                title="Delete Transaction"
                message="This action cannot be undone. The transaction will be permanently deleted and account balances recalculated."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                loading={deleting}
            />
            <PhotoGalleryModal photos={galleryPhotos} open={!!galleryPhotos} onClose={() => setGalleryPhotos(null)} />
        </AppLayout>
    );
}
