import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/* ── Icons ─────────────────────────────────────────────── */
const I = {
    dashboard:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
    transactions:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"/></svg>,
    reports:       <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    accounts:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    people:        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    loans:         <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    subscriptions: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    budgets:       <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
    employees:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    notifications: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    settings:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    search:        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    bell:          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    logout:        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    menu:          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    close:         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    home:          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    grid:          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    trending:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    chevLeft:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
    chevRight:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
};

const NAV_SECTIONS = [
    {
        label: 'Overview',
        items: [
            { name: 'Dashboard',    href: '/',              key: 'dashboard' },
            { name: 'Transactions', href: '/transactions',  key: 'transactions' },
            { name: 'Reports',      href: '/reports',       key: 'reports' },
        ],
    },
    {
        label: 'Finance',
        items: [
            { name: 'Accounts',      href: '/accounts',      key: 'accounts' },
            { name: 'People',        href: '/people',        key: 'people' },
            { name: 'Loans',         href: '/loans',         key: 'loans' },
            { name: 'Subscriptions', href: '/subscriptions', key: 'subscriptions' },
            { name: 'Budgets',       href: '/budgets',       key: 'budgets' },
        ],
    },
    {
        label: 'Business',
        items: [
            { name: 'Employees', href: '/employees', key: 'employees' },
        ],
    },
    {
        label: 'System',
        items: [
            { name: 'Notifications', href: '/notifications', key: 'notifications' },
            { name: 'Settings',      href: '/settings',      key: 'settings' },
        ],
    },
];

const MOBILE_NAV = [
    { key: 'dashboard',    href: '/',                   icon: 'home',         label: 'Home' },
    { key: 'transactions', href: '/transactions',        icon: 'transactions', label: 'Txns' },
    { key: 'add',          href: '/transactions/create', isAdd: true },
    { key: 'accounts',     href: '/accounts',            icon: 'accounts',     label: 'Accounts' },
    { key: 'more',         isMore: true,                 icon: 'grid',         label: 'More' },
];

