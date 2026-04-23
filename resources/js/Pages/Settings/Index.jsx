import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/* ── Tab definitions ───────────────────────────────────────── */
const TABS = [
    { key: 'profile',    label: 'Profile',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { key: 'security',   label: 'Security',    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { key: 'categories', label: 'Categories',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
    { key: 'backups',    label: 'Backups',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
    { key: 'data',       label: 'Data',        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg> },
    { key: 'ai',         label: 'AI Settings', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
    { key: 'appearance', label: 'Appearance',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg> },
];

/* ── Small icons ───────────────────────────────────────────── */
const Spinner = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const PlusIco = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CameraIco = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const DownloadIco = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const RefreshIco = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const TrashIco = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const EyeIco = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIco = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const SunIco = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>;
const MoonIco = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content;

export default function SettingsIndex({ user, backupSettings, aiSetting }) {
    const [activeTab, setActiveTab] = useState('profile');

    /* ── Profile ── */
    const profileForm = useForm({
        name: user?.name || '', business_name: user?.business_name || '',
        phone: user?.phone || '', currency: user?.currency || 'PKR',
        timezone: user?.timezone || 'Asia/Karachi',
    });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });
    const pinForm = useForm({ pin: '' });

    /* ── Categories ── */
    const [categories, setCategories] = useState([]);
    const [showCatForm, setShowCatForm] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [catForm, setCatForm] = useState({ name: '', type: 'expense', color: '#6B7280' });

    /* ── Backups ── */
    const [backups, setBackups] = useState([]);
    const [backupsLoaded, setBackupsLoaded] = useState(false);
    const [backupCreating, setBackupCreating] = useState(false);
    const [restoreModal, setRestoreModal] = useState(null);
    const [restoring, setRestoring] = useState(false);
    const [bkSettings, setBkSettings] = useState(backupSettings || { schedule: 'manual', backup_time: '02:00', backup_day: 1, max_backups: 30 });
    const [bkSaving, setBkSaving] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    /* ── Data ── */
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [importFile, setImportFile] = useState(null);
    const [importMode, setImportMode] = useState('merge');
    const [importType, setImportType] = useState('excel');

    /* ── AI Settings ── */
    const [aiForm, setAiForm] = useState({
        provider: aiSetting?.provider || 'openai',
        api_key: '',
        model: aiSetting?.model || 'gpt-4o',
        custom_endpoint: aiSetting?.custom_endpoint || '',
        is_enabled: aiSetting?.is_enabled ?? false,
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const [aiSaving, setAiSaving] = useState(false);
    const [aiTesting, setAiTesting] = useState(false);
    const [aiTestResult, setAiTestResult] = useState(null);

    /* ── Appearance ── */
    const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
    const [darkToggling, setDarkToggling] = useState(false);

    /* ══ Handlers ═══════════════════════════════════════════════ */

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('photo', file);
        fd.append('_method', 'POST');
        router.post('/settings/photo', fd, { onSuccess: () => toast.success('Photo updated.') });
    };

    const saveCat = () => {
        const url = editCat ? `/categories/${editCat.id}` : '/categories';
        const method = editCat ? 'PUT' : 'POST';
        fetch(url, { method, headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), 'Accept': 'application/json' }, body: JSON.stringify(catForm) })
            .then(r => r.json()).then(cat => {
                if (!editCat) setCategories(p => [...p, cat]);
                setShowCatForm(false);
                toast.success(editCat ? 'Updated.' : 'Category created.');
                setEditCat(null);
            });
    };

    const loadBackups = () => {
        fetch('/backups', { headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' } })
            .then(r => r.json()).then(d => { setBackups(d.backups || []); setBackupsLoaded(true); });
    };

    const createBackup = async () => {
        setBackupCreating(true);
        try {
            const r = await fetch('/backups/create', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' } });
            const d = await r.json();
            if (d.error) { toast.error(d.error); } else { toast.success('Backup created!'); setBackups(d.backups || []); }
        } catch { toast.error('Backup failed.'); }
        setBackupCreating(false);
    };

    const deleteBackup = async (filename) => {
        if (!confirm('Delete this backup?')) return;
        const r = await fetch(`/backups/delete/${filename}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' } });
        const d = await r.json();
        toast.success('Backup deleted.'); setBackups(d.backups || []);
    };

    const doRestore = async () => {
        if (!restoreModal) return;
        setRestoring(true);
        try {
            const r = await fetch(`/backups/restore/${restoreModal.filename}`, { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' } });
            const d = await r.json();
            if (d.error) { toast.error(d.error); } else { toast.success('Restore complete! Refreshing…'); setTimeout(() => window.location.reload(), 1500); }
        } catch { toast.error('Restore failed.'); }
        setRestoring(false); setRestoreModal(null);
    };

    const handleUploadRestore = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadFile(file.name); setUploading(true);
        const fd = new FormData(); fd.append('backup_file', file);
        try {
            const r = await fetch('/backups/upload-restore', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' }, body: fd });
            const d = await r.json();
            if (d.error) { toast.error(d.error); } else { toast.success('Restored from upload!'); }
        } catch { toast.error('Upload restore failed.'); }
        setUploading(false); setUploadFile(null);
    };

    const saveBkSettings = async () => {
        setBkSaving(true);
        const r = await fetch('/backups/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' }, body: JSON.stringify(bkSettings) });
        const d = await r.json();
        toast.success(d.message || 'Saved.'); setBkSaving(false);
    };

    const handleImport = async () => {
        if (!importFile) return;
        setImporting(true); setImportResult(null);
        const fd = new FormData(); fd.append('import_file', importFile); fd.append('mode', importMode);
        const url = importType === 'excel' ? '/data/import-excel' : '/data/import-csv';
        try {
            const r = await fetch(url, { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' }, body: fd });
            const d = await r.json();
            if (d.error) { toast.error(d.error); } else { setImportResult(d); toast.success(d.message); }
        } catch { toast.error('Import failed.'); }
        setImporting(false);
    };

    const saveAiSettings = async () => {
        setAiSaving(true); setAiTestResult(null);
        const r = await fetch('/ai-insights/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' }, body: JSON.stringify(aiForm) });
        const d = await r.json();
        toast.success(d.message || 'AI settings saved.'); setAiSaving(false);
    };

    const testAiConnection = async () => {
        setAiTesting(true); setAiTestResult(null);
        if (!aiForm.api_key && !aiSetting?.has_key) { toast.error('Save your API key first.'); setAiTesting(false); return; }
        if (aiForm.api_key) await saveAiSettings();
        const r = await fetch('/ai-insights/test-connection', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' } });
        const d = await r.json();
        setAiTestResult(d); setAiTesting(false);
    };

    const toggleDarkMode = async () => {
        if (darkToggling) return;
        setDarkToggling(true);
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.classList.toggle('dark', newMode);
        await fetch('/settings/dark-mode', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' } });
        setDarkToggling(false);
    };

    /* ── Switch to backups tab and load data ── */
    const handleTabChange = (key) => {
        setActiveTab(key);
        if (key === 'backups' && !backupsLoaded) loadBackups();
    };

    /* ══ Render ═══════════════════════════════════════════════ */
    return (
        <AppLayout>
            <Head title="Settings" />

            <div className="page-header" style={{ marginBottom: 28 }}>
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your profile and system preferences</p>
                </div>
            </div>

            <div className="settings-layout-wrap">
                {/* Tab sidebar */}
                <div className="settings-tab-sidebar">
                    <div className="card" style={{ padding: 6 }}>
                        {TABS.map(tab => {
                            const active = activeTab === tab.key;
                            return (
                                <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                    padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: active ? '#F0FDF4' : 'transparent',
                                    color: active ? '#10B981' : '#64748B',
                                    fontWeight: active ? 600 : 500, fontSize: 14, transition: 'all 150ms',
                                }}>
                                    {tab.icon} {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content area */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* ── PROFILE ─────────────────────────────── */}
                    {activeTab === 'profile' && (
                        <div className="card">
                            <div className="section-title" style={{ marginBottom: 20 }}>Profile Information</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--sl-border)' }}>
                                <div style={{ position: 'relative' }}>
                                    {user?.profile_photo
                                        ? <img src={user.profile_photo} alt="" style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover' }} />
                                        : <div style={{ width: 72, height: 72, borderRadius: 16, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 800 }}>{user?.name?.[0]?.toUpperCase()}</div>
                                    }
                                    <label style={{ position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, background: '#0F172A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                                        <CameraIco /><input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                    </label>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: 'var(--sl-t1)', fontSize: 15 }}>{user?.name}</div>
                                    <div style={{ fontSize: 13, color: 'var(--sl-t3)', marginTop: 2 }}>{user?.email}</div>
                                </div>
                            </div>
                            <form onSubmit={e => { e.preventDefault(); profileForm.put('/settings/profile', { onSuccess: () => toast.success('Profile updated.') }); }}>
                                <div className="profile-form-grid">
                                    {[['Full Name','name','text'],['Business Name','business_name','text'],['Phone','phone','tel']].map(([label, field, type]) => (
                                        <div key={field}>
                                            <label className="label">{label}</label>
                                            <input type={type} value={profileForm.data[field]} onChange={e => profileForm.setData(field, e.target.value)} className="input-field" />
                                            {profileForm.errors[field] && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{profileForm.errors[field]}</p>}
                                        </div>
                                    ))}
                                    <div>
                                        <label className="label">Currency</label>
                                        <select value={profileForm.data.currency} onChange={e => profileForm.setData('currency', e.target.value)} className="input-field">
                                            <option value="PKR">PKR (Rs.)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Timezone</label>
                                        <select value={profileForm.data.timezone} onChange={e => profileForm.setData('timezone', e.target.value)} className="input-field">
                                            <option value="Asia/Karachi">Asia/Karachi</option><option value="UTC">UTC</option><option value="America/New_York">America/New_York</option><option value="Europe/London">Europe/London</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" disabled={profileForm.processing} className="btn-primary">{profileForm.processing ? <><Spinner /> Saving…</> : 'Save Profile'}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── SECURITY ─────────────────────────────── */}
                    {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 16 }}>Change Password</div>
                                <form onSubmit={e => { e.preventDefault(); passwordForm.put('/settings/password', { onSuccess: () => { passwordForm.reset(); toast.success('Password changed.'); } }); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {[['Current Password','current_password'],['New Password','password'],['Confirm New Password','password_confirmation']].map(([label, field]) => (
                                        <div key={field}>
                                            <label className="label">{label}</label>
                                            <input type="password" value={passwordForm.data[field]} onChange={e => passwordForm.setData(field, e.target.value)} className="input-field" />
                                            {passwordForm.errors[field] && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{passwordForm.errors[field]}</p>}
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" disabled={passwordForm.processing} className="btn-primary">Change Password</button>
                                    </div>
                                </form>
                            </div>
                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 6 }}>Set App PIN</div>
                                <p style={{ fontSize: 13, color: 'var(--sl-t3)', marginBottom: 16 }}>A 4-digit PIN for quick access.</p>
                                <form onSubmit={e => { e.preventDefault(); pinForm.put('/settings/pin', { onSuccess: () => { pinForm.reset(); toast.success('PIN updated.'); } }); }} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
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

                    {/* ── CATEGORIES ───────────────────────────── */}
                    {activeTab === 'categories' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div className="section-title">Custom Categories</div>
                                <button onClick={() => { setEditCat(null); setCatForm({ name: '', type: 'expense', color: '#6B7280' }); setShowCatForm(true); }} className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }}>
                                    <PlusIco /> Add Category
                                </button>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--sl-t3)', marginBottom: 16 }}>Manage your income and expense categories.</p>
                            <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--sl-t3)', fontSize: 13 }}>
                                Categories can be added here or inline in the transaction form.
                            </div>
                            <AnimatePresence>
                                {showCatForm && (
                                    <>
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} onClick={() => setShowCatForm(false)} />
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                                            <div style={{ background: 'var(--sl-surface)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360, boxShadow: 'var(--sh-modal)' }}>
                                                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--sl-t1)', marginBottom: 16 }}>{editCat ? 'Edit Category' : 'New Category'}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    <div><label className="label">Name</label><input type="text" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} className="input-field" /></div>
                                                    <div><label className="label">Type</label>
                                                        <select value={catForm.type} onChange={e => setCatForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                                                            <option value="income">Income</option><option value="expense">Expense</option><option value="both">Both</option>
                                                        </select>
                                                    </div>
                                                    <div><label className="label">Color</label><input type="color" value={catForm.color} onChange={e => setCatForm(p => ({ ...p, color: e.target.value }))} style={{ width: '100%', height: 40, borderRadius: 8, border: '1.5px solid var(--sl-border)', cursor: 'pointer' }} /></div>
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

                    {/* ── BACKUPS ──────────────────────────────── */}
                    {activeTab === 'backups' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* Create now */}
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <div className="section-title">Database Backups</div>
                                        <p style={{ fontSize: 13, color: 'var(--sl-t3)', marginTop: 4 }}>Create and restore full database snapshots.</p>
                                    </div>
                                    <button onClick={createBackup} disabled={backupCreating} className="btn-primary">
                                        {backupCreating ? <><Spinner /> Creating…</> : <><DownloadIco /> Create Backup Now</>}
                                    </button>
                                </div>
                            </div>

                            {/* Schedule settings */}
                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 16 }}>Backup Schedule</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
                                    <div>
                                        <label className="label">Schedule</label>
                                        <select value={bkSettings.schedule} onChange={e => setBkSettings(p => ({ ...p, schedule: e.target.value }))} className="input-field">
                                            <option value="manual">Manual only</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                    {bkSettings.schedule !== 'manual' && (
                                        <div>
                                            <label className="label">Time (HH:MM)</label>
                                            <input type="time" value={bkSettings.backup_time} onChange={e => setBkSettings(p => ({ ...p, backup_time: e.target.value }))} className="input-field" />
                                        </div>
                                    )}
                                    {bkSettings.schedule === 'weekly' && (
                                        <div>
                                            <label className="label">Day of Week</label>
                                            <select value={bkSettings.backup_day} onChange={e => setBkSettings(p => ({ ...p, backup_day: +e.target.value }))} className="input-field">
                                                {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d, i) => <option key={i} value={i}>{d}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    {bkSettings.schedule === 'monthly' && (
                                        <div>
                                            <label className="label">Day of Month</label>
                                            <input type="number" min="1" max="28" value={bkSettings.backup_day} onChange={e => setBkSettings(p => ({ ...p, backup_day: +e.target.value }))} className="input-field" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="label">Max Backups to Keep</label>
                                        <input type="number" min="1" max="365" value={bkSettings.max_backups} onChange={e => setBkSettings(p => ({ ...p, max_backups: +e.target.value }))} className="input-field" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                                    <button onClick={saveBkSettings} disabled={bkSaving} className="btn-primary">{bkSaving ? <><Spinner /> Saving…</> : 'Save Schedule'}</button>
                                </div>
                            </div>

                            {/* Upload restore */}
                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 10 }}>Restore from File</div>
                                <p style={{ fontSize: 13, color: 'var(--sl-t3)', marginBottom: 14 }}>Upload a previously downloaded .sql or .sql.gz backup file.</p>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '9px 18px', background: 'var(--sl-surface-2)', border: '1.5px dashed var(--sl-border)', borderRadius: 8, fontSize: 13, color: 'var(--sl-t2)', fontWeight: 500 }}>
                                    {uploading ? <><Spinner /> Restoring…</> : <><RefreshIco /> {uploadFile || 'Choose backup file…'}</>}
                                    <input type="file" accept=".sql,.gz" onChange={handleUploadRestore} style={{ display: 'none' }} disabled={uploading} />
                                </label>
                            </div>

                            {/* Backup list */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--sl-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div className="section-title">Backup History ({backups.length})</div>
                                    <button onClick={loadBackups} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sl-t3)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: 'inherit' }}>
                                        <RefreshIco /> Refresh
                                    </button>
                                </div>
                                {backups.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--sl-t3)', fontSize: 13 }}>No backups yet. Click "Create Backup Now" to start.</div>
                                ) : (
                                    <div>
                                        {backups.map(b => (
                                            <div key={b.filename} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--sl-border-muted)', flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sl-t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.filename}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--sl-t3)', marginTop: 2 }}>{b.date} · {b.size_mb} MB</div>
                                                </div>
                                                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: b.type === 'Scheduled' ? 'rgba(96,165,250,0.15)' : 'rgba(16,185,129,0.12)', color: b.type === 'Scheduled' ? '#60A5FA' : '#10B981', flexShrink: 0 }}>{b.type}</span>
                                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                                    <a href={`/backups/download/${b.filename}`} className="btn btn-secondary btn-sm" title="Download"><DownloadIco /></a>
                                                    <button onClick={() => setRestoreModal(b)} className="btn btn-sm" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }} title="Restore"><RefreshIco /></button>
                                                    <button onClick={() => deleteBackup(b.filename)} className="btn btn-danger btn-sm" title="Delete"><TrashIco /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── DATA ─────────────────────────────────── */}
                    {activeTab === 'data' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* Export */}
                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 6 }}>Export All Data</div>
                                <p style={{ fontSize: 13, color: 'var(--sl-t3)', marginBottom: 20 }}>Download your entire database in your preferred format.</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
                                    {[
                                        { href: '/data/export-sql', label: 'Full SQL Export', desc: 'Raw database dump (.sql)', color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
                                        { href: '/data/export-excel', label: 'Excel Export', desc: 'All data in one .xlsx file', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
                                        { href: '/data/export-zip-csv', label: 'CSV ZIP Export', desc: 'Individual .csv files zipped', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
                                    ].map(item => (
                                        <a key={item.href} href={item.href} style={{ padding: 20, borderRadius: 12, border: '1.5px solid var(--sl-border)', background: item.bg, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6, transition: 'all 150ms' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <DownloadIco />
                                            <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.label}</div>
                                            <div style={{ fontSize: 12, color: 'var(--sl-t3)' }}>{item.desc}</div>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Import */}
                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 6 }}>Import Data</div>
                                <p style={{ fontSize: 13, color: 'var(--sl-t3)', marginBottom: 20 }}>Import from Excel (.xlsx) or ZIP of CSVs. Max 50MB.</p>

                                <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                                    {[['excel','Excel / XLSX'],['csv','CSV / ZIP']].map(([val, lbl]) => (
                                        <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--sl-t2)' }}>
                                            <input type="radio" name="importType" value={val} checked={importType === val} onChange={() => setImportType(val)} /> {lbl}
                                        </label>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                                    {[['merge','Merge (add alongside existing)'],['replace','Replace (overwrite all existing data)']].map(([val, lbl]) => (
                                        <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: val === 'replace' ? '#EF4444' : 'var(--sl-t2)' }}>
                                            <input type="radio" name="importMode" value={val} checked={importMode === val} onChange={() => setImportMode(val)} /> {lbl}
                                        </label>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '9px 18px', background: 'var(--sl-surface-2)', border: '1.5px dashed var(--sl-border)', borderRadius: 8, fontSize: 13, color: 'var(--sl-t2)', fontWeight: 500 }}>
                                        {importFile ? importFile.name : 'Choose file…'}
                                        <input type="file" accept=".xlsx,.xls,.csv,.zip" onChange={e => setImportFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                                    </label>
                                    <button onClick={handleImport} disabled={!importFile || importing} className="btn-primary">
                                        {importing ? <><Spinner /> Importing…</> : 'Import Data'}
                                    </button>
                                </div>

                                {importResult && (
                                    <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--sl-green-bg)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.25)' }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#10B981', marginBottom: 6 }}>{importResult.message}</div>
                                        {importResult.stats && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {Object.entries(importResult.stats).map(([k, v]) => (
                                                    <span key={k} style={{ fontSize: 12, color: 'var(--sl-t2)', background: 'var(--sl-surface)', padding: '3px 10px', borderRadius: 99 }}>{k}: {v}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)', fontSize: 12, color: '#EF4444' }}>
                                    ⚠️ "Replace" mode will permanently delete all existing data before importing. Make a backup first.
                                </div>
                            </div>

                            {/* SQL import */}
                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 6 }}>SQL Import (Full Replace)</div>
                                <p style={{ fontSize: 13, color: 'var(--sl-t3)', marginBottom: 14 }}>Import a full SQL dump to completely replace the database. Same as Restore.</p>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '9px 18px', background: 'var(--sl-surface-2)', border: '1.5px dashed var(--sl-border)', borderRadius: 8, fontSize: 13, color: 'var(--sl-t2)', fontWeight: 500 }}>
                                    Upload SQL file (.sql or .sql.gz)
                                    <input type="file" accept=".sql,.gz" onChange={async e => {
                                        const file = e.target.files?.[0]; if (!file) return;
                                        if (!confirm('This will REPLACE ALL DATA. Are you absolutely sure?')) return;
                                        const fd = new FormData(); fd.append('import_file', file);
                                        const r = await fetch('/data/import-sql', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' }, body: fd });
                                        const d = await r.json();
                                        d.error ? toast.error(d.error) : toast.success(d.message);
                                    }} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* ── AI SETTINGS ─────────────────────────── */}
                    {activeTab === 'ai' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 6 }}>AI Configuration</div>
                                <p style={{ fontSize: 13, color: 'var(--sl-t3)', marginBottom: 20 }}>Connect an AI provider to unlock financial insights on the AI Insights page.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div>
                                        <label className="label">AI Provider</label>
                                        <select value={aiForm.provider} onChange={e => setAiForm(p => ({ ...p, provider: e.target.value }))} className="input-field">
                                            <option value="openai">OpenAI (ChatGPT)</option>
                                            <option value="anthropic">Anthropic Claude</option>
                                            <option value="custom">Custom Endpoint</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="label">API Key {aiSetting?.has_key && <span style={{ color: '#10B981', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>✓ saved</span>}</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type={showApiKey ? 'text' : 'password'} value={aiForm.api_key} onChange={e => setAiForm(p => ({ ...p, api_key: e.target.value }))} className="input-field" placeholder={aiSetting?.has_key ? '(enter new key to replace)' : 'sk-... or anthropic key...'} style={{ paddingRight: 44 }} />
                                            <button type="button" onClick={() => setShowApiKey(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sl-t3)' }}>
                                                {showApiKey ? <EyeOffIco /> : <EyeIco />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Model Name</label>
                                        <input type="text" value={aiForm.model} onChange={e => setAiForm(p => ({ ...p, model: e.target.value }))} className="input-field" placeholder="gpt-4o or claude-sonnet-4-6" />
                                        <p style={{ fontSize: 11, color: 'var(--sl-t3)', marginTop: 4 }}>Examples: gpt-4o, gpt-4-turbo, claude-sonnet-4-6, claude-opus-4-7</p>
                                    </div>

                                    {aiForm.provider === 'custom' && (
                                        <div>
                                            <label className="label">Custom Endpoint URL</label>
                                            <input type="url" value={aiForm.custom_endpoint} onChange={e => setAiForm(p => ({ ...p, custom_endpoint: e.target.value }))} className="input-field" placeholder="https://your-endpoint/v1/chat/completions" />
                                        </div>
                                    )}

                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--sl-t2)' }}>
                                        <input type="checkbox" checked={aiForm.is_enabled} onChange={e => setAiForm(p => ({ ...p, is_enabled: e.target.checked }))} style={{ width: 16, height: 16 }} />
                                        Enable AI Insights
                                    </label>

                                    {aiTestResult && (
                                        <div style={{ padding: '10px 14px', borderRadius: 8, background: aiTestResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${aiTestResult.success ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, fontSize: 13, color: aiTestResult.success ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                                            {aiTestResult.success ? '✓ ' : '✗ '}{aiTestResult.message}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
                                        <button onClick={testAiConnection} disabled={aiTesting} className="btn-secondary">
                                            {aiTesting ? <><Spinner /> Testing…</> : 'Test Connection'}
                                        </button>
                                        <button onClick={saveAiSettings} disabled={aiSaving} className="btn-primary">
                                            {aiSaving ? <><Spinner /> Saving…</> : 'Save AI Settings'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 8 }}>What AI Insights does</div>
                                <ul style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 2, paddingLeft: 20, margin: 0 }}>
                                    {['Financial health score (0-100)', 'Top spending category analysis', 'Income trend (this month vs last)', 'Unnecessary expense identification', 'Loan & debt situation summary', 'Budget performance review', 'Savings opportunity finder', 'Ask AI any financial question'].map(i => <li key={i}>{i}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* ── APPEARANCE ───────────────────────────── */}
                    {activeTab === 'appearance' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 6 }}>Theme</div>
                                <p style={{ fontSize: 13, color: 'var(--sl-t3)', marginBottom: 20 }}>Choose between light and dark mode. Saved to your account and persists across devices.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                                    {[
                                        { mode: false, label: 'Light Mode', desc: 'Clean white interface', icon: <SunIco />, colors: ['#F7F8FA','#FFFFFF','#0F172A','#10B981'] },
                                        { mode: true,  label: 'Dark Mode',  desc: 'Easy on the eyes',    icon: <MoonIco />, colors: ['#0F172A','#1E293B','#F1F5F9','#10B981'] },
                                    ].map(opt => (
                                        <button key={opt.label} onClick={() => { if (darkMode !== opt.mode) toggleDarkMode(); }}
                                            style={{
                                                padding: 20, borderRadius: 14, border: `2px solid ${darkMode === opt.mode ? '#10B981' : 'var(--sl-border)'}`,
                                                background: darkMode === opt.mode ? 'rgba(16,185,129,0.08)' : 'var(--sl-surface-2)',
                                                cursor: 'pointer', textAlign: 'left', transition: 'all 200ms ease', fontFamily: 'inherit',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                                <span style={{ color: darkMode === opt.mode ? '#10B981' : 'var(--sl-t3)' }}>{opt.icon}</span>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--sl-t1)' }}>{opt.label}</span>
                                                {darkMode === opt.mode && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#10B981', fontWeight: 700 }}>ACTIVE</span>}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--sl-t3)', marginBottom: 14 }}>{opt.desc}</div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {opt.colors.map((c, i) => <div key={i} style={{ width: 20, height: 20, borderRadius: 5, background: c, border: '1px solid rgba(0,0,0,0.1)' }} />)}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {darkToggling && (
                                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--sl-t3)' }}>
                                        <Spinner /> Applying theme…
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Restore confirmation modal ─────────────────── */}
            <AnimatePresence>
                {restoreModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} onClick={() => !restoring && setRestoreModal(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                            <div style={{ background: 'var(--sl-surface)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420, boxShadow: 'var(--sh-modal)', border: '2px solid rgba(239,68,68,0.3)' }}>
                                <div style={{ fontSize: 22, marginBottom: 10 }}>⚠️</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#EF4444', marginBottom: 10 }}>Confirm Restore</div>
                                <p style={{ fontSize: 13, color: 'var(--sl-t2)', lineHeight: 1.6, marginBottom: 20 }}>
                                    This will replace <strong>ALL current data</strong> with the backup from <strong>{restoreModal.date}</strong>. This cannot be undone.
                                </p>
                                <div style={{ fontSize: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: '#EF4444', marginBottom: 20 }}>
                                    File: {restoreModal.filename} ({restoreModal.size_mb} MB)
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setRestoreModal(null)} disabled={restoring} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                    <button onClick={doRestore} disabled={restoring} style={{ flex: 1, justifyContent: 'center', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', fontSize: 14 }}>
                                        {restoring ? <><Spinner /> Restoring…</> : 'Confirm Restore'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
