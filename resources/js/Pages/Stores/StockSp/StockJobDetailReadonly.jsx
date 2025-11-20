import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Add, ArrowBack, BuildCircle, Delete, Edit, Save, Search } from "@mui/icons-material";
import {
    Box, Button, Container, FormControl, FormControlLabel,
    IconButton, Radio, RadioGroup, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography, useTheme, useMediaQuery, Grid2,
    Chip
} from "@mui/material";
import { TableStyle } from "../../../../css/TableStyle";
import { useRef, useState, useCallback } from "react";
import axios from "axios";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog";

export default function stockJobDetailReadonly({ job, job_detail = [], doc_type, ref_doc }) {

    const [spList, setSpList] = useState(job_detail);
    const [jobType, setJobType] = useState(job.type);
    const isLocked = job.job_status === 'deleted' || job.job_status === 'processing';

    const { flash } = usePage().props;

    // Responsive
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleSoftDelete = () => {
        AlertDialogQuestion({
            title: `คุณต้องการลบเอกสาร`,
            text: `กด ยืนยัน เพื่อทำการลบเอกสาร </br>${job.stock_job_id}`,
            onPassed: (confirm) => {
                confirm && router.delete(route('stockJob.delete', { stock_job_id: job.stock_job_id }));
            }
        });
    }

    const handleToEdit = () => {
        router.get(route('stockJob.edit', {
            stock_job_id: job.stock_job_id,
            is_code_cust_id: job.is_code_cust_id
        }));
    }

    const handleOnSave = () => {
        AlertDialogQuestion({
            title: 'คุณต้องการบันทึกข้อมูล',
            text: 'กด ยืนยัน เพื่อทำการบันทึกข้อมูล เป็น ปรับปรุงแล้ว',
            onPassed: (confirm) => {
                confirm && router.put(route('stockJob.update', { stock_job_id: job.stock_job_id, job_status: 'complete' }));
            }
        });
    }
    return (
        <AuthenticatedLayout>
            <Head title="สร้าง job" />
            <Container maxWidth="false" sx={{ backgroundColor: 'white', p: isMobile ? 2 : 3 }}>
                {/* Header */}
                <Box display='flex'
                    flexDirection={isMobile ? 'column' : 'row'}
                    justifyContent='space-between'
                    alignItems={isMobile ? 'flex-start' : 'center'}
                    mb={2}
                    gap={isMobile ? 2 : 0}
                >
                    <Box display='flex'
                        flexDirection={isMobile ? 'column' : 'row'} gap={2}
                        alignItems={isMobile ? 'flex-start' : 'center'}
                    >
                        <Button
                            size='small' variant="outlined" color="inherit" startIcon={<ArrowBack />}
                            onClick={() => router.get(route('stockJob.index'))}
                        >
                            กลับไปยังหน้ารายการ job
                        </Button>
                        <Typography fontSize={isMobile ? 18 : 20} fontWeight='bold'>
                            รายละเอียด #{job.stock_job_id}
                        </Typography>
                        {doc_type === "Auto" && ref_doc && (
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mt={0.5}
                                sx={{
                                    padding: "6px 10px",
                                    background: "#ffe6e6",
                                    borderRadius: "6px",
                                    border: "1px solid #ffb3b3",
                                    width: "fit-content",
                                }}
                            >
                                <Typography variant="body2" color="error">
                                    เอกสารจากใบเบิก
                                </Typography>

                                <Typography
                                    fontWeight={700}
                                    color="error"
                                    sx={{
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                    }}
                                    onClick={() =>
                                        router.get(route("withdrawJob.show", ref_doc))
                                    }
                                >
                                    #{ref_doc}
                                </Typography>
                            </Box>
                        )}
                        <Typography variant="body2">
                            <Chip label={jobType === 'เพิ่ม' ? 'ขาเพิ่ม' : 'ขาลด'} color={jobType === 'เพิ่ม' ? 'primary' : 'error'} />
                        </Typography>
                        <Chip label={`สถานะ : ${job.job_status}`} variant="outlined" />
                    </Box>



                    <Box display='flex' gap={2}>
                        <Button
                            variant="contained" color="error" disabled={job.job_status === 'complete'}
                            startIcon={<Delete />} onClick={handleSoftDelete}
                        >
                            ลบเอกสาร
                        </Button>
                        {/* <Button
                            variant="contained" color="warning" startIcon={<Edit />}
                            onClick={handleToEdit} 
                        // disabled={job.job_status === 'complete'}
                        // disabled
                        >
                            แก้ไข (ปิดปรับปรง)
                            แก้ไข
                        </Button> */}
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<Edit />}
                            onClick={handleToEdit}
                            disabled={job.job_status === 'complete'} 
                        >
                            แก้ไข
                        </Button>
                        <Button
                            variant="contained" startIcon={<BuildCircle />}
                            onClick={handleOnSave} disabled={job.job_status === 'complete'}
                        >
                            ปรับปรุง
                        </Button>
                    </Box>
                </Box>

                <Box>
                    {flash.success || flash.error}
                </Box>

                {/* Table */}
                <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={TableStyle.TableHead}>
                                <TableCell sx={{ minWidth: isMobile ? 120 : 'auto' }}>รหัสอะไหล่</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 200 : 'auto' }}>ชื่ออะไหล่</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>หน่วย</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>จำนวน</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>สต็อกคงเหลือ</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>สต็อกคงเหลือ พร้อมใช้งาน</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>สต็อกหลังปรับ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {spList.length > 0 ? (
                                spList.map((sp, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.sp_code}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.sp_name}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.sp_unit}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.sp_qty}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.count_sp ?? 0}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.total_aready ?? 0}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: isMobile ? '0.8rem' : '1rem',
                                                backgroundColor: jobType === 'ลด' && (sp.stock_after ?? 0) < 0 ? '#f2b8b5' : 'inherit'
                                            }}
                                        >
                                            {sp.stock_after ?? 0}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography color="text.secondary">
                                            ไม่พบข้อมูล กรุณาเพิ่มรายการอะไหล่
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>

                {/* Summary */}
                {spList.length > 0 && (
                    <Box mt={2} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            รวมรายการทั้งหมด: {spList.length} รายการ
                        </Typography>
                    </Box>
                )}
            </Container>
        </AuthenticatedLayout>
    );
}