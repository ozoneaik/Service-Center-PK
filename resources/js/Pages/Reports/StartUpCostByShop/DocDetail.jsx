import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head } from "@inertiajs/react";
import { Container, Paper, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, Box, Chip, Stack, Grid2, Tooltip, IconButton, Snackbar, Alert, Card, CardContent, Divider } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import { useState } from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PaidIcon from '@mui/icons-material/Paid';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function DocDetail({ doc_no, jobs, total_cost, current_shop_name, created_at, created_by_name, doc_status, cn_doc }) {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const getStatusChip = () => {
        if (doc_status === 'P') {
            return <Chip label="จ่ายเงินเรียบร้อยแล้ว" color="success" variant="filled" size={isMobile ? "small" : "medium"} />;
        }
        if (doc_status === 'Y') {
            if (cn_doc) {
                return <Chip label="สร้าง CN แล้ว" color="primary" variant="filled" size={isMobile ? "small" : "medium"} />;
            } else {
                return <Chip label="รอสร้าง CN" color="warning" variant="filled" size={isMobile ? "small" : "medium"} />;
            }
        }
        return <Chip label="ไม่ทราบสถานะ" color="default" variant="outlined" size={isMobile ? "small" : "medium"} />;
    };

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

    // Mobile Job Card Component
    const JobCard = ({ job, index }) => (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Stack spacing={1.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" color="text.secondary">
                            รายการที่ {index + 1}
                        </Typography>
                        <Chip label={`Job: ${job.job_id}`} size="small" color="primary" variant="outlined" />
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="caption" color="text.secondary">PID</Typography>
                        <Typography variant="body2" fontWeight="medium">{job.pid}</Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary">ชื่อสินค้า</Typography>
                        <Typography variant="body2" fontWeight="medium">{job.p_name}</Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary">Serial</Typography>
                        <Typography variant="body2" fontWeight="medium">{job.serial_id}</Typography>
                    </Box>

                    <Divider />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="bold">ค่าเปิดเครื่อง</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            ฿{job.start_up_cost?.toLocaleString()}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <AuthenticatedLayout>
            <Head title={`รายละเอียดเอกสาร ${doc_no}`} />
            <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
                {/* Header & Actions */}
                <Stack
                    direction={isMobile ? "column" : "row"}
                    justifyContent="space-between"
                    alignItems={isMobile ? "stretch" : "center"}
                    spacing={2}
                    mb={3}
                >
                    {/* ปุ่มย้อนกลับ */}
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => window.history.back()}
                        color="inherit"
                        fullWidth={isMobile}
                        sx={{ justifyContent: isMobile ? "flex-start" : "center" }}
                    >
                        ย้อนกลับ
                    </Button>

                    {/* ปุ่มด้านขวา */}
                    <Stack direction={isMobile ? "column" : "row"} spacing={1} width={isMobile ? "100%" : "auto"}>
                        {/* <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            disabled
                            fullWidth={isMobile}
                            size={isMobile ? "small" : "medium"}
                        >
                            พิมพ์เอกสาร
                        </Button> */}

                        {/* {doc_status !== 'P' && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<PaidIcon />}
                                onClick={() => alert('อยู่ระหว่างการพัฒนา')}
                                fullWidth={isMobile}
                                size={isMobile ? "small" : "medium"}
                                disabled
                            >
                                บันทึกการตัดชำระ
                            </Button>
                        )} */}
                    </Stack>
                </Stack>

                <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 3 }}>
                    {/* เลขที่เอกสาร */}
                    <Stack
                        direction={isMobile ? "column" : "row"}
                        alignItems={isMobile ? "flex-start" : "center"}
                        spacing={1}
                        mb={3}
                    >
                        <Typography
                            variant={isMobile ? "h6" : "h5"}
                            fontWeight="bold"
                            color="primary"
                            sx={{ wordBreak: "break-all" }}
                        >
                            เลขที่เอกสาร: <span style={{ textDecoration: "underline" }}>{doc_no}</span>
                        </Typography>
                        <Tooltip title="คัดลอกเลขที่เอกสาร">
                            <IconButton
                                size="small"
                                onClick={handleCopy}
                                sx={{
                                    bgcolor: 'action.hover',
                                    '&:hover': { bgcolor: 'action.selected' }
                                }}
                            >
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>

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
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary">ร้านค้า</Typography>
                            <Typography variant={isMobile ? "body2" : "body1"}>{current_shop_name}</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary">วันที่เอกสาร</Typography>
                            <Typography variant={isMobile ? "body2" : "body1"}>
                                {new Date(created_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: isMobile ? 'short' : 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>สถานะ</Typography>
                            {getStatusChip()}
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary">ผู้สร้าง</Typography>
                            <Typography variant={isMobile ? "body2" : "body1"}>{created_by_name}</Typography>
                        </Grid2>
                    </Grid2>

                    {/* Table Section - Desktop/Tablet */}
                    {!isMobile ? (
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: 'grey.100' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>ลำดับ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Job ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>PID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>ชื่อสินค้า</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Serial</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>ค่าเปิดเครื่อง</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobs.map((job, index) => (
                                        <TableRow key={job.id} hover>
                                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{index + 1}</TableCell>
                                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{job.job_id}</TableCell>
                                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{job.pid}</TableCell>
                                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{job.p_name}</TableCell>
                                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{job.serial_id}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                {job.start_up_cost?.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell colSpan={5} align="right">
                                            <Typography variant="subtitle1" fontWeight="bold" fontSize={{ xs: '0.875rem', sm: '1rem' }}>
                                                รวมทั้งสิ้น
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="h6" fontWeight="bold" color="primary" fontSize={{ xs: '1rem', sm: '1.25rem' }}>
                                                ฿{total_cost?.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    ) : (
                        /* Card Layout - Mobile */
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                รายการสินค้า ({jobs.length} รายการ)
                            </Typography>
                            {jobs.map((job, index) => (
                                <JobCard key={job.id} job={job} index={index} />
                            ))}

                            {/* Total Card */}
                            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="h6" fontWeight="bold">รวมทั้งสิ้น</Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            ฿{total_cost?.toLocaleString()}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}