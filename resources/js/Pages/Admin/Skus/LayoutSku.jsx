import {Head} from "@inertiajs/react";
import {Button, Container, Grid2, List, Stack, useMediaQuery} from "@mui/material";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {useState} from "react";
import {ListAlt} from "@mui/icons-material";

export default function LayoutSku({children, title = '🗃️', ...props}) {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [showMenu, setShowMenu] = useState(isMobile);
    return (
        <AuthenticatedLayout>
            <Head title={title}/>
            <Container maxWidth='false' sx={{ backgroundColor: 'white', p: 3 }}>
                <Stack spacing={2}>
                    {children}
                </Stack>
            </Container>
        </AuthenticatedLayout>
    )
}
