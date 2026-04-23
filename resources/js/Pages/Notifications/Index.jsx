import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const BellIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

const TYPE_STYLES = {
    loan_reminder:         { bg: '#FEF3C7', dot: '#F59E0B' },
    subscription_reminder: { bg: '#EFF6FF', dot: '#3B82F6' },
    monthly_summary:       { bg: '#F0FDF4', dot: '#10B981' },
    weekly_digest:         { bg: '#EDE9FE', dot: '#8B5CF6' },
    unusual_expense:       { bg: '#FEE2E2', dot: '#EF4444' },
};

export default function NotificationsIndex({ notifications }) {
    const markRead = (id) => router.post(`/notifications/${id}/read`, {}, { preserveState: true });
    const dismiss = (id) => router.delete(`/notifications/${id}`, { onSuccess: () => toast.success('Dismissed.') });
    const markAllRead = () => router.post('/notifications/read-all', {}, { onSuccess: () => toast.success('All marked as read.') });

    const unreadCount = notifications?.data?.filter(n => !n.is_read).length || 0;

    return (
        <AppLayout>
            <Head title="Notifications" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="btn btn-secondary">
                        <CheckIcon /> Mark all read
                    </button>
                )}
            </div>

            {notifications?.data?.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><BellIcon /></div>
                        <div className="empty-state-title">All caught up</div>
                        <div className="empty-state-desc">No notifications at this time.</div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {notifications?.data?.map((n, i) => {
                        const style = TYPE_STYLES[n.type] || { bg: '#F8FAFC', dot: '#94A3B8' };
                        return (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 14,
                                    background: n.is_read ? '#fff' : style.bg,
                                    border: `1px solid ${n.is_read ? '#E2E8F0' : 'transparent'}`,
                                    borderRadius: 12, padding: '14px 16px',
                                    transition: 'background 200ms',
                                }}
                            >
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: style.dot, flexShrink: 0, marginTop: 5 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: n.is_read ? 500 : 700, color: '#0F172A', lineHeight: 1.4 }}>{n.title}</div>
                                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 3, lineHeight: 1.5 }}>{n.message}</div>
                                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, fontWeight: 500 }}>{n.created_at}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    {!n.is_read && (
                                        <button onClick={() => markRead(n.id)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#D1FAE5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', transition: 'background 150ms' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#A7F3D0'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#D1FAE5'}
                                        >
                                            <CheckIcon />
                                        </button>
                                    )}
                                    <button onClick={() => dismiss(n.id)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', transition: 'background 150ms' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#FEE2E2'}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
