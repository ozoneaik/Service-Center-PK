import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, usePage } from "@inertiajs/react";
import { Container } from "@mui/material";
import ListPage from "./ListPage.jsx";

export default function WithdrawJobsIndex({ list = [], filters = {} }) {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="เบิกอะไหล่สำหรับศูนย์บริการ" />

            <Container
                maxWidth="false"
                sx={{ backgroundColor: "white", p: 3 }}
            >
                <ListPage
                    list={list}
                    filters={filters}
                    auth={auth}
                />
            </Container>
        </AuthenticatedLayout>
    );
}
