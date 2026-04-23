import { Link } from '@inertiajs/react';

const PlusIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

export default function EmptyState({ title, description, actionLabel, actionHref, icon: Icon }) {
    return (
        <div className="empty-state">
            {Icon && (
                <div className="empty-state-icon">
                    <Icon />
                </div>
            )}
            <div className="empty-state-title">{title}</div>
            <div className="empty-state-desc">{description}</div>
            {actionHref && (
                <Link href={actionHref} className="btn btn-primary">
                    <PlusIcon />
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
