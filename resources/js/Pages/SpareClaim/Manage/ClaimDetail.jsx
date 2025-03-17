import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid2,
    Chip,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Button
} from '@mui/material';
import { AlertDialog, AlertDialogQuestion } from '@/Components/AlertDialog';
import axios from 'axios';

export default function ClaimDetail({ detail, claim }) {
    // จัดการสถานะด้วยสี
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return { bg: '#FFF9C4', color: '#F57F17', label: 'รอดำเนินการ' };
            case 'approved':
                return { bg: '#C8E6C9', color: '#2E7D32', label: 'อนุมัติแล้ว' };
            case 'rejected':
                return { bg: '#FFCDD2', color: '#C62828', label: 'ปฏิเสธแล้ว' };
            case 'in_progress':
                return { bg: '#BBDEFB', color: '#1565C0', label: 'กำลังดำเนินการ' };
            default:
                return { bg: '#E0E0E0', color: '#616161', label: 'ไม่ระบุ' };
        }
    };


    const handleUpdateById = (claimDetail_id, Status) => {
        AlertDialogQuestion({
            text: 'กดตกลงเพื่ออัพเดทสถานะการเคลมอะไหล่',
            onPassed: async (confirm) => {
                if (confirm) {
                    const { data, status } = await axios.put(`/admin/claimSP/update-by-sp-id/${claimDetail_id}/${Status}`);
                    AlertDialog({
                        icon: status === 200 ? 'success' : 'error',
                        text: data.message ?? 'เกิดข้อผิดพลาด',
                        onPassed: () => {
                            window.location.reload();
                        }
                    });
                }
            }
        })
    }

    const handleUpdateAll = (claim_id, Status) => {
        AlertDialogQuestion({
            text: 'กดตกลงเพื่ออัพเดทสถานะการเคลมอะไหล่ทั้งหมด',
            onPassed: async (confirm) => {
                if (confirm) {
                    const { data, status } = await axios.put(`/admin/claimSP/update-all/${claim_id}/${Status}`);
                    AlertDialog({
                        icon: status === 200 ? 'success' : 'error',
                        text: data.message ?? 'เกิดข้อผิดพลาด',
                        onPassed: () => {
                            window.location.reload();
                        }
                    });
                }
            }
        })
    }

    return (
        <Box sx={{ p: 2 }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={3}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    รายละเอียดเอกสารการเคลม {claim.claim_id}
                </Typography>
                <Stack direction='row' spacing={2}>
                    <Button onClick={()=>handleUpdateAll(claim.id,'approved')} variant='contained' disabled={claim.status !== 'pending'} color='success'>อนุมัติทั้งหมด</Button>
                    <Button onClick={()=>handleUpdateAll(claim.id,'rejected')} variant='contained' disabled={claim.status !== 'pending'} color='error'>ไม่อนุมัติทั้งหมด</Button>
                </Stack>
            </Stack>

            {detail && detail.map((item, index) => (
                <Card key={index} sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {item.sp_name}
                            </Typography>
                            <Chip
                                label={getStatusColor(item.status).label}
                                sx={{
                                    bgcolor: getStatusColor(item.status).bg,
                                    color: getStatusColor(item.status).color,
                                    fontWeight: 'bold'
                                }}
                            />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    รหัส job
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" gutterBottom>
                                    {item.job_id}
                                </Typography>
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    รหัสอะไหล่
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" gutterBottom>
                                    {item.sp_code}
                                </Typography>
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    หมายเลขซีเรียล
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" gutterBottom>
                                    {item.serial_id}
                                </Typography>
                            </Grid2>
                        </Grid2>

                        <Divider sx={{ my: 2 }} />

                        <TableContainer component={Paper} elevation={0} sx={{ my: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>รายการ</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>จำนวนขอเคลม</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>{item.sp_name}</TableCell>
                                        <TableCell align="center">{item.qty}</TableCell>
                                        <TableCell align="center">{item.unit}</TableCell>
                                        <TableCell align="center">{item.claim_unit}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 3, bgcolor: '#f9f9f9', p: 2, borderRadius: 1 }}>
                            <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        วันที่ส่งเคลม
                                    </Typography>
                                    <Typography variant="body2">
                                        {item.claim_submit_date}
                                    </Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        วันที่อนุมัติ
                                    </Typography>
                                    <Typography variant="body2">
                                        {item.claim_date}
                                    </Typography>
                                </Grid2>
                            </Grid2>
                        </Box>
                        <Stack direction='row-reverse' mt={2} spacing={2}>
                            <Button onClick={() => handleUpdateById(item.id, 'approved')} variant='contained' size='small' disabled={item.status !== 'pending'} color='success'>อนุมัติ</Button>
                            <Button onClick={() => handleUpdateById(item.id, 'rejected')} variant='contained' size='small' disabled={item.status !== 'pending'} color='error'>ไม่อนุมัติ</Button>
                        </Stack>
                    </CardContent>
                </Card>
            ))}

            {(!detail || detail.length === 0) && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        ไม่พบข้อมูลการเคลม
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}