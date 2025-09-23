import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ProductTargetProvider } from "./Context/ProductContext.jsx";
import { Backdrop, Box, CircularProgress, ThemeProvider, Typography } from "@mui/material";
import { Theme } from "@/Layouts/themeCustom.jsx";
import '@fortawesome/fontawesome-svg-core/styles.css'
import { useEffect, useState } from 'react';
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function LoadingPage() {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        // ฟังการเริ่มต้น navigation
        const startHandler = () => setLoading(true);
        // ฟังการสิ้นสุด navigation
        const finishHandler = () => setLoading(false);

        const unsubscribeStart = router.on('start', startHandler);
        const unsubscribeFinish = router.on('finish', finishHandler);

        // Cleanup event listeners
        return () => {
            unsubscribeStart();
            unsubscribeFinish();
        };
    }, []);
    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)'
            }}
            open={loading}
        >
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={3}
            >
                <CircularProgress
                    size={60}
                    thickness={4}
                    sx={{
                        color: '#4B5563',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        }
                    }}
                />
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.9)',
                        textAlign: 'center'
                    }}
                >
                    กำลังโหลด...
                </Typography>
            </Box>
        </Backdrop>
    )
}

function AppWrapper({ children }) {
    return (
        <>
            <LoadingPage />
            {children}
        </>
    )
};
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider theme={Theme}>
                <ProductTargetProvider>
                    <AppWrapper>
                        <App {...props} />
                    </AppWrapper>
                </ProductTargetProvider>
            </ThemeProvider>
        );
    },
    // progress: {
    //     color: '#f15922',
    // },
    progress: false
}).then(r => { });
