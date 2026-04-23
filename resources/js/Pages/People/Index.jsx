import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const XIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PeopleIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const RELATIONSHIP_COLORS = {
    friend: '#3B82F6', client: '#10B981', employee: '#8B5CF6',
    supplier: '#F59E0B', family: '#EC4899', other: '#6B7280',
};

export default function PeopleIndex({ people, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [showForm, setShowForm] = useState(false);
    const [editPerson, setEditPerson] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, reset, processing, errors } = useForm({
        name: '', phone: '', email: '', relationship: 'other', notes: '',
    });

    const doSearch = (e) => {
        e.preventDefault();
        router.get('/people', { search }, { preserveState: true });
    };

    const openCreate = () => { setEditPerson(null); reset(); setShowForm(true); };
    const openEdit = (p) => {
        setEditPerson(p);
        setData({ name: p.name, phone: p.phone || '', email: p.email || '', relationship: p.relationship, notes: p.notes || '' });
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editPerson) {
            router.put(`/people/${editPerson.id}`, data, {
                onSuccess: () => { setShowForm(false); toast.success('Person updated.'); },
            });
        } else {
            router.post('/people', data, {
                onSuccess: () => { setShowForm(false); reset(); toast.success('Person added.'); },
            });
        }
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/people/${deleteId}`, {
            onSuccess: () => { setDeleteId(null); toast.success('Person deleted.'); },
            onFinish: () => setDeleting(false),
        });
    };

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <AppLayout>
            <Head title="People" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">People & Contacts</h1>
                    <p className="page-subtitle">{people?.length || 0} contacts</p>
                </div>
                <div className="people-header-actions" style={{ display: 'flex', gap: 8 }}>
                    <form onSubmit={doSearch} className="people-search-form" style={{ display: 'flex', gap: 8, flex: 1 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}><SearchIcon /></span>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="input-field" style={{ paddingLeft: 34, fontSize: 13, width: '100%' }} />
                        </div>
                        <button type="submit" className="btn btn-secondary">Search</button>
                    </form>
                    <button onClick={openCreate} className="btn btn-primary people-header-add">
                        <PlusIcon /> Add Person
                    </button>
                </div>
            </div>

            {people?.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><PeopleIcon /></div>
                        <div className="empty-state-title">No people found</div>
                        <div className="empty-state-desc">Add clients, suppliers, or friends to track transactions with them.</div>
                        <button onClick={openCreate} className="btn btn-primary">Add your first contact</button>
                    </div>
                </div>
            ) : (
                <div className="person-card-wrap">
                    {people?.map((p, i) => {
                        const color = RELATIONSHIP_COLORS[p.relationship] || '#6B7280';
                        return (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="card person-card"
                                style={{ padding: 20, cursor: 'default' }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-hover)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--sh-card)'; }}
                            >
                                {/* Card inner — switches to horizontal flex on mobile via CSS */}
                                <div className="person-card-inner" style={{ textAlign: 'center' }}>
                                    <div className="person-card-avatar">
                                        {p.photo_url ? (
                                            <img src={p.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 10px', display: 'block' }} />
                                        ) : (
                                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: color + '20', border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontWeight: 700, fontSize: 16, margin: '0 auto 10px' }}>
                                                {getInitials(p.name)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="person-card-body">
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0D1117', marginBottom: 5 }}>{p.name}</div>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: color + '18', color, border: `1px solid ${color}30`, marginBottom: 6, textTransform: 'capitalize' }}>
                                            {p.relationship}
                                        </span>
                                        {p.phone && <div style={{ fontSize: 12, color: '#7A8899', marginBottom: 6 }}>{p.phone}</div>}
                                        <div className="person-card-balance-section" style={{ borderTop: '1px solid #F0F2F5', paddingTop: 10, marginTop: 4 }}>
                                            <div style={{ fontSize: 10, color: '#7A8899', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Balance</div>
                                            <div style={{ fontSize: 17, fontWeight: 700, color: p.net_balance >= 0 ? '#059669' : '#DC2626', letterSpacing: '-0.3px' }}>
                                                {p.net_balance === 0 ? 'Settled' : `${p.net_balance >= 0 ? '+' : ''}${p.net_formatted}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="person-card-actions" style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                                    <Link href={`/people/${p.id}`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '6px 10px' }}>History</Link>
                                    <button onClick={() => openEdit(p)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E4E8EF', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A8899', transition: 'all 150ms' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#F7F8FA'; e.currentTarget.style.borderColor = '#D4DAE4'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E4E8EF'; }}
                                    >
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => setDeleteId(p.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', transition: 'all 150ms' }}
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

            {/* Slide-over form */}
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
                                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>{editPerson ? 'Edit Person' : 'Add Person'}</h2>
                                <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2E8F0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                    <XIcon />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label className="label">Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field" placeholder="Full name" />
                                    {errors.name && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="label">Phone</label>
                                    <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} className="input-field" placeholder="0300-0000000" />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="input-field" placeholder="email@example.com" />
                                </div>
                                <div>
                                    <label className="label">Relationship</label>
                                    <select value={data.relationship} onChange={e => setData('relationship', e.target.value)} className="input-field">
                                        <option value="friend">Friend</option>
                                        <option value="client">Client</option>
                                        <option value="employee">Employee</option>
                                        <option value="supplier">Supplier</option>
                                        <option value="family">Family</option>
                                        <option value="other">Other</option>
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
                                    {processing ? 'Saving…' : (editPerson ? 'Update' : 'Add')}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmModal
                open={!!deleteId}
                title="Delete Person"
                message="This will remove the person. Transactions linked to them will not be deleted."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                loading={deleting}
            />
        </AppLayout>
    );
}
