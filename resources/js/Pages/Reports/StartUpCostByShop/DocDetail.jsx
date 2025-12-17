import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head } from "@inertiajs/react";
import { Container, Paper, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, Box, Chip, Stack, Grid2, Tooltip, IconButton, Snackbar, Alert } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print'; // Optional: ปุ่มพิมพ์
import { useState } from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PaidIcon from '@mui/icons-material/Paid';

export default function DocDetail({ doc_no, jobs, total_cost, current_shop_name, created_at, created_by_name, doc_status }) {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    console.log(created_at);
    const handleCopy = () => {
        if (!doc_no) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(doc_no)
                .then(() => setOpenSnackbar(true))
                .catch(() => fallbackCopy(doc_no));
        } else {
            fallbackCopy(doc_no);
        }
    };

    const fallbackCopy = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = 0;

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            document.execCommand('copy');
            setOpenSnackbar(true);
        } catch (err) {
            console.error('Fallback copy failed', err);
        }

        document.body.removeChild(textarea);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`รายละเอียดเอกสาร ${doc_no}`} />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header & Actions */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>

                    {/* ฝั่งซ้าย: ปุ่มย้อนกลับ */}
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => window.history.back()}
                        color="inherit"
                    >
                        ย้อนกลับ
                    </Button>

                    {/* ฝั่งขวา: จัดกลุ่มปุ่มพิมพ์และปุ่มบันทึกให้อยู่ด้วยกัน */}
                    <Stack direction="row" spacing={2}>
                        {/* ปุ่ม Print */}
                        <Button variant="outlined" startIcon={<PrintIcon />} disabled>
                            พิมพ์เอกสาร
                        </Button>
                        {/* ปุ่มสำหรับ บันทึกว่า จ่ายแล้ว */}
                        {doc_status !== 'P' && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<PaidIcon />}
                                // onClick={() => {
                                //     if (confirm('ยืนยันการบันทึกสถานะว่า "จ่ายเงินแล้ว" ?')) {
                                //         // ใส่ function เรียก API ตัดจ่ายที่นี่
                                //     }
                                // }}
                                onClick={() => alert('อยู่ระหว่างการพัฒนา')}
                            >
                                บันทึกการจ่ายเงิน
                            </Button>
                        )}
                        {doc_status === 'P' && (
                            <Chip label="จ่ายเงินเรียบร้อยแล้ว" color="success" variant="outlined" />
                        )}
                    </Stack>
                </Stack>

                <Paper sx={{ p: 4, mb: 3 }}>
                    <div className="flex items-center mb-5">
                        <Typography variant="h5" fontWeight="bold" color="primary">
                            เลขที่เอกสาร: <span className="underline">{doc_no}</span>
                        </Typography>
                        <Tooltip title="คัดลอกเลขที่เอกสาร">
                            <IconButton
                                size="small"
                                onClick={handleCopy}
                                sx={{
                                    bgcolor: 'action.hover',
                                    '&:hover': { bgcolor: 'action.selected' },
                                    ml: 1

                                }}
                            >
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <Snackbar
                        open={openSnackbar}
                        autoHideDuration={2000}
                        onClose={() => setOpenSnackbar(false)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                            คัดลอกเลขที่เอกสารแล้ว
                        </Alert>
                    </Snackbar>

                    {/* Info Section */}
                    <Grid2 container spacing={2} mb={4}>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary">ร้านค้า</Typography>
                            <Typography>{current_shop_name}</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 6, md: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary">วันที่เอกสาร</Typography>
                            <Typography>
                                {new Date(created_at).toLocaleDateString('th-TH', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 6, md: 3 }} textAlign="right">
                            <Typography variant="subtitle2" color="text.secondary">สถานะ</Typography>
                            <Chip label={doc_status === 'Y' ? 'รอจ่าย' : 'เสร็จสิ้น'}
                                color={doc_status === 'Y' ? 'warning' : 'success'}
                                size="small"
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 6, md: 3 }} textAlign="right">
                            <Typography variant="subtitle2" color="text.secondary">ผู้สร้าง</Typography>
                            <Typography>{created_by_name}</Typography>
                        </Grid2>
                    </Grid2>

                    {/* Table Section */}
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.100' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>ลำดับ</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Job ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>PID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>ชื่อสินค้า</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Serial</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>ค่าเปิดเครื่อง</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jobs.map((job, index) => (
                                <TableRow key={job.id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{job.job_id}</TableCell>
                                    <TableCell>{job.pid}</TableCell>
                                    <TableCell>{job.p_name}</TableCell>
                                    <TableCell>{job.serial_id}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                        {job.start_up_cost?.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {/* Footer Row (Total) */}
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell colSpan={5} align="right">
                                    <Typography variant="subtitle1" fontWeight="bold">รวมทั้งสิ้น</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="h6" fontWeight="bold" color="primary">
                                        ฿{total_cost?.toLocaleString()}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Paper>
            </Container>
        </AuthenticatedLayout >
    );
}