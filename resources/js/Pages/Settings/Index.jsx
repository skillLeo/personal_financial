import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'security', label: 'Security' },
    { key: 'categories', label: 'Categories' },
];

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);
const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);
const TagIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
);
const CameraIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
);
const SpinnerIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
);
const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

const ICONS = { profile: UserIcon, security: LockIcon, categories: TagIcon };

export default function SettingsIndex({ user }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [categories, setCategories] = useState([]);
    const [showCatForm, setShowCatForm] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [catForm, setCatForm] = useState({ name: '', type: 'expense', color: '#6B7280' });

    const profileForm = useForm({
        name: user?.name || '',
        business_name: user?.business_name || '',
        phone: user?.phone || '',
        currency: user?.currency || 'PKR',
        timezone: user?.timezone || 'Asia/Karachi',
    });

    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });
    const pinForm = useForm({ pin: '' });

    const handleProfileSave = (e) => {
        e.preventDefault();
        profileForm.put('/settings/profile', { onSuccess: () => toast.success('Profile updated.') });
    };

    const handlePasswordSave = (e) => {
        e.preventDefault();
        passwordForm.put('/settings/password', {
            onSuccess: () => { passwordForm.reset(); toast.success('Password changed.'); },
        });
    };

    const handlePinSave = (e) => {
        e.preventDefault();
        pinForm.put('/settings/pin', {
            onSuccess: () => { pinForm.reset(); toast.success('PIN updated.'); },
        });
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('photo', file);
        fd.append('_method', 'POST');
        router.post('/settings/photo', fd, { onSuccess: () => toast.success('Photo updated.') });
    };

    const saveCat = () => {
        if (editCat) {
            fetch(`/categories/${editCat.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content, 'Accept': 'application/json' },
                body: JSON.stringify(catForm),
            }).then(r => r.json()).then(() => { setShowCatForm(false); toast.success('Updated.'); });
        } else {
            fetch('/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content, 'Accept': 'application/json' },
                body: JSON.stringify(catForm),
            }).then(r => r.json()).then(cat => {
                setCategories(p => [...p, cat]);
                setShowCatForm(false);
                toast.success('Category created.');
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Settings" />

            <div className="page-header" style={{ marginBottom: 28 }}>
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your profile and preferences</p>
                </div>
            </div>

            <div className="settings-layout-wrap">
                {/* Tab sidebar */}
                <div className="settings-tab-sidebar">
                    <div className="card" style={{ padding: 6 }}>
                        {TABS.map(tab => {
                            const Icon = ICONS[tab.key];
                            const active = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                        padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                        background: active ? '#F0FDF4' : 'transparent',
                                        color: active ? '#10B981' : '#64748B',
                                        fontWeight: active ? 600 : 500, fontSize: 14,
                                        transition: 'all 150ms',
                                    }}
                                >
                                    <Icon />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="card">
                            <div className="section-title" style={{ marginBottom: 20 }}>Profile Information</div>

                            {/* Photo upload */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #F1F5F9' }}>
                                <div style={{ position: 'relative' }}>
                                    {user?.profile_photo ? (
                                        <img src={user.profile_photo} alt="" style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 72, height: 72, borderRadius: 16, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 800 }}>
                                            {user?.name?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <label style={{ position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, background: '#0F172A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                                        <CameraIcon />
                                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                    </label>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>{user?.name}</div>
                                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{user?.email}</div>
                                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Click the camera icon to update your photo</div>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSave}>
                                <div className="profile-form-grid">
                                    <div>
                                        <label className="label">Full Name</label>
                                        <input type="text" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} className="input-field" />
                                        {profileForm.errors.name && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{profileForm.errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="label">Business Name</label>
                                        <input type="text" value={profileForm.data.business_name} onChange={e => profileForm.setData('business_name', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Phone</label>
                                        <input type="tel" value={profileForm.data.phone} onChange={e => profileForm.setData('phone', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Currency</label>
                                        <select value={profileForm.data.currency} onChange={e => profileForm.setData('currency', e.target.value)} className="input-field">
                                            <option value="PKR">PKR (Rs.)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Timezone</label>
                                        <select value={profileForm.data.timezone} onChange={e => profileForm.setData('timezone', e.target.value)} className="input-field">
                                            <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">America/New_York</option>
                                            <option value="Europe/London">Europe/London</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                                    <button type="submit" disabled={profileForm.processing} className="btn-primary">
                                        {profileForm.processing ? <><SpinnerIcon /> Saving...</> : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 16 }}>Change Password</div>
                                <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div>
                                        <label className="label">Current Password</label>
                                        <input type="password" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} className="input-field" />
                                        {passwordForm.errors.current_password && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{passwordForm.errors.current_password}</p>}
                                    </div>
                                    <div>
                                        <label className="label">New Password</label>
                                        <input type="password" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} className="input-field" />
                                        {passwordForm.errors.password && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{passwordForm.errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="label">Confirm New Password</label>
                                        <input type="password" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} className="input-field" />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" disabled={passwordForm.processing} className="btn-primary">Change Password</button>
                                    </div>
                                </form>
                            </div>

                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 6 }}>Set App PIN</div>
                                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>A 4-digit PIN for quick access on mobile.</p>
                                <form onSubmit={handlePinSave} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="label">4-Digit PIN</label>
                                        <input type="password" maxLength={4} value={pinForm.data.pin} onChange={e => pinForm.setData('pin', e.target.value)} className="input-field" placeholder="••••" inputMode="numeric" pattern="[0-9]{4}" />
                                        {pinForm.errors.pin && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{pinForm.errors.pin}</p>}
                                    </div>
                                    <button type="submit" disabled={pinForm.processing} className="btn-primary">Set PIN</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Categories Tab */}
                    {activeTab === 'categories' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div className="section-title">Custom Categories</div>
                                <button
                                    onClick={() => { setEditCat(null); setCatForm({ name: '', type: 'expense', color: '#6B7280' }); setShowCatForm(true); }}
                                    className="btn-primary"
                                    style={{ fontSize: 12, padding: '7px 14px' }}
                                >
                                    <PlusIcon /> Add Category
                                </button>
                            </div>
                            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Manage your custom income and expense categories.</p>
                            <div style={{ textAlign: 'center', padding: '32px 24px', color: '#94A3B8', fontSize: 13 }}>
                                Categories are managed per transaction. Use the transaction form to add categories inline, or manage them from here.
                            </div>

                            <AnimatePresence>
                                {showCatForm && (
                                    <>
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} onClick={() => setShowCatForm(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                                        >
                                            <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360, boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
                                                <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', marginBottom: 16 }}>{editCat ? 'Edit Category' : 'New Category'}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    <div>
                                                        <label className="label">Name</label>
                                                        <input type="text" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
                                                    </div>
                                                    <div>
                                                        <label className="label">Type</label>
                                                        <select value={catForm.type} onChange={e => setCatForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                                                            <option value="income">Income</option>
                                                            <option value="expense">Expense</option>
                                                            <option value="both">Both</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="label">Color</label>
                                                        <input type="color" value={catForm.color} onChange={e => setCatForm(p => ({ ...p, color: e.target.value }))} style={{ width: '100%', height: 40, borderRadius: 8, border: '1.5px solid #E2E8F0', cursor: 'pointer' }} />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                                                        <button onClick={() => setShowCatForm(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                                        <button onClick={saveCat} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