export default function AppLayout({ children }) {
    const { auth, flash, notifications_count } = usePage().props;

    /* sidebar collapse: false=expanded(228px), true=collapsed(64px) */
    const [collapsed, setCollapsed]       = useState(false);
    /* mobile: slide-over overlay sidebar */
    const [mobileOpen, setMobileOpen]     = useState(false);
    const [moreOpen, setMoreOpen]         = useState(false);
    const [searchOpen, setSearchOpen]     = useState(false);
    const [searchQuery, setSearchQuery]   = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [notifOpen, setNotifOpen]       = useState(false);
    const [notifications, setNotifications] = useState([]);
    /* tooltip for collapsed nav items */
    const [tooltip, setTooltip]           = useState({ show: false, text: '', top: 0 });

    const currentUrl = usePage().url;
    const user       = auth?.user;
    const initials   = user?.name?.[0]?.toUpperCase() || 'U';
    const unread     = notifications_count || 0;

    /* On tablet (768–1024px) default to collapsed */
    useEffect(() => {
        const init = () => {
            if (window.innerWidth < 1024) setCollapsed(true);
        };
        init();
        const onResize = () => {
            if (window.innerWidth < 768) setMobileOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
        if (flash?.info)    toast(flash.info);
    }, [flash]);

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); return; }
        setSearchLoading(true);
        const t = setTimeout(() => {
            fetch(`/search?q=${encodeURIComponent(searchQuery)}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
            })
                .then(r => r.json())
                .then(d => { setSearchResults(d.results || []); setSearchLoading(false); })
                .catch(() => setSearchLoading(false));
        }, 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const loadNotifications = () => {
        fetch('/notifications/recent', { headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' } })
            .then(r => r.json())
            .then(d => setNotifications(Array.isArray(d) ? d : []))
            .catch(() => {});
    };

    const isActive = (key) => {
        if (key === 'dashboard') return currentUrl === '/';
        return currentUrl.startsWith('/' + key);
    };

    /* ─── Sidebar content (used by both desktop sidebar and mobile overlay) ─── */
    const SidebarContent = ({ isExpanded, onNavClick }) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

            {/* Logo + collapse toggle */}
            <div style={{
                height: 52, flexShrink: 0,
                padding: isExpanded ? '0 12px 0 14px' : '0 8px',
                display: 'flex', alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                gap: 9,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div style={{
                    width: 30, height: 30, flexShrink: 0,
                    background: 'linear-gradient(135deg,#0F9B73 0%,#0A7E5E 100%)',
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(10,126,94,0.40)',
                }}>
                    {I.trending}
                </div>
                {isExpanded && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#E8EDF4', fontWeight: 700, fontSize: 14, letterSpacing: '-0.2px' }}>SkillLeo</div>
                        <div style={{ color: '#3A4D65', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.01em' }}>Financial OS</div>
                    </div>
                )}
                {/* Collapse toggle — only on desktop/tablet sidebar, not mobile overlay */}
                {onNavClick === null && (
                    <button
                        onClick={() => setCollapsed(v => !v)}
                        style={{
                            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#3A4D65', transition: 'all 120ms',
                            marginLeft: isExpanded ? 'auto' : 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,155,115,0.15)'; e.currentTarget.style.color = '#0F9B73'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#3A4D65'; }}
                    >
                        {isExpanded ? I.chevLeft : I.chevRight}
                    </button>
                )}
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: isExpanded ? '4px 8px 12px' : '8px 6px 12px' }}>
                {NAV_SECTIONS.map((section, si) => (
                    <div key={section.label}>
                        {isExpanded ? (
                            <div className="sidebar-section-label" style={{ paddingTop: si === 0 ? '10px' : '14px' }}>
                                {section.label}
                            </div>
                        ) : (
                            si > 0 && <div style={{ height: 10, borderTop: '1px solid rgba(255,255,255,0.04)', margin: '8px 4px' }} />
                        )}
                        {section.items.map(item => {
                            const active = isActive(item.key);
                            return (
                                <div
                                    key={item.key}
                                    onMouseEnter={!isExpanded ? (e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setTooltip({ show: true, text: item.name, top: rect.top + rect.height / 2 - 12 });
                                    } : undefined}
                                    onMouseLeave={!isExpanded ? () => setTooltip({ show: false, text: '', top: 0 }) : undefined}
                                >
                                    <Link
                                        href={item.href}
                                        className={`sidebar-link${active ? ' active' : ''}`}
                                        style={{
                                            justifyContent: isExpanded ? 'flex-start' : 'center',
                                            padding: isExpanded ? '0 10px' : '0',
                                            height: 36,
                                            borderRadius: 7,
                                        }}
                                        onClick={() => onNavClick && onNavClick()}
                                    >
                                        <span style={{ color: active ? '#0F9B73' : '#5C6F8A', flexShrink: 0, display: 'flex' }}>
                                            {I[item.key]}
                                        </span>
                                        {isExpanded && (
                                            <>
                                                <span style={{ flex: 1 }}>{item.name}</span>
                                                {item.key === 'notifications' && unread > 0 && (
                                                    <span style={{
                                                        background: 'rgba(239,68,68,0.18)', color: '#EF4444',
                                                        fontSize: 10, fontWeight: 700, padding: '1px 7px',
                                                        borderRadius: 99, flexShrink: 0,
                                                    }}>{unread > 9 ? '9+' : unread}</span>
                                                )}
                                            </>
                                        )}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User footer */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: isExpanded ? '8px' : '6px', flexShrink: 0 }}>
                {isExpanded ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 6px', borderRadius: 8, cursor: 'default' }}>
                        <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#4F60D1,#7C4FC4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                        }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#D0DAE8', fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
                            <div style={{ color: '#3A4D65', fontSize: 10.5, fontWeight: 500 }}>Owner</div>
                        </div>
                        <Link href="/logout" method="post" as="button" style={{
                            width: 26, height: 26, borderRadius: 6, background: 'transparent',
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#3A4D65', flexShrink: 0, transition: 'all 120ms',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#3A4D65'; e.currentTarget.style.background = 'transparent'; }}
                        >{I.logout}</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3px 0' }}>
                        <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#4F60D1,#7C4FC4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 11, fontWeight: 700,
                        }}>{initials}</div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F7F8FA' }}>

            {/* ── Desktop / Tablet Sidebar (≥768px) ──────────── */}
            {/* Uses Tailwind "hidden md:flex" — display:none on mobile, display:flex on md+ */}
            <aside
                className="hidden md:flex"
                style={{
                    flexDirection: 'column',
                    width: collapsed ? 64 : 228,
                    background: '#0C1220',
                    flexShrink: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 10,
                    boxShadow: '1px 0 0 rgba(255,255,255,0.04)',
                    transition: 'width 220ms cubic-bezier(0.4,0,0.2,1)',
                }}
            >
                {/* Pass onNavClick=null to signal this is the desktop sidebar (shows toggle button) */}
                <SidebarContent isExpanded={!collapsed} onNavClick={null} />
            </aside>

            {/* ── Tooltip for collapsed sidebar items ────────── */}
            {tooltip.show && collapsed && (
                <div style={{
                    position: 'fixed', left: 72, top: tooltip.top,
                    background: '#0C1220', color: '#C8D4E0',
                    padding: '5px 10px', borderRadius: 6,
                    fontSize: 12, fontWeight: 600, zIndex: 200,
                    pointerEvents: 'none', whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.30)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    {tooltip.text}
                </div>
            )}

            {/* ── Mobile overlay sidebar (<768px) ─────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40 }}
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -270 }} animate={{ x: 0 }} exit={{ x: -270 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            style={{
                                position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
                                background: '#0C1220', zIndex: 50,
                                flexDirection: 'column', display: 'flex',
                                boxShadow: '4px 0 20px rgba(0,0,0,0.22)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Pass onNavClick fn to signal this is mobile (no toggle button, closes on nav) */}
                            <SidebarContent isExpanded={true} onNavClick={() => setMobileOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Main area ────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

                {/* Header */}
                <header style={{
                    background: '#FFFFFF', borderBottom: '1px solid #E4E8EF',
                    height: 52, padding: '0 16px',
                    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
                    position: 'relative', zIndex: 30,
                }}>
                    {/* Hamburger — ONLY on mobile (<768px). Tailwind md:hidden handles this. */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4, borderRadius: 7, flexShrink: 0 }}
                    >
                        {I.menu}
                    </button>

                    {/* Search bar */}
                    <button
                        onClick={() => { setSearchOpen(true); setTimeout(() => document.getElementById('global-search')?.focus(), 50); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            height: 34, minWidth: 40,
                            background: '#F7F8FA', border: '1px solid #E4E8EF',
                            borderRadius: 9999, padding: '0 12px', cursor: 'pointer',
                            color: '#9AAAB8', fontSize: 13, transition: 'all 150ms', flexShrink: 1,
                        }}
                    >
                        <span style={{ flexShrink: 0 }}>{I.search}</span>
                        <span className="hidden sm:inline" style={{ flex: 1, whiteSpace: 'nowrap' }}>Search transactions, people…</span>
                        <span className="hidden sm:inline" style={{ fontSize: 10, color: '#CBD5E1', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>⌘K</span>
                    </button>

                    <div style={{ flex: 1 }} />

                    {/* Add Transaction — ONLY on tablet/desktop (≥768px). Tailwind hidden md:inline-flex */}
                    <Link
                        href="/transactions/create"
                        className="hidden md:inline-flex btn-primary"
                        style={{ gap: 7, alignItems: 'center', fontSize: 13, padding: '8px 14px', whiteSpace: 'nowrap' }}
                    >
                        {I.plus} Add Transaction
                    </Link>

                    {/* Bell */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => { setNotifOpen(v => !v); if (!notifOpen) loadNotifications(); }}
                            style={{
                                width: 34, height: 34, borderRadius: 7, border: '1px solid #E4E8EF',
                                background: notifOpen ? '#F7F8FA' : 'transparent',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#7A8899', position: 'relative', transition: 'all 120ms',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F7F8FA'}
                            onMouseLeave={e => e.currentTarget.style.background = notifOpen ? '#F7F8FA' : 'transparent'}
                        >
                            {I.bell}
                            {unread > 0 && (
                                <span style={{
                                    position: 'absolute', top: -3, right: -3,
                                    minWidth: 16, height: 16, background: '#EF4444',
                                    color: '#fff', fontSize: 9, fontWeight: 700,
                                    borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '0 4px', border: '2px solid #fff',
                                }}>{unread > 9 ? '9+' : unread}</span>
                            )}
                        </button>
                        <AnimatePresence>
                            {notifOpen && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setNotifOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                        transition={{ duration: 0.13 }}
                                        style={{
                                            position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                                            width: 320, background: '#fff', borderRadius: 14,
                                            boxShadow: '0 8px 24px rgba(15,23,42,0.12)', border: '1px solid #E2E8F0',
                                            zIndex: 50, overflow: 'hidden',
                                        }}
                                    >
                                        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>Notifications</span>
                                            <Link href="/notifications/read-all" method="post" as="button"
                                                style={{ fontSize: 12, color: '#10B981', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                                                Mark all read
                                            </Link>
                                        </div>
                                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No notifications</div>
                                            ) : notifications.map(n => (
                                                <div key={n.id} style={{
                                                    padding: '12px 16px', borderBottom: '1px solid #F8FAFC',
                                                    background: !n.is_read ? '#F0FDF4' : '#fff',
                                                    borderLeft: !n.is_read ? '3px solid #10B981' : '3px solid transparent',
                                                }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{n.title}</div>
                                                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.message}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ padding: '10px 16px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                                            <Link href="/notifications" onClick={() => setNotifOpen(false)} style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>View all</Link>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Avatar */}
                    <Link href="/settings">
                        {user?.profile_photo ? (
                            <img src={user.profile_photo} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', display: 'block' }} alt="" />
                        ) : (
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: 13, fontWeight: 700,
                                border: '2px solid #E2E8F0', cursor: 'pointer',
                            }}>{initials}</div>
                        )}
                    </Link>
                </header>

                {/* Page content */}
                <main className="app-main">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="app-content"
                    >
                        {children}
                    </motion.div>
                </main>

                {/* ── Mobile bottom nav — ONLY on mobile (<768px) ── */}
                {/* Uses Tailwind "flex md:hidden" — flex on mobile, none on md+ */}
                <nav
                    className="flex md:hidden"
                    style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0,
                        background: '#FFFFFF', borderTop: '1px solid #E4E8EF',
                        zIndex: 30, boxShadow: '0 -1px 0 #E4E8EF, 0 -4px 12px rgba(13,17,23,0.04)',
                        paddingBottom: 'env(safe-area-inset-bottom)',
                    }}
                >
                    {MOBILE_NAV.map(item => (
                        item.isMore ? (
                            <button key="more" onClick={() => setMoreOpen(true)}
                                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '10px 0', minHeight: 54, background: 'none', border: 'none', cursor: 'pointer', color: '#9AAAB8', fontFamily: 'inherit' }}>
                                {I.grid}
                                <span style={{ fontSize: 10, fontWeight: 500 }}>More</span>
                            </button>
                        ) : item.isAdd ? (
                            <Link key="add" href="/transactions/create"
                                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '8px 0' }}>
                                <div style={{
                                    width: 44, height: 44, background: '#0A7E5E', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginTop: -16, boxShadow: '0 4px 14px rgba(10,126,94,0.40)', color: '#fff',
                                }}>{I.plus}</div>
                                <span style={{ fontSize: 10, color: '#9AAAB8', fontWeight: 500, marginTop: 3 }}>Add</span>
                            </Link>
                        ) : (
                            <Link key={item.key} href={item.href}
                                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '10px 0', minHeight: 54, color: isActive(item.key) ? '#0A7E5E' : '#9AAAB8' }}>
                                {I[item.icon]}
                                <span style={{ fontSize: 10, fontWeight: isActive(item.key) ? 600 : 500 }}>{item.label}</span>
                            </Link>
                        )
                    ))}
                </nav>

                {/* More drawer */}
                <AnimatePresence>
                    {moreOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }}
                                onClick={() => setMoreOpen(false)}
                            />
                            <motion.div
                                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                                style={{
                                    position: 'fixed', bottom: 0, left: 0, right: 0,
                                    background: '#fff', borderRadius: '20px 20px 0 0',
                                    zIndex: 50, padding: '20px 16px 40px',
                                }}
                            >
                                <div style={{ width: 36, height: 4, background: '#E2E8F0', borderRadius: 99, margin: '0 auto 24px' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                                    {[
                                        { name: 'People',        href: '/people',        key: 'people' },
                                        { name: 'Loans',         href: '/loans',         key: 'loans' },
                                        { name: 'Employees',     href: '/employees',     key: 'employees' },
                                        { name: 'Subscriptions', href: '/subscriptions', key: 'subscriptions' },
                                        { name: 'Reports',       href: '/reports',       key: 'reports' },
                                        { name: 'Budgets',       href: '/budgets',       key: 'budgets' },
                                        { name: 'Settings',      href: '/settings',      key: 'settings' },
                                        { name: 'Notifications', href: '/notifications', key: 'notifications' },
                                    ].map(item => (
                                        <Link key={item.key} href={item.href} onClick={() => setMoreOpen(false)}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                                            <div style={{
                                                width: 52, height: 52, borderRadius: 14, minHeight: 44,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: isActive(item.key) ? '#ECFDF5' : '#F8FAFC',
                                                color: isActive(item.key) ? '#10B981' : '#475569',
                                                border: `1.5px solid ${isActive(item.key) ? '#A7F3D0' : '#E2E8F0'}`,
                                            }}>{I[item.key]}</div>
                                            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Search Modal */}
            <AnimatePresence>
                {searchOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 60 }}
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: -12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -12 }}
                            transition={{ duration: 0.14 }}
                            style={{
                                position: 'fixed',
                                top: '15vh',
                                /* left: 50% + translateX(-50%) + width calc = correct centering on all sizes,
                                   and on narrow phones the 16px gap from each edge is guaranteed */
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 'calc(100% - 32px)',
                                maxWidth: 560,
                                zIndex: 70,
                                boxSizing: 'border-box',
                            }}
                        >
                            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(15,23,42,0.20)', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
                                    <span style={{ color: '#94A3B8', flexShrink: 0 }}>{I.search}</span>
                                    <input id="global-search" type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search transactions, people, loans…"
                                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#0F172A', fontFamily: 'inherit', background: 'transparent' }}
                                        autoFocus
                                    />
                                    <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2 }}>
                                        {I.close}
                                    </button>
                                </div>
                                {searchLoading ? (
                                    <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>Searching…</div>
                                ) : searchResults.length > 0 ? (
                                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                                        {searchResults.map((r, i) => (
                                            <a key={i} href={r.url}
                                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #F8FAFC', textDecoration: 'none', transition: 'background 150ms' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                onClick={() => setSearchOpen(false)}
                                            >
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                                                    background: r.type === 'transaction' ? (r.transaction_type === 'income' ? '#ECFDF5' : '#FEF2F2') : '#EDE9FE',
                                                    color: r.type === 'transaction' ? (r.transaction_type === 'income' ? '#065F46' : '#991B1B') : '#5B21B6',
                                                }}>{r.type[0].toUpperCase()}</div>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{r.title}</div>
                                                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{r.subtitle}</div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : searchQuery.length >= 2 ? (
                                    <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No results for "{searchQuery}"</div>
                                ) : (
                                    <div style={{ padding: '20px 16px' }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Quick nav</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {[
                                                { label: 'Dashboard', href: '/' },
                                                { label: 'Transactions', href: '/transactions' },
                                                { label: 'Add Transaction', href: '/transactions/create' },
                                                { label: 'Accounts', href: '/accounts' },
                                                { label: 'People', href: '/people' },
                                                { label: 'Reports', href: '/reports' },
                                            ].map(item => (
                                                <a key={item.label} href={item.href} onClick={() => setSearchOpen(false)}
                                                    style={{ padding: '6px 12px', background: '#F1F5F9', borderRadius: 8, fontSize: 13, color: '#475569', fontWeight: 500, textDecoration: 'none', transition: 'all 150ms' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}
                                                >{item.label}</a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
