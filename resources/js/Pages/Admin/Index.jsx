import { Head } from '@inertiajs/react';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #F1F5F9; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
.adm { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }
.adm-header { margin-bottom: 32px; }
.adm-title { font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
.adm-subtitle { font-size: 15px; color: #64748B; margin-top: 4px; }
.adm-badge { display: inline-flex; align-items: center; gap: 6px; background: #FEF3C7; border: 1px solid #FDE68A; color: #92400E; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
.adm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
.adm-card { background: #fff; border-radius: 14px; padding: 24px 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
.adm-card-label { font-size: 11px; font-weight: 700; color: #94A3B8; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px; }
.adm-card-value { font-size: 36px; font-weight: 800; color: #0F172A; letter-spacing: -1px; }
.adm-card-sub { font-size: 13px; color: #64748B; margin-top: 4px; font-weight: 500; }
.adm-card.green .adm-card-value { color: #059669; }
.adm-card.blue .adm-card-value { color: #3B82F6; }
.adm-card.purple .adm-card-value { color: #8B5CF6; }
.adm-section { background: #fff; border-radius: 14px; padding: 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
.adm-section-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 20px; }
.adm-table { width: 100%; border-collapse: collapse; }
.adm-table th { font-size: 11px; font-weight: 700; color: #94A3B8; letter-spacing: 0.8px; text-transform: uppercase; padding: 0 12px 12px; text-align: left; border-bottom: 1px solid #F1F5F9; }
.adm-table td { padding: 14px 12px; font-size: 14px; color: #374151; border-bottom: 1px solid #F8FAFC; }
.adm-table tr:last-child td { border-bottom: none; }
.adm-pill { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
.adm-pill.active { background: #F0FDF4; color: #059669; }
.adm-pill.inactive { background: #FEF2F2; color: #DC2626; }
.adm-pill.pro { background: #EDE9FE; color: #7C3AED; }
.adm-pill.free { background: #F1F5F9; color: #475569; }
.adm-pill.verified { background: #EFF6FF; color: #2563EB; }
.adm-pill.unverified { background: #FEF9C3; color: #92400E; }
`;

function StatCard({ label, value, sub, color }) {
    return (
        <div className={`adm-card${color ? ` ${color}` : ''}`}>
            <div className="adm-card-label">{label}</div>
            <div className="adm-card-value">{value}</div>
            {sub && <div className="adm-card-sub">{sub}</div>}
        </div>
    );
}

export default function AdminIndex({ stats, recent_users }) {
    return (
        <>
            <Head title="Admin Panel — SkillLeo">
                <style>{CSS}</style>
            </Head>
            <div className="adm">
                <div className="adm-header">
                    <div className="adm-badge">⚡ Admin Panel</div>
                    <h1 className="adm-title">Platform Overview</h1>
                    <p className="adm-subtitle">SkillLeo multi-tenant SaaS metrics</p>
                </div>

                <div className="adm-grid">
                    <StatCard label="Total Users" value={stats.total_users} sub="All registered" />
                    <StatCard label="New This Week" value={stats.new_this_week} color="green" sub="Registered" />
                    <StatCard label="New Today" value={stats.new_today} color="green" />
                    <StatCard label="Active Accounts" value={stats.active_users} color="blue" />
                    <StatCard label="Verified Email" value={stats.verified_users} color="blue" />
                    <StatCard label="Google OAuth" value={stats.google_users} />
                    <StatCard label="Pro Users" value={stats.pro_users} color="purple" sub="Paid plan" />
                </div>

                <div className="adm-section">
                    <div className="adm-section-title">Recent Registrations</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="adm-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Plan</th>
                                    <th>Status</th>
                                    <th>Email Verified</th>
                                    <th>Last Login</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 600, color: '#0F172A' }}>{u.name}</td>
                                        <td style={{ color: '#64748B' }}>{u.email}</td>
                                        <td>
                                            <span className={`adm-pill ${u.plan}`}>{u.plan}</span>
                                        </td>
                                        <td>
                                            <span className={`adm-pill ${u.is_active ? 'active' : 'inactive'}`}>
                                                {u.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`adm-pill ${u.email_verified_at ? 'verified' : 'unverified'}`}>
                                                {u.email_verified_at ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748B', fontSize: 13 }}>
                                            {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={{ color: '#64748B', fontSize: 13 }}>
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
