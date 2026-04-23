import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

const appName = import.meta.env.VITE_APP_NAME || 'SkillLeo';

createInertiaApp({
    title: (title) => `${title} — ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <App {...props} />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#0F172A',
                            color: '#F8FAFC',
                            borderRadius: '10px',
                            padding: '14px 18px',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                        },
                        success: {
                            iconTheme: { primary: '#10B981', secondary: '#F8FAFC' },
                        },
                        error: {
                            iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' },
                        },
                    }}
                />
            </>,
        );
    },
    progress: {
        color: '#10B981',
    },
});
