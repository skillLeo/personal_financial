import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevLeft = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const ExpandIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>;

export default function PhotoGalleryModal({ photos, open, onClose }) {
    const [current, setCurrent] = useState(0);
    const [zoomed, setZoomed] = useState(false);

    if (!photos?.length) return null;

    const prev = () => setCurrent(c => (c - 1 + photos.length) % photos.length);
    const next = () => setCurrent(c => (c + 1) % photos.length);

    const btnStyle = { background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: 44, height: 44, backdropFilter: 'blur(4px)', transition: 'background 150ms' };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 50 }}
                        onClick={zoomed ? () => setZoomed(false) : onClose}
                    />
                    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                        <button onClick={onClose} style={{ ...btnStyle, position: 'absolute', top: 16, right: 16 }}><XIcon /></button>
                        <button onClick={() => setZoomed(!zoomed)} style={{ ...btnStyle, position: 'absolute', top: 16, right: 68 }}><ExpandIcon /></button>

                        {photos.length > 1 && (
                            <>
                                <button onClick={prev} style={{ ...btnStyle, position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}><ChevLeft /></button>
                                <button onClick={next} style={{ ...btnStyle, position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}><ChevRight /></button>
                            </>
                        )}

                        <motion.img
                            key={current}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: zoomed ? 1.5 : 1 }}
                            exit={{ opacity: 0 }}
                            src={photos[current].url}
                            alt="Transaction photo"
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' }}
                        />

                        {photos.length > 1 && (
                            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
                                {photos.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrent(i)}
                                        style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', background: i === current ? '#fff' : 'rgba(255,255,255,0.35)', transition: 'background 150ms' }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
