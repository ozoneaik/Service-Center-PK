import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router } from "@inertiajs/react";
import {
    Box,
    Button,
    Chip,
    Container,
    Grid2,
    InputAdornment,
    Pagination,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { useState } from "react";

const statusConfig = {
    pending: { label: "รอดำเนินการ", color: "warning" },
    success: { label: "ซ่อมสำเร็จ", color: "success" },
    canceled: { label: "ยกเลิก", color: "error" },
    send: { label: "ส่งไปยัง PK", color: "info" },
};

export default function DealerHistory({ jobs }) {
    const [search, setSearch] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("dealerRepair.history"), { search }, { preserveState: true });
    };

    const handlePageChange = (_, page) => {
        router.get(route("dealerRepair.history"), { search, page }, { preserveState: true });
    };

    const goToRepair = (jobId) => {
        router.get(route("dealerRepair.index", { job_id: jobId }));
    };

    const status = (value) => {
        const cfg = statusConfig[value] || { label: value, color: "default" };
        return <Chip label={cfg.label} color={cfg.color} size="small" />;
    };

    return (
        <AuthenticatedLayout>
            <Head title="ประวัติการแจ้งซ่อม (ร้านค้า)" />
            <Container maxWidth="xl" sx={{ mt: 3 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                         <Typography variant="h6" fontWeight="bold">
                                ประวัติการแจ้งซ่อม (ร้านค้า)
                            </Typography>
                        <Stack direction="row" justifyContent="flex-end" alignItems="right">
                           
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => router.get(route("dealerRepair.index"))}
                            >
                                แจ้งซ่อมใหม่
                            </Button>
                             <Button
                                // size="small"
                                variant="outlined"
                                sx={{ marginLeft: 2 }}
                                onClick={() => router.get(route("dealerRepair.send.list"))}
                            >
                                ส่งซ่อมพัมคิน
                            </Button>
                        </Stack>
                    </Grid2>

                    <Grid2 size={12}>
                        <form onSubmit={handleSearch}>
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    size="small"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ค้นหา Job ID, S/N, ชื่อสินค้า"
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                                <Button type="submit" variant="outlined">ค้นหา</Button>
                            </Stack>
                        </form>
                    </Grid2>

                    <Grid2 size={12}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="medium">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "grey.100" }}>
                                        <TableCell>รหัส Job</TableCell>
                                        <TableCell>S/N</TableCell>
                                        <TableCell>สินค้า</TableCell>
                                        <TableCell>ชื่อร้านค้า</TableCell>
                                        <TableCell>เบอร์ร้านค้า</TableCell>
                                        <TableCell>สถานะ</TableCell>
                                        <TableCell>วันที่แจ้ง</TableCell>
                                        <TableCell align="center">จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobs.data?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Typography color="text.secondary" py={3}>
                                                    ไม่พบข้อมูล
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {jobs.data?.map((job) => (
                                        <TableRow key={job.id} hover>
                                            <TableCell>{job.job_id}</TableCell>
                                            <TableCell>{job.serial_id}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                                                    {job.p_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {job.pid}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{job.dealer_name || "-"}</TableCell>
                                            <TableCell>{job.dealer_phone || "-"}</TableCell>
                                            <TableCell>{status(job.status)}</TableCell>
                                            <TableCell>
                                                {new Date(job.created_at).toLocaleDateString("th-TH")}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => goToRepair(job.job_id)}
                                                >
                                                    ดูรายละเอียด
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>

                    {jobs.last_page > 1 && (
                        <Grid2 size={12}>
                            <Box display="flex" justifyContent="center">
                                <Pagination
                                    count={jobs.last_page}
                                    page={jobs.current_page}
                                    onChange={handlePageChange}
                                    color="primary"
                                />
                            </Box>
                        </Grid2>
                    )}
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}





