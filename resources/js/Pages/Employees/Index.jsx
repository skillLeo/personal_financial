import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const EditIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const PayIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const BriefcaseIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;

export default function EmployeesIndex({ employees, accounts }) {
    const [showForm, setShowForm] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [paySalaryFor, setPaySalaryFor] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, processing, errors, reset } = useForm({
        name: '', role: '', email: '', phone: '', joining_date: '', monthly_salary: '',
        account_id: '', status: 'active', notes: '',
    });

    const payForm = useForm({
        amount: '', payment_date: new Date().toISOString().split('T')[0],
        month_year: new Date().toISOString().slice(0, 7),
        payment_method: 'cash', account_id: accounts?.[0]?.id || '', notes: '',
    });

    const openCreate = () => { setEditEmployee(null); reset(); setShowForm(true); };
    const openEdit = (e) => {
        setEditEmployee(e);
        setData({ name: e.name, role: e.role || '', email: e.email || '', phone: e.phone || '', joining_date: e.joining_date || '', monthly_salary: e.monthly_salary, account_id: e.account?.id || '', status: e.status, notes: e.notes || '' });
        setShowForm(true);
    };
    const openPay = (emp) => { setPaySalaryFor(emp); payForm.setData({ ...payForm.data, amount: emp.monthly_salary }); };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editEmployee) {
            router.put(`/employees/${editEmployee.id}`, data, { onSuccess: () => { setShowForm(false); toast.success('Updated.'); } });
        } else {
            router.post('/employees', data, { onSuccess: () => { setShowForm(false); reset(); toast.success('Employee added.'); } });
        }
    };

    const handlePay = (e) => {
        e.preventDefault();
        router.post(`/employees/${paySalaryFor.id}/pay-salary`, payForm.data, {
            onSuccess: () => { setPaySalaryFor(null); payForm.reset(); toast.success('Salary paid!'); },
        });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/employees/${deleteId}`, {
            onSuccess: () => { setDeleteId(null); toast.success('Deleted.'); },
            onFinish: () => setDeleting(false),
        });
    };

    const totalPayroll = employees?.filter(e => e.status === 'active').reduce((s, e) => s + (parseFloat(e.monthly_salary) || 0), 0);

    return (
        <AppLayout>
            <Head title="Employees" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Employees & Payroll</h1>
                    <p className="page-subtitle">
                        {employees?.filter(e => e.status === 'active').length || 0} active &nbsp;·&nbsp; Monthly payroll: <strong>Rs. {totalPayroll.toLocaleString()}</strong>
                    </p>
                </div>
                <button onClick={openCreate} className="btn btn-primary">
                    <PlusIcon /> Add Employee
                </button>
            </div>

            {employees?.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><BriefcaseIcon /></div>
                        <div className="empty-state-title">No employees</div>
                        <div className="empty-state-desc">Add your staff members to manage and track salaries.</div>
                        <button onClick={openCreate} className="btn btn-primary">Add first employee</button>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-scroll-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Role</th>
                                <th>Monthly Salary</th>
                                <th>Status</th>
                                <th>Last Paid</th>
                                <th style={{ width: 180 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees?.map((emp, i) => (
                                <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {emp.photo_url ? (
                                                <img src={emp.photo_url} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                                    {emp.name?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{emp.name}</div>
                                                {emp.phone && <div style={{ fontSize: 11, color: '#94A3B8' }}>{emp.phone}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: '#64748B', fontSize: 13 }}>{emp.role || '—'}</td>
                                    <td style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{emp.formatted_salary}</td>
                                    <td>
                                        <span className={`badge ${emp.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{emp.status}</span>
                                    </td>
                                    <td style={{ fontSize: 12, color: '#64748B' }}>
                                        {emp.last_payment ? emp.last_payment.month_year : <span style={{ color: '#94A3B8' }}>Not paid yet</span>}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <button onClick={() => openPay(emp)} className="btn btn-primary btn-xs">
                                                <PayIcon /> Pay
                                            </button>
                                            <Link href={`/employees/${emp.id}/history`} className="btn btn-secondary btn-xs">History</Link>
                                            <button onClick={() => openEdit(emp)} style={{ width: 28, height: 28, borderRadius: 6, border: '1.5px solid #E2E8F0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 150ms' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => setDeleteId(emp.id)} style={{ width: 28, height: 28, borderRadius: 6, border: '1.5px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', transition: 'all 150ms' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    </div>{/* /table-scroll-wrap */}
                </div>
            )}

            {/* Employee slide-over */}
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
                            style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 440, background: '#fff', zIndex: 50, boxShadow: '-8px 0 40px rgba(15,23,42,0.15)', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
                                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>{editEmployee ? 'Edit Employee' : 'New Employee'}</h2>
                                <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2E8F0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                    <XIcon />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label className="label">Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field" />
                                    {errors.name && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.name}</p>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label className="label">Role</label>
                                        <input type="text" value={data.role} onChange={e => setData('role', e.target.value)} className="input-field" placeholder="e.g. Manager" />
                                    </div>
                                    <div>
                                        <label className="label">Monthly Salary (Rs.) *</label>
                                        <input type="number" value={data.monthly_salary} onChange={e => setData('monthly_salary', e.target.value)} className="input-field" />
                                        {errors.monthly_salary && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.monthly_salary}</p>}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label className="label">Phone</label>
                                        <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Joining Date</label>
                                        <input type="date" value={data.joining_date} onChange={e => setData('joining_date', e.target.value)} className="input-field" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="input-field">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Notes</label>
                                    <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="input-field" style={{ resize: 'none' }} rows={3} />
                                </div>
                            </form>
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 10 }}>
                                <button onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button onClick={handleSubmit} disabled={processing} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    {processing ? 'Saving…' : (editEmployee ? 'Update' : 'Add')}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Pay Salary modal */}
            <AnimatePresence>
                {paySalaryFor && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 50, backdropFilter: 'blur(3px)' }}
                            onClick={() => setPaySalaryFor(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 10 }}
                            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                        >
                            <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }} onClick={e => e.stopPropagation()}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Pay Salary</h3>
                                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>{paySalaryFor.name} — {paySalaryFor.formatted_salary}/month</p>
                                <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div>
                                        <label className="label">Month/Year *</label>
                                        <input type="month" value={payForm.data.month_year} onChange={e => payForm.setData('month_year', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Amount (Rs.) *</label>
                                        <input type="number" value={payForm.data.amount} onChange={e => payForm.setData('amount', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Payment Date *</label>
                                        <input type="date" value={payForm.data.payment_date} onChange={e => payForm.setData('payment_date', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Pay from Account *</label>
                                        <select value={payForm.data.account_id} onChange={e => payForm.setData('account_id', e.target.value)} className="input-field">
                                            {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Payment Method</label>
                                        <select value={payForm.data.payment_method} onChange={e => payForm.setData('payment_method', e.target.value)} className="input-field">
                                            <option value="cash">Cash</option>
                                            <option value="bank">Bank Transfer</option>
                                            <option value="jazzcash">JazzCash</option>
                                            <option value="easypaisa">EasyPaisa</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                        <button type="button" onClick={() => setPaySalaryFor(null)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                        <button type="submit" disabled={payForm.processing} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Pay Salary</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmModal open={!!deleteId} title="Delete Employee" message="This employee record will be permanently deleted." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
        </AppLayout>
    );
}
