import{n as e,t}from"./jsx-runtime-C11HiuYV.js";var n=t(),r=`
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
`;function i({label:e,value:t,sub:r,color:i}){return(0,n.jsxs)(`div`,{className:`adm-card${i?` ${i}`:``}`,children:[(0,n.jsx)(`div`,{className:`adm-card-label`,children:e}),(0,n.jsx)(`div`,{className:`adm-card-value`,children:t}),r&&(0,n.jsx)(`div`,{className:`adm-card-sub`,children:r})]})}function a({stats:t,recent_users:a}){return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(e,{title:`Admin Panel — SkillLeo`,children:(0,n.jsx)(`style`,{children:r})}),(0,n.jsxs)(`div`,{className:`adm`,children:[(0,n.jsxs)(`div`,{className:`adm-header`,children:[(0,n.jsx)(`div`,{className:`adm-badge`,children:`⚡ Admin Panel`}),(0,n.jsx)(`h1`,{className:`adm-title`,children:`Platform Overview`}),(0,n.jsx)(`p`,{className:`adm-subtitle`,children:`SkillLeo multi-tenant SaaS metrics`})]}),(0,n.jsxs)(`div`,{className:`adm-grid`,children:[(0,n.jsx)(i,{label:`Total Users`,value:t.total_users,sub:`All registered`}),(0,n.jsx)(i,{label:`New This Week`,value:t.new_this_week,color:`green`,sub:`Registered`}),(0,n.jsx)(i,{label:`New Today`,value:t.new_today,color:`green`}),(0,n.jsx)(i,{label:`Active Accounts`,value:t.active_users,color:`blue`}),(0,n.jsx)(i,{label:`Verified Email`,value:t.verified_users,color:`blue`}),(0,n.jsx)(i,{label:`Google OAuth`,value:t.google_users}),(0,n.jsx)(i,{label:`Pro Users`,value:t.pro_users,color:`purple`,sub:`Paid plan`})]}),(0,n.jsxs)(`div`,{className:`adm-section`,children:[(0,n.jsx)(`div`,{className:`adm-section-title`,children:`Recent Registrations`}),(0,n.jsx)(`div`,{style:{overflowX:`auto`},children:(0,n.jsxs)(`table`,{className:`adm-table`,children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`Name`}),(0,n.jsx)(`th`,{children:`Email`}),(0,n.jsx)(`th`,{children:`Plan`}),(0,n.jsx)(`th`,{children:`Status`}),(0,n.jsx)(`th`,{children:`Email Verified`}),(0,n.jsx)(`th`,{children:`Last Login`}),(0,n.jsx)(`th`,{children:`Joined`})]})}),(0,n.jsx)(`tbody`,{children:a.map(e=>(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{style:{fontWeight:600,color:`#0F172A`},children:e.name}),(0,n.jsx)(`td`,{style:{color:`#64748B`},children:e.email}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`span`,{className:`adm-pill ${e.plan}`,children:e.plan})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`span`,{className:`adm-pill ${e.is_active?`active`:`inactive`}`,children:e.is_active?`Active`:`Inactive`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`span`,{className:`adm-pill ${e.email_verified_at?`verified`:`unverified`}`,children:e.email_verified_at?`Verified`:`Pending`})}),(0,n.jsx)(`td`,{style:{color:`#64748B`,fontSize:13},children:e.last_login_at?new Date(e.last_login_at).toLocaleDateString():`—`}),(0,n.jsx)(`td`,{style:{color:`#64748B`,fontSize:13},children:new Date(e.created_at).toLocaleDateString()})]},e.id))})]})})]})]})]})}export{a as default};