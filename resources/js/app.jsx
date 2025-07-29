import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import {ProductTargetProvider} from "./Context/ProductContext.jsx";
import {ThemeProvider} from "@mui/material";
import {Theme} from "@/Layouts/themeCustom.jsx";
import '@fortawesome/fontawesome-svg-core/styles.css'
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({el, App, props}) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider theme={Theme}>
                <ProductTargetProvider>
                    <App {...props} />
                </ProductTargetProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#f15922',
    },
}).then(r =>{});
