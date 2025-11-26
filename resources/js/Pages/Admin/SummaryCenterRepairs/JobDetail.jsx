import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage, router, Head } from "@inertiajs/react";
import {
    Box, Typography, Paper, Table, TableRow,
    TableCell, TableHead, TableBody, Button, Pagination, Stack
} from "@mui/material";
import dayjs from "dayjs";

export default function JobDetail() {
    const { jobs, status, currentShopName, shop, month, showAll, isAdmin } = usePage().props;
    const formatDate = (d) => dayjs(d).format("DD/MM/YYYY HH:mm:ss");

    const handlePageChange = (event, page) => {
        router.get(
            // route("report.summary-center-repairs.detail"), 
            route(
                isAdmin
                    ? "admin.summary-center-repairs.detail"
                    : "report.summary-center-repairs.detail"
            ),
            {
                shop,
                status,
                month,
                all: showAll ? 1 : 0,
                page: page
            }, {
            preserveScroll: true,
            preserveState: true
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="รายละเอียดงาน" />
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    รายละเอียดงานสถานะ "{"" + status}" — ร้าน <span style={{ fontWeight: "bold" }}>{currentShopName}</span>
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => router.get(
                        // route("report.summary-center-repairs.index"),
                        route(
                            isAdmin
                                ? "admin.summary-center-repairs.index"
                                : "report.summary-center-repairs.index"
                        ),
                        { shop })}
                    sx={{ mb: 2 }}
                >
                    ← กลับสรุปงาน
                </Button>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Job ID</TableCell>
                            <TableCell>สินค้า</TableCell>
                            <TableCell>สถานะ</TableCell>
                            <TableCell>วันที่สร้าง</TableCell>
                            <TableCell>วันที่ปิดงาน</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobs.data.map((item, index) => (
                            <TableRow key={item.job_id}>
                                <TableCell>
                                    {(jobs.current_page - 1) * jobs.per_page + (index + 1)}
                                </TableCell>
                                <TableCell>{item.job_id}</TableCell>
                                <TableCell>{item.p_name}</TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell>{formatDate(item.created_at)}</TableCell>
                                <TableCell>{item.close_job_at ?? "-"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <Stack spacing={2} sx={{ mt: 3 }} alignItems="center">
                    <Pagination
                        count={jobs.last_page}
                        page={jobs.current_page}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                    />
                </Stack>
            </Paper>
        </AuthenticatedLayout>
    );
}