import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function PersonShow({ person, transactions }) {
    const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
        <AppLayout>
            <Head title={person.name} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/people" style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 150ms' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </Link>
                <h1 className="page-title">{person.name}</h1>
            </div>

            {/* Banner */}
            <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 20, position: 'relative', overflow: 'hidden', border: '1px solid #1E293B' }}>
                <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(16,185,129,0.06)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {person.photo_url ? (
                        <img src={person.photo_url} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)' }} />
                    ) : (
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22, border: '3px solid rgba(16,185,129,0.3)' }}>{initials}</div>
                    )}
                    <div>
                        <h2 style={{ color: '#F8FAFC', fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.3px' }}>{person.name}</h2>
                        <span className="badge badge-green" style={{ marginBottom: 8, display: 'inline-block', textTransform: 'capitalize' }}>{person.relationship}</span>
                        {person.phone && <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{person.phone}</div>}
                        {person.email && <div style={{ fontSize: 13, color: '#64748B' }}>{person.email}</div>}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                {[
                    { label: 'Total Given', value: person.total_given, color: '#EF4444' },
                    { label: 'Total Received', value: person.total_received, color: '#10B981' },
                    { label: 'Net Balance', value: (person.net_is_positive ? '+' : '-') + person.net_formatted, color: person.net_is_positive ? '#10B981' : '#EF4444', sub: person.net_is_positive ? 'They owe you' : 'You owe them' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
                        <div className="caption" style={{ marginBottom: 8 }}>{s.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.3px' }}>{s.value}</div>
                        {s.sub && <div className="caption" style={{ marginTop: 4 }}>{s.sub}</div>}
                    </div>
                ))}
            </div>

            {/* Transactions */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="section-title">Transaction History</div>
                </div>
                {!transactions?.data?.length ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8', fontSize: 13 }}>No transactions with this person yet.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data.map(t => (
                                <tr key={t.id}>
                                    <td style={{ color: '#64748B', fontSize: 13 }}>{t.transaction_date}</td>
                                    <td style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{t.description || t.category?.name || '—'}</td>
                                    <td>
                                        {t.category && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: 2, background: t.category.color, display: 'inline-block' }} />
                                                {t.category.name}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 800, color: t.type === 'income' ? '#10B981' : '#EF4444' }}>
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
