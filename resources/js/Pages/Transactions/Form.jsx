import { useState, useEffect, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CurrencyInput from '@/Components/CurrencyInput';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
const XMarkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const PhotoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94A3B8' }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
);
const PlusCircleIcon = ({ className }) => (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
);
const ArrowPathIcon = ({ className }) => (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
    </svg>
);
import toast from 'react-hot-toast';

export default function TransactionForm({ transaction, accounts, categories, people, type: defaultType }) {
    const isEdit = !!transaction;
    const DRAFT_KEY = 'skillleo_tx_draft';

    const loadDraft = () => {
        if (isEdit) return {};
        try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch { return {}; }
    };

    const draft = loadDraft();

    const { data, setData, post, put, processing, errors, reset } = useForm({
        type:             transaction?.type || draft.type || defaultType || 'expense',
        amount:           transaction?.amount || draft.amount || '',
        account_id:       transaction?.account_id || draft.account_id || accounts?.[0]?.id || '',
        category_id:      transaction?.category_id || draft.category_id || '',
        person_id:        transaction?.person_id || draft.person_id || '',
        description:      transaction?.description || draft.description || '',
        transaction_date: transaction?.transaction_date || draft.transaction_date || new Date().toISOString().split('T')[0],
        transaction_time: transaction?.transaction_time || draft.transaction_time || '',
        reference_number: transaction?.reference_number || draft.reference_number || '',
        is_recurring:     transaction?.is_recurring || false,
        recurring_type:   transaction?.recurring_type || '',
        recurring_end_date: transaction?.recurring_end_date || '',
        photos:           [],
        remove_photos:    [],
    });

    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState(transaction?.photos || []);
    const [newPersonModal, setNewPersonModal] = useState(false);
    const [newPersonName, setNewPersonName] = useState('');
    const [newCatModal, setNewCatModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [localPeople, setLocalPeople] = useState(people || []);
    const [localCategories, setLocalCategories] = useState(categories || []);

    const filteredCategories = localCategories.filter(c =>
        c.type === data.type || c.type === 'both'
    );

    useEffect(() => {
        if (!isEdit) {
            const d = { ...data };
            delete d.photos;
            delete d.remove_photos;
            localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
        }
    }, [data]);

    const onDrop = useCallback((acceptedFiles) => {
        const newPreviews = acceptedFiles.map(f => ({ file: f, url: URL.createObjectURL(f) }));
        setPhotoPreviews(p => [...p, ...newPreviews]);
        setData('photos', [...data.photos, ...acceptedFiles]);
    }, [data.photos]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxSize: 5 * 1024 * 1024,
        maxFiles: 10,
    });

    const removePreview = (i) => {
        setPhotoPreviews(p => p.filter((_, idx) => idx !== i));
        setData('photos', data.photos.filter((_, idx) => idx !== i));
    };

    const removeExisting = (photoId) => {
        setExistingPhotos(p => p.filter(ph => ph.id !== photoId));
        setData('remove_photos', [...data.remove_photos, photoId]);
    };

    const addQuickPerson = () => {
        if (!newPersonName.trim()) return;
        router.post('/people', { name: newPersonName, relationship: 'other' }, {
            preserveState: true,
            onSuccess: (page) => {
                const people = page.props.people || localPeople;
                const lastPerson = people[people.length - 1];
                if (lastPerson) {
                    setLocalPeople(people);
                    setData('person_id', lastPerson.id);
                }
                setNewPersonModal(false);
                setNewPersonName('');
                toast.success('Person added.');
            },
        });
    };

    const addQuickCategory = () => {
        if (!newCatName.trim()) return;
        fetch('/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content, 'Accept': 'application/json' },
            body: JSON.stringify({ name: newCatName, type: data.type, color: '#6B7280', icon: 'TagIcon' }),
        })
        .then(r => r.json())
        .then(cat => {
            setLocalCategories(p => [...p, cat]);
            setData('category_id', cat.id);
            setNewCatModal(false);
            setNewCatName('');
            toast.success('Category created.');
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => {
            if (k === 'photos') {
                v.forEach(f => formData.append('photos[]', f));
            } else if (k === 'remove_photos') {
                v.forEach(id => formData.append('remove_photos[]', id));
            } else if (v !== null && v !== undefined && v !== '') {
                formData.append(k, v);
            }
        });

        if (isEdit) {
            formData.append('_method', 'PUT');
            router.post(`/transactions/${transaction.id}`, formData, {
                onSuccess: () => { localStorage.removeItem(DRAFT_KEY); },
                onError: () => toast.error('Please fix the errors below.'),
            });
        } else {
            router.post('/transactions', formData, {
                onSuccess: () => { localStorage.removeItem(DRAFT_KEY); reset(); setPhotoPreviews([]); },
                onError: () => toast.error('Please fix the errors below.'),
            });
        }
    };

    const typeBtn = (t, label, color) => (
        <button
            type="button"
            onClick={() => setData('type', t)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${data.type === t ? `bg-[${color}] text-white shadow-lg` : 'bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200'}`}
            style={data.type === t ? { background: color } : {}}
        >
            {label}
        </button>
    );

    return (
        <AppLayout>
            <Head title={isEdit ? 'Edit Transaction' : 'Add Transaction'} />

            <div className="max-w-2xl mx-auto">
                <h1 className="page-title mb-6">{isEdit ? 'Edit Transaction' : 'New Transaction'}</h1>

                <form onSubmit={submit} className="space-y-5">
                    {/* Type selector */}
                    <div className="card !p-4">
                        <div className="flex gap-3">
                            {typeBtn('income', '💰 Income', '#10B981')}
                            {typeBtn('expense', '💸 Expense', '#EF4444')}
                            {typeBtn('transfer', '🔄 Transfer', '#6366F1')}
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="card">
                        <label className="label text-base mb-3">Amount</label>
                        <CurrencyInput
                            value={data.amount}
                            onChange={v => setData('amount', v)}
                            large
                            placeholder="0"
                        />
                        {errors.amount && <p className="text-xs text-[#EF4444] mt-2">{errors.amount}</p>}
                    </div>

                    {/* Category */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <label className="label !mb-0">Category</label>
                            <button type="button" onClick={() => setNewCatModal(true)} className="text-xs text-[#10B981] flex items-center gap-1">
                                <PlusCircleIcon className="w-3.5 h-3.5" /> New Category
                            </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {filteredCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setData('category_id', cat.id)}
                                    className={`p-3 rounded-xl flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                                        data.category_id == cat.id
                                            ? 'ring-2 ring-offset-1 scale-105'
                                            : 'bg-[#F8FAFC] hover:bg-gray-100'
                                    }`}
                                    style={data.category_id == cat.id ? { ringColor: cat.color, background: cat.color + '20' } : {}}
                                >
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: cat.color }}>
                                        {cat.name[0]}
                                    </div>
                                    <span className="text-center leading-tight">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                        {errors.category_id && <p className="text-xs text-[#EF4444] mt-2">{errors.category_id}</p>}
                    </div>

                    {/* Account */}
                    <div className="card">
                        <label className="label mb-3">Account</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {accounts?.map(acc => (
                                <button
                                    key={acc.id}
                                    type="button"
                                    onClick={() => setData('account_id', acc.id)}
                                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                                        data.account_id == acc.id ? 'border-[#10B981] bg-[#F0FDF4]' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="text-sm font-semibold text-[#0F172A]">{acc.name}</div>
                                    <div className="text-xs text-[#94A3B8] capitalize">{acc.type}</div>
                                    <div className={`text-xs font-semibold mt-1 ${acc.balance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                        Rs. {Number(acc.balance || 0).toLocaleString()}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {errors.account_id && <p className="text-xs text-[#EF4444] mt-2">{errors.account_id}</p>}
                    </div>

                    {/* Date, Time, Person, Description row */}
                    <div className="card space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Date *</label>
                                <input type="date" value={data.transaction_date} onChange={e => setData('transaction_date', e.target.value)} className="input-field" />
                                {errors.transaction_date && <p className="text-xs text-[#EF4444] mt-1">{errors.transaction_date}</p>}
                            </div>
                            <div>
                                <label className="label">Time</label>
                                <input type="time" value={data.transaction_time} onChange={e => setData('transaction_time', e.target.value)} className="input-field" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="label !mb-0">Person (optional)</label>
                                <button type="button" onClick={() => setNewPersonModal(true)} className="text-xs text-[#10B981] flex items-center gap-1">
                                    <PlusCircleIcon className="w-3.5 h-3.5" /> Add Person
                                </button>
                            </div>
                            <select value={data.person_id || ''} onChange={e => setData('person_id', e.target.value)} className="input-field">
                                <option value="">No person</option>
                                {localPeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="label">Description</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="input-field resize-none"
                                rows={2}
                                placeholder="What was this for?"
                            />
                        </div>

                        <div>
                            <label className="label">Reference Number</label>
                            <input type="text" value={data.reference_number} onChange={e => setData('reference_number', e.target.value)} className="input-field" placeholder="Invoice # or receipt #" />
                        </div>
                    </div>

                    {/* Recurring */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-[#0F172A]">Recurring Transaction</div>
                                <div className="text-xs text-[#94A3B8]">Automatically repeat this transaction</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setData('is_recurring', !data.is_recurring)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.is_recurring ? 'bg-[#10B981]' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.is_recurring ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        {data.is_recurring && (
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                                <div>
                                    <label className="label">Frequency</label>
                                    <select value={data.recurring_type} onChange={e => setData('recurring_type', e.target.value)} className="input-field">
                                        <option value="">Select...</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">End Date</label>
                                    <input type="date" value={data.recurring_end_date} onChange={e => setData('recurring_end_date', e.target.value)} className="input-field" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Photos */}
                    <div className="card">
                        <label className="label mb-3">Photos (receipts, proofs)</label>

                        {existingPhotos.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-3">
                                {existingPhotos.map(photo => (
                                    <div key={photo.id} className="relative">
                                        <img src={photo.url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => removeExisting(photo.id)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] rounded-full flex items-center justify-center"
                                        >
                                            <XMarkIcon className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {photoPreviews.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-3">
                                {photoPreviews.map((p, i) => (
                                    <div key={i} className="relative">
                                        <img src={p.url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => removePreview(i)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] rounded-full flex items-center justify-center"
                                        >
                                            <XMarkIcon className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-[#10B981] bg-[#F0FDF4]' : 'border-gray-200 hover:border-[#10B981]'}`}
                        >
                            <input {...getInputProps()} />
                            <PhotoIcon className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                            <p className="text-sm text-[#64748B]">{isDragActive ? 'Drop here' : 'Drag photos or click to upload'}</p>
                            <p className="text-xs text-[#94A3B8] mt-1">Max 5MB per image</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={() => window.history.back()} className="btn-secondary flex-1 justify-center">Cancel</button>
                        <button type="submit" disabled={processing} className="btn-primary flex-1 justify-center">
                            {processing ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Saving...</> : (isEdit ? 'Update Transaction' : 'Add Transaction')}
                        </button>
                    </div>
                </form>

                {/* Add Person Modal */}
                <AnimatePresence>
                    {newPersonModal && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setNewPersonModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            >
                                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                                    <h3 className="font-bold text-[#0F172A] mb-4">Quick Add Person</h3>
                                    <input
                                        type="text"
                                        value={newPersonName}
                                        onChange={e => setNewPersonName(e.target.value)}
                                        className="input-field mb-4"
                                        placeholder="Person's name"
                                        autoFocus
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={() => setNewPersonModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                                        <button onClick={addQuickPerson} className="btn-primary flex-1 justify-center">Add</button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Add Category Modal */}
                <AnimatePresence>
                    {newCatModal && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setNewCatModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            >
                                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                                    <h3 className="font-bold text-[#0F172A] mb-4">New Category</h3>
                                    <input
                                        type="text"
                                        value={newCatName}
                                        onChange={e => setNewCatName(e.target.value)}
                                        className="input-field mb-4"
                                        placeholder="Category name"
                                        autoFocus
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={() => setNewCatModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                                        <button onClick={addQuickCategory} className="btn-primary flex-1 justify-center">Create</button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
