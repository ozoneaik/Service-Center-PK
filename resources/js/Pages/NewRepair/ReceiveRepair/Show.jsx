import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import {
    Box, Button, Chip, Paper, Stack, Typography,
    Table, TableBody, TableCell, TableContainer, TableRow
} from "@mui/material";
import { ArrowBack, CheckCircle, PlayCircleOutline } from "@mui/icons-material";
import Swal from "sweetalert2";
import axios from "axios";

// --- Components Helper ---
const InfoRow = ({ label, value, isLast }) => (
    <TableRow>
        <TableCell sx={{ width: '30%', textAlign: 'right', fontWeight: 'bold', color: '#444', fontSize: '0.95rem', borderBottom: isLast ? 'none' : undefined, verticalAlign: 'top', pt: 2 }}>
            {label}
        </TableCell>
        <TableCell sx={{ width: '70%', color: '#666', fontSize: '0.95rem', borderBottom: isLast ? 'none' : undefined }}>
            {value}
        </TableCell>
    </TableRow>
);

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hour}:${minute}`;
};

const renderFilePreview = (files) => {
    if (!files || files.length === 0) return '-';
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            {files.map((file) => (
                <Paper key={file.id} elevation={2} sx={{ width: 100, height: 100, borderRadius: 2, overflow: 'hidden', position: 'relative', bgcolor: '#eee' }}>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                        {file.is_video ? (
                            <>
                                <video src={file.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.3)', color: 'white' }}>
                                    <PlayCircleOutline sx={{ fontSize: 40 }} />
                                </Box>
                            </>
                        ) : (
                            <img src={file.url} alt="สภาพสินค้า" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }} />
                        )}
                    </a>
                </Paper>
            ))}
        </Box>
    );
};

const getDeliveryLabel = (type) => {
    const map = { 'shop': 'ส่งคืนร้านค้า', 'customer': 'ส่งถึงลูกค้า (ร้านค้า)', 'sale_self': 'เซลล์รับเอง' };
    return map[type] || type || '-';
};

export default function ReceiveRepairShow({ job }) {
    const { props } = usePage();

    // Logic รับงาน (เหมือนหน้า Index)
    const handleAcceptJob = () => {
        Swal.fire({
            title: 'ยืนยันการรับงาน?',
            text: `ต้องการรับงาน ${job.job_id} เข้าสู่กระบวนการซ่อมใช่หรือไม่`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'รับงาน',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#2e7d32',
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(route('repair.receive.accept'), { job_id: job.job_id })
                    .then((res) => {
                        Swal.fire('สำเร็จ', 'รับงานเรียบร้อยแล้ว', 'success').then(() => {
                            // รับงานเสร็จ กลับไปหน้า Index หรือ Refresh หน้านี้
                            router.visit(route('history.index'));
                        });
                    })
                    .catch((err) => {
                        Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถรับงานได้', 'error');
                    });
            }
        });
    };

    const isPendingReceive = job.status_mj === 'send'; // สถานะที่กดรับได้

    return (
        <AuthenticatedLayout>
            <Head title={`รายละเอียดงานซ่อม ${job.job_id}`} />

            <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: '1000px', mx: 'auto' }}>

                {/* Header & Actions */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Button startIcon={<ArrowBack />} onClick={() => window.history.back()}>
                        ย้อนกลับ
                    </Button>
                    {isPendingReceive && (
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            startIcon={<CheckCircle />}
                            onClick={handleAcceptJob}
                        >
                            รับงาน
                        </Button>
                    )}
                </Stack>

                {/* Detail Card (Copy Style from RpSummaryForm) */}
                <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: '#e0e0e0' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 2, bgcolor: '#fafafa' }}>
                        <Typography variant="h6" fontWeight="bold" color="#333">
                            เลขที่เอกสาร: <span style={{ color: '#1976d2' }}>{job.job_id}</span>
                            <Chip
                            label={job.status_mj}
                            size="small"
                            color={isPendingReceive ? "warning" : "info"}
                            sx={{ fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 2 }}
                        />
                        </Typography>
                        {/* <Typography variant="h6" fontWeight="bold" color="#333">
                            {job.shop_under_sale || '-'}
                            {job.shop_under_sale_id && (
                                <span style={{ fontWeight: 'normal', marginLeft: 8, fontSize: '0.85em', color: '#666' }}>
                                    ({job.shop_under_sale_id})
                                </span>
                            )}
                        </Typography> */}
                        {/* <Chip
                            label={job.status_mj}
                            size="small"
                            color={isPendingReceive ? "warning" : "info"}
                            sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                        /> */}
                    </Box>

                    <TableContainer>
                        <Table sx={{ '& td': { borderBottom: '1px solid #f5f5f5', py: 1.5, px: 3 } }}>
                            <TableBody>
                                <InfoRow label="วันที่แจ้งซ่อม" value={formatDate(job.created_at)} />
                                <InfoRow label="ผู้แจ้ง (Sale)" value={job.sale_name || '-'} />
                                <InfoRow label="ศูนย์บริการ" value={`${job.is_code_cust_id || '-'} : ${job.service_center_name || ''}`} />
                                <InfoRow label="สินค้า" value={`${job.pid} - ${job.p_name}`} />
                                <InfoRow label="S/N" value={job.serial_id} />
                                <InfoRow label="เบอร์โทรศัพท์" value={job.cust_phone || job.shop_under_sale_phone || '-'} />
                                <InfoRow label="ชื่อ-นามสกุลผู้ติดต่อ" value={job.cust_name || '-'} />
                                <InfoRow label="รูปแบบจัดส่ง" value={getDeliveryLabel(job.delivery_type)} />
                                <InfoRow label="ที่อยู่จัดส่ง" value={job.cust_address || job.address || '-'} />

                                <InfoRow label="อาการเบื้องต้น" value={job.symptom || '-'} />
                                <InfoRow label="หมายเหตุอุปกรณ์" value={job.accessory_note || '-'} />
                                <InfoRow label="หมายเหตุภายใน" value={job.internal_remark || '-'} />
                                <InfoRow label="หมายเหตุเพิ่มเติม" value={job.cust_remark || '-'} />

                                <InfoRow
                                    label="สภาพสินค้าก่อนซ่อม"
                                    value={renderFilePreview(job.files_before)}
                                    isLast
                                />
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}