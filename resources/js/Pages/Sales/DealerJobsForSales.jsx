import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, usePage } from "@inertiajs/react";
import {
    Alert, Box, Button, Card, Chip, CircularProgress,
    FormControl, Grid2, InputLabel, MenuItem, Paper,
    Select, Stack, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { OpenInNew, Refresh, Search } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";

const getStatusLabel = (status, groupJob, formComplete) => {
    if (status === "pending" && !groupJob) {
        return formComplete ? "รอออกเอกสาร" : "รอบันทึกข้อมูลซ่อม";
    }
    const map = {
        pending:  "รอออกเอกสาร",
        send:     "ส่งซ่อมไปยัง PK",
        success:  "ปิดงานแล้ว",
        canceled: "ยกเลิก",
    };
    return map[status] ?? status;
};
const getStatusColor = (status, groupJob, formComplete) => {
    if (status === "pending" && !groupJob) {
        return formComplete ? "info" : "default";
    }
    const map = {
        pending:  "info",
        send:     "warning",
        success:  "success",
        canceled: "error",
    };
    return map[status] ?? "default";
};

const EMPTY_FILTERS = {
    dealer_code: "", status: "", job_id: "",
    serial_id: "", group_job: "", start_date: "", end_date: "",
};

export default function DealerJobsForSales() {
    const { sale_code } = usePage().props;
    const [jobs, setJobs]         = useState([]);
    const [dealers, setDealers]   = useState([]);
    const [loading, setLoading]   = useState(false);
    const [apiError, setApiError] = useState(null);
    const [filters, setFilters]   = useState(EMPTY_FILTERS);

    useEffect(() => {
        fetchDealers();
        fetchJobs();
    }, []);

    const fetchDealers = async () => {
        try {
            const { data } = await axios.get(route("sale.dealer.jobs.dealers"));
            setDealers(data.dealers || []);
        } catch (e) {
            // non-critical — dropdown just stays empty
        }
    };

    const fetchJobs = async (f = filters) => {
        setLoading(true);
        setApiError(null);
        try {
            const { data } = await axios.post(route("sale.dealer.jobs.list"), f);
            setJobs(data.jobs || []);
            if (!data.jobs?.length && data.message !== "success") {
                setApiError({ type: "info", text: data.message });
            }
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            setApiError({ type: "error", text: msg });
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => { e.preventDefault(); fetchJobs(); };

    const handleReset = () => {
        setFilters(EMPTY_FILTERS);
        fetchJobs(EMPTY_FILTERS);
    };

    const set = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

    return (
        <AuthenticatedLayout>
            <Head title="รายการงานส่งซ่อม (ร้านค้า)" />
            <Paper sx={{ bgcolor: "white", p: 3 }}>
                <Grid2 container spacing={2}>

                    {/* Header */}
                    <Grid2 size={12}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="h6" fontWeight="bold">
                                   รายการงานส่งซ่อม (ร้านค้า)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Sale Code (PK): <strong>{sale_code}</strong>
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
                                onClick={() => fetchJobs()}
                                disabled={loading}
                            >
                                รีเฟรช
                            </Button>
                        </Stack>
                    </Grid2>

                    {/* Filter */}
                    <Grid2 size={12}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            <form onSubmit={handleSubmit}>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <FormControl size="small" fullWidth>
                                            <InputLabel>ร้านค้า (Dealer)</InputLabel>
                                            <Select
                                                value={filters.dealer_code}
                                                label="ร้านค้า (Dealer)"
                                                onChange={set("dealer_code")}
                                            >
                                                <MenuItem value="">ทั้งหมด</MenuItem>
                                                {dealers.map((d) => (
                                                    <MenuItem key={d.is_code_cust_id} value={d.is_code_cust_id}>
                                                        {d.shop_name} ({d.is_code_cust_id})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                        <FormControl size="small" fullWidth>
                                            <InputLabel>สถานะ</InputLabel>
                                            <Select
                                                value={filters.status}
                                                label="สถานะ"
                                                onChange={set("status")}
                                            >
                                                <MenuItem value="">ทั้งหมด</MenuItem>
                                                {[
                                                    ["pending", "รอส่งซ่อม / PK รับงานแล้ว"],
                                                    ["send",    "ส่งซ่อมไปยัง PK"],
                                                    ["success", "ปิดงานแล้ว"],
                                                    ["canceled","ยกเลิก"],
                                                ].map(([k, v]) => (
                                                    <MenuItem key={k} value={k}>{v}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                        <TextField size="small" fullWidth label="Group Job"
                                            value={filters.group_job} onChange={set("group_job")} />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                        <TextField size="small" fullWidth label="Job ID"
                                            value={filters.job_id} onChange={set("job_id")} />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                        <TextField size="small" fullWidth label="Serial ID"
                                            value={filters.serial_id} onChange={set("serial_id")} />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                        <TextField size="small" fullWidth type="date" label="วันที่เริ่ม"
                                            value={filters.start_date} onChange={set("start_date")}
                                            slotProps={{ inputLabel: { shrink: true } }} />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                        <TextField size="small" fullWidth type="date" label="วันที่สิ้นสุด"
                                            value={filters.end_date} onChange={set("end_date")}
                                            slotProps={{ inputLabel: { shrink: true } }} />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: "auto" }}>
                                        <Stack direction="row" spacing={1}>
                                            <Button type="submit" variant="contained" startIcon={<Search />} disabled={loading}>
                                                ค้นหา
                                            </Button>
                                            <Button variant="outlined" onClick={handleReset} disabled={loading}>
                                                ล้างค่า
                                            </Button>
                                        </Stack>
                                    </Grid2>
                                </Grid2>
                            </form>
                        </Card>
                    </Grid2>

                    {/* Alert */}
                    {apiError && (
                        <Grid2 size={12}>
                            <Alert severity={apiError.type} onClose={() => setApiError(null)}>
                                {apiError.text}
                            </Alert>
                        </Grid2>
                    )}

                    {/* Summary */}
                    {!loading && jobs.length > 0 && (
                        <Grid2 size={12}>
                            <Typography variant="body2" color="text.secondary">
                                พบ {jobs.length} รายการ
                            </Typography>
                        </Grid2>
                    )}

                    {/* Table */}
                    <Grid2 size={12}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={6}>
                                <Stack alignItems="center" spacing={2}>
                                    <CircularProgress />
                                    <Typography color="text.secondary">กำลังดึงข้อมูลจาก PK API...</Typography>
                                </Stack>
                            </Box>
                        ) : (
                            <Card variant="outlined" sx={{ overflowX: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={HEADER_STYLE}>
                                            <TableCell>#</TableCell>
                                            <TableCell>ร้านค้า</TableCell>
                                            <TableCell>Group Job</TableCell>
                                            <TableCell>Job ID</TableCell>
                                            <TableCell>Serial ID</TableCell>
                                            <TableCell>รหัสสินค้า</TableCell>
                                            <TableCell>ชื่อสินค้า</TableCell>
                                            <TableCell>Ticket / ASS No.</TableCell>
                                            <TableCell>สถานะ</TableCell>
                                            <TableCell>ASS Status</TableCell>
                                            <TableCell>ใบเสนอราคา / QU</TableCell>
                                            <TableCell>วันที่ส่ง</TableCell>
                                            <TableCell>อัปเดทล่าสุด</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {jobs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={13} align="center" sx={{ py: 5, color: "text.secondary" }}>
                                                    ไม่พบรายการ
                                                </TableCell>
                                            </TableRow>
                                        ) : jobs.map((job, i) => (
                                            <TableRow key={i} hover>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {job.dealer_shop_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {job.dealer_code}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{job.group_job}</Typography>
                                                </TableCell>
                                                <TableCell>{job.job_id}</TableCell>
                                                <TableCell>{job.serial_id}</TableCell>
                                                <TableCell>{job.pid}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                                                        {job.p_name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {job.ticket_code
                                                        ? <Chip label={job.ticket_code} size="small" color="primary" variant="outlined" />
                                                        : <Typography variant="caption" color="text.disabled">-</Typography>}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={getStatusLabel(job.status, job.group_job, job.before_form_complete)}
                                                        color={getStatusColor(job.status, job.group_job, job.before_form_complete)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {job.ass_status
                                                        ? <Chip label={job.ass_status} size="small" />
                                                        : <Typography variant="caption" color="text.disabled">-</Typography>}
                                                </TableCell>
                                                <TableCell>
                                                    {job.ass_qu
                                                        ? <Button size="small" variant="outlined" color="primary"
                                                            href={job.ass_qu} target="_blank" rel="noopener noreferrer"
                                                            startIcon={<OpenInNew fontSize="small" />}>
                                                            เปิดใบ QU
                                                          </Button>
                                                        : <Typography variant="caption" color="text.disabled">-</Typography>}
                                                </TableCell>
                                                <TableCell>
                                                    {job.created_at
                                                        ? new Date(job.created_at).toLocaleDateString("th-TH")
                                                        : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {job.updated_at
                                                        ? new Date(job.updated_at).toLocaleString("th-TH")
                                                        : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}
                    </Grid2>

                </Grid2>
            </Paper>
        </AuthenticatedLayout>
    );
}

const HEADER_STYLE = { backgroundColor: "#c7c7c7", "& .MuiTableCell-root": { fontWeight: "bold" } };
