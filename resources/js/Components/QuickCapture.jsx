import { useState, useRef, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content;

const MicIco  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const CloseIco = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SaveIco  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const PlayIco  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const StopIco  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>;

const TYPE_OPTS = [
    { key: 'expense', label: 'Expense', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
    { key: 'income',  label: 'Income',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { key: 'unknown', label: 'Not Sure', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
];

/* ── Recording timer display ── */
function RecordTimer({ seconds }) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, color: '#EF4444', fontWeight: 700 }}>{m}:{s}</span>;
}

export default function QuickCapture({ open, onClose, onSaved }) {
    const [amount, setAmount]       = useState('');
    const [label, setLabel]         = useState('');
    const [type, setType]           = useState('expense');
    const [saving, setSaving]       = useState(false);
    const [recording, setRecording] = useState(false);
    const [recSeconds, setRecSeconds] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [micDenied, setMicDenied] = useState(false);

    const amountRef    = useRef(null);
    const mediaRef     = useRef(null);
    const chunksRef    = useRef([]);
    const timerRef     = useRef(null);
    const audioRef     = useRef(null);

    useEffect(() => {
        if (open) {
            setAmount('');
            setLabel('');
            setType('expense');
            setAudioBlob(null);
            setRecording(false);
            setRecSeconds(0);
            setMicDenied(false);
            setTimeout(() => amountRef.current?.focus(), 80);
        }
    }, [open]);

    // Auto-stop at 2 minutes
    useEffect(() => {
        if (recording && recSeconds >= 120) stopRecording();
    }, [recording, recSeconds]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            chunksRef.current = [];
            const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg' });
            mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mr.mimeType });
                setAudioBlob(blob);
                stream.getTracks().forEach(t => t.stop());
            };
            mr.start(250);
            mediaRef.current = mr;
            setRecording(true);
            setRecSeconds(0);
            timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
        } catch (err) {
            if (err.name === 'NotAllowedError') setMicDenied(true);
            else toast.error('Microphone not available.');
        }
    };

    const stopRecording = useCallback(() => {
        if (mediaRef.current?.state === 'recording') mediaRef.current.stop();
        clearInterval(timerRef.current);
        setRecording(false);
    }, []);

    const playAudio = () => {
        if (!audioBlob) return;
        const url = URL.createObjectURL(audioBlob);
        if (audioRef.current) { audioRef.current.src = url; audioRef.current.play(); }
    };

    const saveDraft = async () => {
        if (!amount && !label && !audioBlob) {
            toast.error('Enter at least an amount or note.');
            return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            if (amount)    fd.append('amount', amount);
            if (label)     fd.append('label', label);
            fd.append('type', type);
            if (audioBlob) fd.append('voice_note', audioBlob, 'voice.webm');
            fd.append('_token', csrf());

            const r = await fetch('/drafts', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            toast.success('Draft saved!');
            onSaved?.();
            onClose();
        } catch (e) {
            toast.error(e.message || 'Failed to save draft.');
        }
        setSaving(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter' && !saving) saveDraft();
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', zIndex: 900 }}
                    />

                    {/* Modal — bottom sheet on mobile, centered on desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                        onKeyDown={handleKeyDown}
                        style={{
                            position: 'fixed', zIndex: 910,
                            bottom: 0, left: 0, right: 0,
                            margin: '0 auto',
                            maxWidth: 420,
                            background: 'var(--sl-surface)',
                            borderRadius: '20px 20px 0 0',
                            boxShadow: '0 -8px 40px rgba(0,0,0,0.22)',
                            border: '1px solid var(--sl-border)',
                            padding: '0 20px 24px',
                            boxSizing: 'border-box',
                        }}
                        className="quick-capture-modal"
                    >
                        {/* Drag handle */}
                        <div style={{ width: 36, height: 4, background: 'var(--sl-border)', borderRadius: 99, margin: '12px auto 20px' }} />

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sl-t1)' }}>Quick Capture</div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sl-t3)', display: 'flex', padding: 4 }}><CloseIco /></button>
                        </div>

                        {/* Amount — big number input */}
                        <div style={{ marginBottom: 16 }}>
                            <input
                                ref={amountRef}
                                type="number"
                                inputMode="decimal"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0"
                                style={{
                                    width: '100%', border: 'none', outline: 'none',
                                    fontSize: 40, fontWeight: 800, color: 'var(--sl-t1)',
                                    background: 'transparent', fontFamily: 'inherit',
                                    textAlign: 'center', padding: '8px 0',
                                    boxSizing: 'border-box',
                                }}
                            />
                            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--sl-t3)', marginTop: -4 }}>PKR amount</div>
                        </div>

                        {/* Label */}
                        <input
                            type="text"
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            placeholder="What was this? (e.g. lunch, fuel, client payment)"
                            style={{
                                width: '100%', padding: '11px 14px', borderRadius: 10,
                                border: '1px solid var(--sl-border)', background: 'var(--sl-surface-2)',
                                color: 'var(--sl-t1)', fontSize: 14, fontFamily: 'inherit',
                                outline: 'none', marginBottom: 16, boxSizing: 'border-box',
                            }}
                        />

                        {/* Type pills */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            {TYPE_OPTS.map(opt => (
                                <button key={opt.key} onClick={() => setType(opt.key)}
                                    style={{
                                        flex: 1, padding: '8px 4px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                        border: `1.5px solid ${type === opt.key ? opt.color : 'var(--sl-border)'}`,
                                        background: type === opt.key ? opt.bg : 'transparent',
                                        color: type === opt.key ? opt.color : 'var(--sl-t3)',
                                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
                                    }}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Voice note area */}
                        {micDenied ? (
                            <div style={{ fontSize: 12, color: '#F59E0B', background: 'rgba(245,158,11,0.08)', padding: '10px 12px', borderRadius: 8, marginBottom: 16, lineHeight: 1.5 }}>
                                Microphone access denied. Enable it in browser settings to use voice notes.
                            </div>
                        ) : (
                            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                                {!audioBlob ? (
                                    <button
                                        onPointerDown={startRecording}
                                        onPointerUp={stopRecording}
                                        onPointerLeave={stopRecording}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '9px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                            border: `1.5px solid ${recording ? '#EF4444' : 'var(--sl-border)'}`,
                                            background: recording ? 'rgba(239,68,68,0.1)' : 'transparent',
                                            color: recording ? '#EF4444' : 'var(--sl-t2)',
                                            cursor: 'pointer', fontFamily: 'inherit',
                                            animation: recording ? 'pulse-dot 1s ease infinite' : 'none',
                                        }}>
                                        {recording ? <StopIco /> : <MicIco />}
                                        {recording ? <><RecordTimer seconds={recSeconds} /> — release to stop</> : 'Hold for voice note'}
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <button onClick={playAudio} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer', fontFamily: 'inherit' }}>
                                            <PlayIco /> Play
                                        </button>
                                        <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>Voice note recorded</span>
                                        <button onClick={() => setAudioBlob(null)} style={{ fontSize: 11, color: 'var(--sl-t3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Save button */}
                        <button onClick={saveDraft} disabled={saving}
                            style={{ width: '100%', padding: '13px', borderRadius: 12, background: '#0A7E5E', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                            {saving ? 'Saving…' : <><SaveIco /> Save Draft</>}
                        </button>

                        <audio ref={audioRef} style={{ display: 'none' }} />
                    </motion.div>

                    {/* Desktop style override — centered modal above mobile breakpoint */}
                    <style>{`
                        @media (min-width: 640px) {
                            .quick-capture-modal {
                                top: 50% !important;
                                bottom: auto !important;
                                transform: translateY(-50%) !important;
                                border-radius: 16px !important;
                                left: 50% !important;
                                right: auto !important;
                                margin-left: -210px !important;
                            }
                        }
                        @keyframes pulse-dot { 0%,100%{opacity:0.7} 50%{opacity:1} }
                    `}</style>
                </>
            )}
        </AnimatePresence>
    );
}
