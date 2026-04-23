import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
    </svg>
);

export default function AccountStatement({ account, transactions }) {
    return (
        <AppLayout>
            <Head title={`Statement: ${account.name}`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/accounts" style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 150ms', textDecoration: 'none' }}>
                    <BackIcon />
                </Link>
                <div style={{ flex: 1 }}>
                    <h1 className="page-title">{account.name}</h1>
                    <p style={{ fontSize: 13, color: '#64748B', textTransform: 'capitalize', marginTop: 2 }}>{account.type} account</p>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: account.balance >= 0 ? '#10B981' : '#EF4444', letterSpacing: '-0.5px' }}>
                    {account.formatted_balance}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="section-title">Transaction History</div>
                </div>
                {transactions?.data?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8', fontSize: 13 }}>No transactions for this account.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Person</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions?.data?.map(t => (
                                <tr key={t.id}>
                                    <td style={{ color: '#64748B', fontSize: 13 }}>{t.transaction_date}</td>
                                    <td style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{t.description || t.category?.name || '—'}</td>
                                    <td>
                                        {t.category && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: 2, background: t.category.color, display: 'inline-block', flexShrink: 0 }} />
                                                {t.category.name}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ fontSize: 12, color: '#64748B' }}>{t.person?.name || '—'}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: 14, color: t.type === 'income' ? '#10B981' : '#EF4444' }}>
                                        {t.type === 'income' ? '+' : '-'}{t.formatted_amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AppLayout>
    );
}
