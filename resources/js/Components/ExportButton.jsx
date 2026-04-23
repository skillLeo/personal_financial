import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);
const ChevDown = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);

/**
 * ExportButton — renders a dropdown with Excel and CSV export options.
 * Props:
 *   baseUrl  — e.g. '/export/transactions'
 *   filters  — object of current filter params to append as query string
 *   mobileIconOnly — bool — on mobile show icon only
 */
export default function ExportButton({ baseUrl, filters = {}, mobileIconOnly = true }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const buildUrl = (format) => {
        const params = new URLSearchParams({ ...filters, format });
        return `${baseUrl}?${params.toString()}`;
    };

    return (
        <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: mobileIconOnly ? '9px' : '9px 14px',
                    borderRadius: 8, border: '1.5px solid var(--sl-border)',
                    background: 'var(--sl-surface)', color: 'var(--sl-t2)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    fontFamily: 'inherit', transition: 'all 150ms', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sl-border-focus)'; e.currentTarget.style.color = 'var(--sl-t1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--sl-border)'; e.currentTarget.style.color = 'var(--sl-t2)'; }}
                title="Export data"
            >
                <DownloadIcon />
                <span className={mobileIconOnly ? 'hidden sm:inline' : undefined}>Export</span>
                <span className={mobileIconOnly ? 'hidden sm:inline' : undefined}><ChevDown /></span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.1 }}
                        style={{
                            position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                            background: 'var(--sl-surface)', borderRadius: 10,
                            border: '1px solid var(--sl-border)',
                            boxShadow: 'var(--sh-drop)', zIndex: 100,
                            minWidth: 180, overflow: 'hidden',
                        }}
                    >
                        {[
                            { format: 'xlsx', label: 'Export as Excel', ext: '.xlsx', color: '#10B981' },
                            { format: 'csv',  label: 'Export as CSV',   ext: '.csv',  color: '#6366F1' },
                        ].map(opt => (
                            <a
                                key={opt.format}
                                href={buildUrl(opt.format)}
                                onClick={() => setOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '11px 16px', textDecoration: 'none',
                                    color: 'var(--sl-t2)', fontSize: 13, fontWeight: 500,
                                    borderBottom: opt.format === 'xlsx' ? '1px solid var(--sl-border-muted)' : 'none',
                                    transition: 'background 120ms',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--sl-bg)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                                {opt.label}
                                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--sl-t4)', fontWeight: 600 }}>{opt.ext}</span>
                            </a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
