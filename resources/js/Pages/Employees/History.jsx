import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
    </svg>
);

export default function EmployeeHistory({ employee, payments }) {
    return (
        <AppLayout>
            <Head title={`${employee.name} — Salary History`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/employees" style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 150ms', textDecoration: 'none' }}>
                    <BackIcon />
                </Link>
                <div>
                    <h1 className="page-title">{employee.name}</h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{employee.role} — {employee.formatted_salary}/month</p>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="section-title">Salary Payment History</div>
                </div>
                {payments?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8', fontSize: 13 }}>No salary payments recorded yet.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                {['Month', 'Amount', 'Payment Date', 'Method', 'Notes'].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {payments?.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{p.month_year}</td>
                                    <td style={{ fontWeight: 800, color: '#10B981', fontSize: 14 }}>Rs. {Number(p.amount).toLocaleString()}</td>
                                    <td style={{ color: '#64748B', fontSize: 13 }}>{p.payment_date}</td>
                                    <td style={{ color: '#64748B', fontSize: 13, textTransform: 'capitalize' }}>{p.payment_method}</td>
                                    <td style={{ color: '#94A3B8', fontSize: 12 }}>{p.notes || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AppLayout>
    );
}
