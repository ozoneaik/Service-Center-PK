import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm } from "@inertiajs/react";
import { Container, Paper, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, Box, Chip, Stack, Tooltip, IconButton, Snackbar, Alert } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from "react";
export default function CreateDoc({ selected_jobs, total_cost, preview_doc_no, start_date }) {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const { data, setData, post, processing } = useForm({
        job_ids: selected_jobs.map(j => j.job_id),
        start_date: start_date,
        note: '', 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('report.start-up-cost-shop.store-doc'));
    };

    const handleCopy = () => {
        if (!preview_doc_no) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(preview_doc_no)
                .then(() => setOpenSnackbar(true))
                .catch(() => fallbackCopy(preview_doc_no));
        } else {
            fallbackCopy(preview_doc_no);
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
            <Head title="สร้างเอกสารเบิกค่าเปิดเครื่อง" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4 }}>
                    {/* Header ส่วนหัวกระดาษ */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            ยืนยันการสร้างเอกสาร 
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">เลขที่เอกสาร</Typography>
                            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                                <Chip
                                    label={preview_doc_no}
                                    color="primary"
                                    variant="filled"
                                    sx={{ fontWeight: 'bold', fontSize: '1rem', px: 1 }}
                                />
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
                        </Box>
                    </Box>
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
                    <Table sx={{ mt: 2 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Job ID</TableCell>
                                <TableCell>สินค้า</TableCell>
                                <TableCell align="right">ค่าเปิดเครื่อง</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selected_jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell>{job.job_id}</TableCell>
                                    <TableCell>{job.p_name}</TableCell>
                                    <TableCell align="right">{job.start_up_cost?.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>รวมทั้งสิ้น</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{total_cost?.toLocaleString()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'end', gap: 2 }}>
                        <Button variant="outlined" onClick={() => window.history.back()}>ย้อนกลับ</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={processing}
                        >
                            ยืนยันสร้างเอกสาร
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}