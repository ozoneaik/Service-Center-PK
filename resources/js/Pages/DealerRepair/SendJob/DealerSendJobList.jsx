import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import {
    Alert, Autocomplete, Box, Button, Card, CardContent, Checkbox, Chip, Divider,
    Grid2, Paper, Stack, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Tooltip, Typography, useMediaQuery,
} from "@mui/material";
import { Search, Store, Warning } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import { AlertDialogQuestion } from "@/Components/AlertDialog.js";

export default function DealerSendJobList({ jobs, dealer_list = [], selected_dealer = null, is_sale = false }) {
    const isMobile = useMediaQuery("(max-width:600px)");
    const { flash } = usePage().props;
    const { data, setData, post, processing } = useForm({ selectedJobs: [] });
    const [searchSku, setSearchSku] = useState("");
    const [searchSn, setSearchSn] = useState("");
    const [dealerCode, setDealerCode] = useState(selected_dealer || null);

    useEffect(() => {
        const saved = localStorage.getItem("dealer_selectedJobs");
        if (saved) {
            setData("selectedJobs", JSON.parse(saved));
            localStorage.removeItem("dealer_selectedJobs");
        }
    }, []);

    const isSelected = (jobId) => data.selectedJobs.some((j) => j.job_id === jobId);

    const handleSelect = (job, e) => {
        if (!job.before_form_complete) return;
        const checked = e.target.checked;
        setData((prev) => ({
            ...prev,
            selectedJobs: checked
                ? prev.selectedJobs.some((j) => j.job_id === job.job_id)
                    ? prev.selectedJobs
                    : [...prev.selectedJobs, job]
                : prev.selectedJobs.filter((j) => j.job_id !== job.job_id),
        }));
    };

    const handleSelectAll = (e) => {
        setData("selectedJobs", e.target.checked ? jobs.filter(j => j.before_form_complete) : []);
    };

    const completeCount = jobs.filter(j => j.before_form_complete).length;

    const handleSearch = (e) => {
        e.preventDefault();
        localStorage.setItem("dealer_selectedJobs", JSON.stringify(data.selectedJobs));
        router.get(route("dealerRepair.send.list", { searchSku, searchSn, dealer_code: dealerCode }));
    };

    const handleDealerChange = (_, newValue) => {
        const code = newValue?.is_code_cust_id || null;
        setDealerCode(code);
        setData("selectedJobs", []);
        router.get(route("dealerRepair.send.list", { dealer_code: code }));
    };

    const handleSend = () => {
        if (data.selectedJobs.length === 0) {
            alert("กรุณาเลือกรายการที่ต้องการส่ง");
            return;
        }
        AlertDialogQuestion({
            title: "แน่ใจหรือไม่",
            text: "กด ตกลง เพื่อยืนยันการส่งซ่อมไปยัง PK",
            onPassed: (confirm) => {
                if (confirm) {
                    post(route("dealerRepair.send.update"), {
                        onFinish: () => setData("selectedJobs", []),
                    });
                }
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="ส่งซ่อมพัมคิน (ร้านค้า)" />
            <Paper sx={{ bgcolor: "white", p: 3 }}>
                <Grid2 container spacing={2} mb={isMobile ? 10 : 0}>
                    <Grid2 size={12}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold">
                                ส่งซ่อมพัมคินฯ (ร้านค้า)
                            </Typography>
                            <Typography variant="body1">รายการทั้งหมด {jobs.length} รายการ</Typography>
                        </Stack>

                        {is_sale && (
                            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                    <Store fontSize="small" color="primary" />
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                        เลือกร้านค้า
                                    </Typography>
                                </Stack>
                                <Autocomplete
                                    options={dealer_list}
                                    getOptionLabel={(o) => `${o.shop_name} (${o.is_code_cust_id})`}
                                    value={dealer_list.find(d => d.is_code_cust_id === dealerCode) || null}
                                    onChange={handleDealerChange}
                                    renderInput={(params) => (
                                        <TextField {...params} size="small" placeholder="ทั้งหมด (ไม่กรอง)" />
                                    )}
                                />
                            </Paper>
                        )}

                        <form onSubmit={handleSearch}>
                            <Stack direction={{ md: "row", sm: "column" }} gap={2} mt={2}>
                                <TextField
                                    fullWidth={isMobile}
                                    onChange={(e) => setSearchSku(e.target.value)}
                                    label="ค้นหารหัสสินค้า"
                                    size="small"
                                />
                                <TextField
                                    fullWidth={isMobile}
                                    onChange={(e) => setSearchSn(e.target.value)}
                                    label="ค้นหาหมายเลขซีเรียล"
                                    size="small"
                                />
                                <Button fullWidth={isMobile} startIcon={<Search />} type="submit" variant="contained">
                                    ค้นหา
                                </Button>
                            </Stack>
                        </form>
                    </Grid2>

                    {flash?.success && (
                        <Grid2 size={12}>
                            <Alert variant="filled" severity="success">{flash.success}</Alert>
                        </Grid2>
                    )}
                    {flash?.error && (
                        <Grid2 size={12}>
                            <Alert variant="filled" severity="error">{flash.error}</Alert>
                        </Grid2>
                    )}

                    {isMobile ? (
                        <Grid2 size={12}>
                            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Checkbox
                                        checked={data.selectedJobs.length === completeCount && completeCount > 0}
                                        indeterminate={data.selectedJobs.length > 0 && data.selectedJobs.length < completeCount}
                                        onChange={handleSelectAll}
                                    />
                                    <Typography variant="body2" fontWeight="bold">
                                        เลือกทั้งหมด ({data.selectedJobs.length}/{completeCount} รายการที่พร้อมส่ง)
                                    </Typography>
                                </Stack>
                            </Card>
                            <Stack spacing={2}>
                                {jobs.map((job, i) => (
                                    <Card
                                        key={i} variant="outlined"
                                        sx={{ bgcolor: isSelected(job.job_id) ? "#f0f0f0" : job.before_form_complete ? "inherit" : "#fff8e1" }}
                                    >
                                        <CardContent>
                                            <Stack direction="row" alignItems="flex-start" spacing={2}>
                                                <Tooltip title={!job.before_form_complete ? "กรุณาบันทึกข้อมูลแจ้งซ่อมก่อน" : ""}>
                                                    <span>
                                                        <Checkbox
                                                            checked={isSelected(job.job_id)}
                                                            disabled={!job.before_form_complete}
                                                            onChange={(e) => handleSelect(job, e)}
                                                        />
                                                    </span>
                                                </Tooltip>
                                                <Box flex={1}>
                                                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                                        <Typography variant="h6" fontWeight="bold" color="primary">
                                                            JOB: {job.job_id}
                                                        </Typography>
                                                        {!job.before_form_complete && (
                                                            <Chip
                                                                icon={<Warning />}
                                                                label="ยังไม่ได้บันทึกข้อมูลแจ้งซ่อม"
                                                                color="warning" size="small"
                                                            />
                                                        )}
                                                    </Stack>
                                                    <Stack spacing={1}>
                                                        {is_sale && job.dealer_shop_name && (
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">ร้านค้า</Typography>
                                                                <Typography fontWeight="medium">{job.dealer_shop_name}</Typography>
                                                            </Box>
                                                        )}
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">หมายเลขซีเรียล</Typography>
                                                            <Typography fontWeight="medium">{job.serial_id}</Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">รหัสสินค้า</Typography>
                                                            <Typography fontWeight="medium">{job.pid}</Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">ชื่อสินค้า</Typography>
                                                            <Typography fontWeight="medium">{job.p_name}</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">สร้างเมื่อ</Typography>
                                                            <Typography><DateFormatTh date={job.created_at} /></Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </Grid2>
                    ) : (
                        <Grid2 size={12}>
                            <Card variant="outlined" sx={{ overflow: "auto", maxHeight: 750 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={HEADER_STYLE}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={data.selectedJobs.length === completeCount && completeCount > 0}
                                                    indeterminate={data.selectedJobs.length > 0 && data.selectedJobs.length < completeCount}
                                                    onChange={handleSelectAll}
                                                />
                                            </TableCell>
                                            <TableCell>เลขที่ JOB</TableCell>
                                            {is_sale && <TableCell>ร้านค้า</TableCell>}
                                            <TableCell>ข้อมูลเบื้องต้น</TableCell>
                                            <TableCell>สถานะ</TableCell>
                                            <TableCell>สร้างเมื่อ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {jobs.map((job, i) => (
                                            <TableRow
                                                key={i}
                                                sx={{ bgcolor: isSelected(job.job_id) ? "#f0f0f0" : job.before_form_complete ? "inherit" : "#fff8e1" }}
                                            >
                                                <TableCell>
                                                    <Tooltip title={!job.before_form_complete ? "กรุณาบันทึกข้อมูลแจ้งซ่อมก่อน" : ""}>
                                                        <span>
                                                            <Checkbox
                                                                checked={isSelected(job.job_id)}
                                                                disabled={!job.before_form_complete}
                                                                onClick={(e) => handleSelect(job, e)}
                                                            />
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>{job.job_id}</TableCell>
                                                {is_sale && <TableCell>{job.dealer_shop_name || "-"}</TableCell>}
                                                <TableCell>
                                                    หมายเลขซีเรียล : {job.serial_id}<br />
                                                    รหัสสินค้า : {job.pid}<br />
                                                    ชื่อสินค้า : {job.p_name}
                                                </TableCell>
                                                <TableCell>
                                                    {job.before_form_complete
                                                        ? <Chip label="พร้อมส่ง" color="success" size="small" />
                                                        : <Chip icon={<Warning />} label="ยังไม่ได้บันทึกข้อมูล" color="warning" size="small" />
                                                    }
                                                </TableCell>
                                                <TableCell><DateFormatTh date={job.created_at} /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </Grid2>
                    )}

                    {!isMobile && (
                        <Grid2 size={12}>
                            <Stack direction="row-reverse">
                                <Button
                                    variant="contained"
                                    onClick={handleSend}
                                    disabled={data.selectedJobs.length === 0 || processing}
                                >
                                    ส่งไปยัง PK ({data.selectedJobs.length})
                                </Button>
                            </Stack>
                        </Grid2>
                    )}
                </Grid2>

                {isMobile && (
                    <Box position="fixed" bottom={0} left={0} p={2} width="100%" zIndex={1000} bgcolor="white" boxShadow={3}>
                        <Button
                            variant="contained" fullWidth
                            onClick={handleSend}
                            disabled={data.selectedJobs.length === 0 || processing}
                        >
                            ส่งไปยัง PK ({data.selectedJobs.length})
                        </Button>
                    </Box>
                )}
            </Paper>
        </AuthenticatedLayout>
    );
}

const HEADER_STYLE = { backgroundColor: "#c7c7c7", fontWeight: "bold", fontSize: 16 };
