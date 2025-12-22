import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm } from "@inertiajs/react";
import { Container, Paper, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, Box, Chip, Stack, Tooltip, IconButton, Snackbar, Alert, Divider } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from "react";

export default function CreateDoc({ preview_data, total_cost, preview_cover_doc_no, start_date }) {
    const [openSnackbar, setOpenSnackbar] = useState(false);

    // ส่งข้อมูลกลับไป Backend ทั้งก้อน เพื่อความชัวร์ในการ Group
    const { data, setData, post, processing } = useForm({
        shop_groups: preview_data,
        start_date: start_date,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('report.start-up-cost-shop.store-doc'));
    };

    const handleCopy = () => {
        if (!preview_cover_doc_no) return;
        navigator.clipboard.writeText(preview_cover_doc_no).then(() => setOpenSnackbar(true));
    };

    return (
        <AuthenticatedLayout>
            <Head title="สร้างเอกสารเบิกค่าเปิดเครื่อง" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">
                                ยืนยันการสร้างเอกสาร
                            </Typography>
                            {/* <Typography variant="body2" color="text.secondary" mt={1}>
                                รายการนี้จะถูกแยกเอกสาร CT ตามร้านค้า โดยมีเลขใบปะหน้าคลุม
                            </Typography> */}
                        </Box>

                        <Box sx={{ textAlign: 'right', bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">เลขที่เอกสาร (Cover)</Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    {preview_cover_doc_no}
                                </Typography>
                                <Tooltip title="คัดลอก">
                                    <IconButton size="small" onClick={handleCopy}>
                                        <ContentCopyIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>
                    </Box>

                    <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                        <Alert severity="success">คัดลอกแล้ว</Alert>
                    </Snackbar>

                    {/* Table แสดงแยกรายร้าน */}
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead sx={{ bgcolor: 'grey.100' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>เลขที่ CT</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>ร้านค้า</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>จำนวน Job</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>ค่าเปิดเครื่อง</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {preview_data.map((row) => (
                                <TableRow key={row.shop_id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        <Chip label={row.doc_no} size="small" color="default" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">{row.shop_name}</Typography>
                                        <Typography variant="caption" color="text.secondary">Code: {row.shop_id}</Typography>
                                    </TableCell>
                                    <TableCell align="center">{row.job_count}</TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold" color="primary">
                                            {row.total_cost?.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {/* Grand Total */}
                            <TableRow sx={{ bgcolor: 'info.lighter' }}>
                                <TableCell colSpan={2} align="right">
                                    <Typography variant="subtitle1" fontWeight="bold">รวมทั้งหมด</Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {preview_data.reduce((sum, item) => sum + item.job_count, 0)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                                        ฿{total_cost?.toLocaleString()}
                                    </Typography>
                                </TableCell>
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
                            size="large"
                        >
                            ยืนยันสร้างเอกสาร ({preview_data.length} ใบ)
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}