import React from 'react';
import {
    Box, Button, Chip, Paper, Stack, Typography,
    Table, TableBody, TableCell, TableContainer, TableRow
} from '@mui/material';
import { Send, Edit, Delete } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { router } from '@inertiajs/react';

export default function RpSummaryForm({ JOB, productDetail, setTabValue }) {

    if (!JOB) return <Box p={3} textAlign="center">ไม่พบข้อมูล JOB</Box>;

    const shopUnderSaleName = JOB.shop_under_sale_name || JOB.shop_under_sale || '-';
    const shopUnderSaleId = JOB.shop_under_sale_id || '';

    // ศูนย์บริการ
    const serviceCenterCode = JOB.is_code_cust_id || '-';
    const serviceCenterName = JOB.service_center_name ? ` : ${JOB.service_center_name}` : '';
    const serviceCenterDisplay = `${serviceCenterCode}${serviceCenterName}`;

    // เตรียมข้อมูลแสดงผล (ดึงจาก JOB ที่ Backend ส่งมาให้)
    const symptomText = JOB.symptom || JOB.remark_symptom_accessory?.symptom || '-';
    const accessoryText = JOB.accessory_note || JOB.remark_symptom_accessory?.accessory || '-';
    const internalRemarkText = JOB.internal_remark || JOB.remark_symptom_accessory?.remark || '-';

    const filesBefore = JOB.files_before || [];
    const renderFilePreview = (files) => {
        if (!files || files.length === 0) {
            return '-';
        }

        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                {files.map((file) => (
                    <Paper
                        key={file.id}
                        elevation={2}
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                            bgcolor: '#eee'
                        }}
                    >
                        <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                            {file.is_video ? (
                                <>
                                    {/* แสดงเป็น Video tag แบบปิดเสียงเพื่อให้เห็นภาพแรก */}
                                    <video
                                        src={file.url}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        muted
                                        playsInline
                                    />
                                    {/* ไอคอน Play ทับตรงกลาง */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            bgcolor: 'rgba(0,0,0,0.3)', color: 'white'
                                        }}
                                    >
                                        <PlayCircleOutline sx={{ fontSize: 40 }} />
                                    </Box>
                                </>
                            ) : (
                                <img
                                    src={file.url}
                                    alt="สภาพสินค้า"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    // เพิ่ม onError เผื่อรูปโหลดไม่ได้
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                                />
                            )}
                        </a>
                    </Paper>
                ))}
            </Box>
        );
    };

    // Helper แปลงค่า Delivery Type
    const getDeliveryLabel = (type) => {
        const map = {
            'shop': 'ส่งคืนร้านค้า',
            'customer': 'ส่งถึงลูกค้า (ร้านค้า)',
            'sale_self': 'เซลล์รับเอง'
        };
        return map[type] || type || '-';
    };

    // Helper สร้างข้อความหมายเหตุ
    const getRemarkText = () => {
        let remarks = [];
        if (JOB.subremark1) remarks.push('เสนอราคาก่อนซ่อม');
        if (JOB.subremark2) remarks.push('ซ่อมเสร็จส่งกลับ ปณ.');
        if (JOB.subremark3) remarks.push('อื่นๆ'); // หรือแสดง JOB.remark ต่อท้าย

        let text = remarks.join(', ');
        if (JOB.remark) text += ` (${JOB.remark})`;
        return text || '-';
    };

    // --- Handlers ---
    const handleSubmit = () => {
        Swal.fire({
            title: 'ยืนยันการส่งงาน?',
            text: `ต้องการส่งงานซ่อม ${JOB.job_id} ใช่หรือไม่`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ยืนยันส่งงาน',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#4285f4'
        }).then((result) => {
            if (result.isConfirmed) {
                // [2] เปลี่ยนจาก router.post เป็น axios.post
                axios.post(route('repair.sale.confirm.send'), { job_id: JOB.job_id })
                    .then((response) => {
                        // เมื่อ backend ตอบกลับ success (200)
                        Swal.fire({
                            title: 'สำเร็จ',
                            text: 'ส่งงานเรียบร้อยแล้ว',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            // ย้ายไปหน้า Index
                            router.get(route('repair.sale.index'));
                        });
                    })
                    .catch((error) => {
                        // เมื่อเกิดข้อผิดพลาด
                        console.error(error);
                        const msg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งงาน';
                        Swal.fire('เกิดข้อผิดพลาด', msg, 'error');
                    });
            }
        });
    };

    const handleEdit = () => {
        if (setTabValue) setTabValue(0);
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "ข้อมูลจะถูกลบและไม่สามารถกู้คืนได้",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบรายการ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#ef5350'
        }).then((result) => {
            if (result.isConfirmed) {
                // [3] เปลี่ยน Delete เป็น axios ด้วยเช่นกัน เพื่อป้องกันปัญหาเดียวกัน
                axios.post(route('repair.sale.cancel'), { job_id: JOB.job_id })
                    .then(() => {
                        Swal.fire({
                            title: 'ลบสำเร็จ',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            // ลบเสร็จย้ายไปหน้า Index หรือ Refresh
                            router.get(route('repair.sale.index'));
                        });
                    })
                    .catch((error) => {
                        const msg = error.response?.data?.message || 'ไม่สามารถลบรายการได้';
                        Swal.fire('Error', msg, 'error');
                    });
            }
        });
    };

    const isSubmitted = ['send', 'process', 'complete'].includes(JOB.status_mj);

    return (
        <Stack spacing={4} alignItems="center" sx={{ py: 2 }}>

            {/* Buttons */}
            {!isSubmitted && (
                <Stack Stack direction="row" spacing={2}>
                    <Button variant="contained" startIcon={<Send />} onClick={handleSubmit} sx={{ bgcolor: '#4285f4', px: 3, '&:hover': { bgcolor: '#3367d6' } }}>ส่งงาน</Button>
                    <Button variant="contained" startIcon={<Edit />} onClick={handleEdit} sx={{ bgcolor: '#fb8c00', px: 3, '&:hover': { bgcolor: '#f57c00' } }}>แก้ไข</Button>
                    <Button variant="contained" startIcon={<Delete />} onClick={handleDelete} sx={{ bgcolor: '#ef5350', px: 3, '&:hover': { bgcolor: '#e53935' } }}>ลบ</Button>
                </Stack>
            )}

            {/* Detail Card */}
            <Paper elevation={0} variant="outlined" sx={{ width: '100%', maxWidth: 1000, borderRadius: 2, overflow: 'hidden', borderColor: '#e0e0e0' }}>

                {/* Header */}
                <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 2, bgcolor: '#fafafa' }}>
                    <Typography variant="h6" fontWeight="bold" color="#333">
                        {JOB.job_id}
                    </Typography>

                    <Typography variant="h6" fontWeight="bold" color="#333">
                        {shopUnderSaleName}
                        {shopUnderSaleId && (
                            <span style={{ fontWeight: 'normal', marginLeft: 8, fontSize: '0.85em', color: '#666' }}>
                                ({shopUnderSaleId})
                            </span>
                        )}
                    </Typography>

                    <Chip label={JOB.status || 'active'} size="small" sx={{ bgcolor: '#b0bec5', color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }} />
                </Box>

                <TableContainer>
                    <Table sx={{ '& td': { borderBottom: '1px solid #f5f5f5', py: 1.5, px: 3 } }}>
                        <TableBody>
                            <InfoRow label="ศูนย์บริการ" value={serviceCenterDisplay} />
                            <InfoRow label="เบอร์โทรศัพท์" value={JOB.cust_phone || JOB.shop_under_sale_phone || '-'} />
                            <InfoRow label="ชื่อ-นามสกุลผู้ติดต่อ" value={JOB.cust_name || '-'} />
                            <InfoRow label="รูปแบบจัดส่ง" value={getDeliveryLabel(JOB.delivery_type)} />
                            <InfoRow label="ที่อยู่จัดส่ง" value={JOB.cust_address || JOB.address || '-'} />
                            <InfoRow label="หมายเหตุความต้องการลูกค้า" value={getRemarkText()} />

                            {/* แสดงข้อมูลใหม่ */}
                            <InfoRow label="อาการเบื้องต้น" value={symptomText} />
                            <InfoRow label="หมายเหตุอุปกรณ์อุปกรณ์เสริม" value={accessoryText} />
                            <InfoRow label="หมายเหตุสําหรับสื่อสารภายในศูนย์บริการ" value={internalRemarkText} />
                            <InfoRow
                                label="สภาพสินค้าก่อนซ่อม"
                                value={renderFilePreview(filesBefore)}
                                isLast
                            />
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Stack >
    );
}

// Components Helper
const InfoRow = ({ label, value, isLast }) => (
    <TableRow>
        {/* เพิ่ม pt: 2 เพื่อให้หัวข้อตรงกับเนื้อหาเวลามีรูปภาพ */}
        <TableCell sx={{ width: '30%', textAlign: 'right', fontWeight: 'bold', color: '#444', fontSize: '0.95rem', borderBottom: isLast ? 'none' : undefined, pt: 2 }}>
            {label}
        </TableCell>
        <TableCell sx={{ width: '70%', color: '#666', fontSize: '0.95rem', borderBottom: isLast ? 'none' : undefined }}>
            {value}
        </TableCell>
    </TableRow>
);