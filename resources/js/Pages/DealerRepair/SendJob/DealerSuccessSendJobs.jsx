import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head } from "@inertiajs/react";
import {
    Alert, Box, Button, Card, Checkbox, Chip, CircularProgress,
    Grid2, Paper, Stack, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { OpenInNew, Refresh } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";
import { AlertDialogQuestion } from "@/Components/AlertDialog.js";

const STATUS_LABEL = {
    send: "ส่งซ่อมไปยัง PK",
    pending: "รอดำเนินการ (PK)",
    success: "สำเร็จ",
    canceled: "ยกเลิก",
};

const STATUS_COLOR = {
    send: "warning",
    pending: "info",
    success: "success",
    canceled: "error",
};

export default function DealerSuccessSendJobs({ is_sale }) {
    const [view, setView] = useState("current"); // current | history
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [batchChecking, setBatchChecking] = useState(false);
    const [checkingId, setCheckingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [alert, setAlert] = useState(null);

    const [filters, setFilters] = useState({
        job_id: "", serial_id: "", pid: "", group_job: "",
        start_date: "", end_date: "",
    });

    useEffect(() => { fetchJobs(); }, [view]);

    const fetchJobs = async (f = filters) => {
        setJobs([]);
        setSelectedIds([]);
        setLoading(true);
        try {
            const url = view === "history" ? route("dealerRepair.send.history") : route("dealerRepair.send.all");
            const { data } = await axios.post(url, f);
            setJobs(data.jobs || []);
            if (!data.jobs?.length) setAlert({ type: "info", message: data.message || "ไม่พบรายการ" });
        } catch (e) {
            setAlert({ type: "error", message: e.response?.data?.message || e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e) => { e.preventDefault(); fetchJobs(); };

    const handleResetFilter = () => {
        const empty = { job_id: "", serial_id: "", pid: "", group_job: "", start_date: "", end_date: "" };
        setFilters(empty);
        fetchJobs(empty);
    };

    const handleCheckOne = async (job) => {
        setCheckingId(job.job_id);
        try {
            const { data } = await axios.post(route("dealerRepair.send.check.status"), {
                job_id: job.job_id,
            });
            setJobs((prev) => prev.map((j) =>
                j.job_id === job.job_id ? { ...j, status: data.api_status, ticket_code: data.ticket_code } : j
            ));
            setAlert({ type: "success", message: `Job ${job.job_id}: ${STATUS_LABEL[data.api_status] ?? data.api_status}` });
        } catch (e) {
            setAlert({ type: "error", message: e.response?.data?.message || e.message });
        } finally {
            setCheckingId(null);
        }
    };

    const handleBatchCheck = async () => {
        const ids = jobs.map((j) => j.job_id);
        setBatchChecking(true);
        try {
            const { data } = await axios.post(route("dealerRepair.send.batch.check"), { job_ids: ids });
            setAlert({ type: "success", message: data.message });
            fetchJobs();
        } catch (e) {
            setAlert({ type: "error", message: e.response?.data?.message || e.message });
        } finally {
            setBatchChecking(false);
        }
    };

    const handleFinish = () => {
        if (selectedIds.length === 0) {
            setAlert({ type: "warning", message: "กรุณาเลือกรายการที่ต้องการปิดงาน" });
            return;
        }
        const toFinish = jobs.filter((j) => selectedIds.includes(j.job_id)).map((j) => ({ job_id: j.job_id }));
        AlertDialogQuestion({
            title: "ยืนยันการปิดงาน",
            text: `ปิดงาน ${toFinish.length} รายการ ใช่หรือไม่?`,
            onPassed: async (confirmed) => {
                if (!confirmed) return;
                try {
                    const { data } = await axios.post(route("dealerRepair.send.finish"), { jobs_to_finish: toFinish });
                    setAlert({ type: "success", message: data.message });
                    fetchJobs();
                } catch (e) {
                    setAlert({ type: "error", message: e.response?.data?.message || e.message });
                }
            },
        });
    };

    const toggleSelect = (jobId) => {
        setSelectedIds((prev) =>
            prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
        );
    };
    const toggleSelectAll = (e) => setSelectedIds(e.target.checked ? jobs.map((j) => j.job_id) : []);

    return (
        <AuthenticatedLayout>
            <Head title="ติดตามสถานะส่งซ่อม (ร้านค้า)" />
            <Paper sx={{ bgcolor: "white", p: 3 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography variant="h6" fontWeight="bold">ติดตามสถานะส่งซ่อมพัมคินฯ (ร้านค้า)</Typography>
                    </Grid2>

                    {/* Tab Switch */}
                    <Grid2 size={12}>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant={view === "current" ? "contained" : "outlined"}
                                onClick={() => setView("current")}
                            >
                                งานที่ส่งแล้ว (กำลังดำเนินการ)
                            </Button>
                            <Button
                                variant={view === "history" ? "contained" : "outlined"}
                                color="success"
                                onClick={() => setView("history")}
                            >
                                ประวัติการปิดงาน (สำเร็จ)
                            </Button>
                        </Stack>
                    </Grid2>

                    {/* Filter */}
                    <Grid2 size={12}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            <form onSubmit={handleFilterSubmit}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2} flexWrap="wrap">
                                    <TextField size="small" label="Group Job" value={filters.group_job}
                                        onChange={(e) => setFilters({ ...filters, group_job: e.target.value })} />
                                    <TextField size="small" label="Job ID" value={filters.job_id}
                                        onChange={(e) => setFilters({ ...filters, job_id: e.target.value })} />
                                    <TextField size="small" label="Serial ID" value={filters.serial_id}
                                        onChange={(e) => setFilters({ ...filters, serial_id: e.target.value })} />
                                    <TextField size="small" label="รหัสสินค้า (PID)" value={filters.pid}
                                        onChange={(e) => setFilters({ ...filters, pid: e.target.value })} />
                                    <TextField size="small" type="date" label="วันที่เริ่ม" value={filters.start_date}
                                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                    <TextField size="small" type="date" label="วันที่สิ้นสุด" value={filters.end_date}
                                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                    <Button type="submit" variant="contained" disabled={loading}>ค้นหา</Button>
                                    <Button variant="outlined" onClick={handleResetFilter} disabled={loading}>ล้างค่า</Button>
                                </Stack>
                            </form>
                        </Card>
                    </Grid2>

                    {/* Alert */}
                    {alert && (
                        <Grid2 size={12}>
                            <Alert severity={alert.type} onClose={() => setAlert(null)}>{alert.message}</Alert>
                        </Grid2>
                    )}

                    {/* Action bar */}
                    {view === "current" && jobs.length > 0 && (
                        <Grid2 size={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    startIcon={batchChecking ? <CircularProgress size={16} /> : <Refresh />}
                                    onClick={handleBatchCheck}
                                    disabled={batchChecking || loading}
                                >
                                    เช็คสถานะทั้งหมด ({jobs.length})
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleFinish}
                                    disabled={selectedIds.length === 0 || loading}
                                >
                                    ปิดงาน ({selectedIds.length})
                                </Button>
                            </Stack>
                        </Grid2>
                    )}

                    {/* Table */}
                    <Grid2 size={12}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Card variant="outlined" sx={{ overflowX: "auto" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={HEADER_STYLE}>
                                            {view === "current" && (
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedIds.length === jobs.length && jobs.length > 0}
                                                        indeterminate={selectedIds.length > 0 && selectedIds.length < jobs.length}
                                                        onChange={toggleSelectAll}
                                                    />
                                                </TableCell>
                                            )}
                                            {is_sale && <TableCell>ร้านค้า</TableCell>}
                                            <TableCell>Group Job</TableCell>
                                            <TableCell>Job ID</TableCell>
                                            <TableCell>Serial ID</TableCell>
                                            <TableCell>รหัสสินค้า</TableCell>
                                            <TableCell>ชื่อสินค้า</TableCell>
                                            <TableCell>Ticket / ASS No.</TableCell>
                                            <TableCell>สถานะเอกสาร JOB</TableCell>
                                            <TableCell>สถานะงานซ่อม / ASS Status</TableCell>
                                            <TableCell>ใบเสนอราคา / qu</TableCell>
                                            {view === "current" && <TableCell>ตรวจสอบ</TableCell>}
                                            <TableCell>{view === "history" ? "วันที่ปิดงาน" : "วันที่ส่ง"}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {jobs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={is_sale ? 11 : 10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                    ไม่พบรายการ
                                                </TableCell>
                                            </TableRow>
                                        ) : jobs.map((job, i) => (
                                            <TableRow key={i} hover>
                                                {view === "current" && (
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedIds.includes(job.job_id)}
                                                            onChange={() => toggleSelect(job.job_id)}
                                                        />
                                                    </TableCell>
                                                )}
                                                {is_sale && (
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="medium">{job.dealer_shop_name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{job.dealer_code}</Typography>
                                                    </TableCell>
                                                )}
                                                <TableCell>{job.group_job}</TableCell>
                                                <TableCell>{job.job_id}</TableCell>
                                                <TableCell>{job.serial_id}</TableCell>
                                                <TableCell>{job.pid}</TableCell>
                                                <TableCell>{job.p_name}</TableCell>
                                                <TableCell>
                                                    {job.ticket_code
                                                        ? <Chip label={job.ticket_code} size="small" color="primary" variant="outlined" />
                                                        : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={STATUS_LABEL[job.status] ?? job.status}
                                                        color={STATUS_COLOR[job.status] ?? "default"}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {job.ass_status
                                                        ? <Chip label={job.ass_status} size="small" />
                                                        : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {job.ass_qu
                                                        ? <Button size="small" variant="outlined" color="primary"
                                                            href={job.ass_qu} target="_blank" rel="noopener noreferrer"
                                                            startIcon={<OpenInNew fontSize="small" />}>
                                                            เปิดใบ QU
                                                          </Button>
                                                        : "-"}
                                                </TableCell>
                                                {view === "current" && (
                                                    <TableCell>
                                                        {["send", "pending"].includes(job.status) && (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                startIcon={checkingId === job.job_id
                                                                    ? <CircularProgress size={14} />
                                                                    : <Refresh />}
                                                                onClick={() => handleCheckOne(job)}
                                                                disabled={checkingId === job.job_id || batchChecking}
                                                            >
                                                                {checkingId === job.job_id ? "กำลังเช็ค..." : "เช็คสถานะ"}
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    {new Date(view === "history" ? job.updated_at : job.created_at).toLocaleString("th")}
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

const HEADER_STYLE = { backgroundColor: "#c7c7c7", fontWeight: "bold", fontSize: 16 };
