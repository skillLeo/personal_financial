import { motion, AnimatePresence } from 'framer-motion';

const WarningIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading, confirmLabel = 'Delete', confirmClass = 'btn-danger' }) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 50, backdropFilter: 'blur(3px)' }}
                        onClick={onCancel}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                    >
                        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 24px 64px rgba(15,23,42,0.2)', width: '100%', maxWidth: 420, padding: 24 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ width: 42, height: 42, background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#EF4444' }}>
                                    <WarningIcon />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, color: '#0F172A', fontSize: 15, marginBottom: 4 }}>{title}</h3>
                                    <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{message}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                                <button onClick={onCancel} className="btn btn-secondary" style={{ minWidth: 80 }}>Cancel</button>
                                <button
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className={`btn ${confirmClass}`}
                                    style={{ minWidth: 80, opacity: loading ? 0.6 : 1 }}
                                >
                                    {loading ? 'Processing…' : confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
