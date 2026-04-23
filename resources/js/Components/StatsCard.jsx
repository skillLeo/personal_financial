import { motion } from 'framer-motion';

const TrendUp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const TrendDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;

const COLOR_MAP = {
    emerald: { bg: '#D1FAE5', icon: '#10B981', value: '#10B981' },
    red:     { bg: '#FEE2E2', icon: '#EF4444', value: '#EF4444' },
    blue:    { bg: '#DBEAFE', icon: '#3B82F6', value: '#3B82F6' },
    purple:  { bg: '#EDE9FE', icon: '#8B5CF6', value: '#8B5CF6' },
    amber:   { bg: '#FEF3C7', icon: '#F59E0B', value: '#F59E0B' },
};

export default function StatsCard({ title, value, icon: Icon, color = 'emerald', subtitle, trend }) {
    const c = COLOR_MAP[color] || COLOR_MAP.emerald;
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>{title}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: c.value }}>{value}</p>
                    {subtitle && <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{subtitle}</p>}
                    {trend !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 12, fontWeight: 600, color: trend >= 0 ? '#10B981' : '#EF4444' }}>
                            {trend >= 0 ? <TrendUp /> : <TrendDown />}
                            {Math.abs(trend)}% vs last month
                        </div>
                    )}
                </div>
                {Icon && (
                    <div style={{ width: 44, height: 44, background: c.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.icon }}>
                        <Icon />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
