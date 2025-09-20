import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router } from "@inertiajs/react";
import {
    Box, Button, Card, CardContent, Chip, Container, Divider, Grid2, Stack, Step,
    StepLabel, Stepper, Typography, useMediaQuery
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import React from "react";

const steps = [
    'กำลังตรวจสอบเอกสารเคลม',
    'อนุมัติคำสั่งส่งเคลม',
    'กำลังจัดเตรียมสินค้า',
    'อยู่ระหว่างจัดส่ง',
    'จัดส่งสำเร็จ'
];

export default function HistoryClaimNewDetail({ list, claim_id, claim }) {
    const isMobile = useMediaQuery('(max-width:600px)');
    console.log(list);

    const handleError = (e) => {
        e.target.src = defaultImage;
    }

    return (
        <AuthenticatedLayout>
            <Head title={`รายละเอียดเอกสารเคลม ${claim_id}`} />
            <Container maxWidth='false' sx={{ bgcolor: 'white', p: 2 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <Stack direction='row' spacing={1} alignItems='center'>
                                <Button
                                    size='small' color='primary' variant='outlined'
                                    onClick={() => router.get(route('spareClaim.history'))}
                                >
                                    <ArrowBack />
                                </Button>
                                <Typography fontWeight='bold' fontSize={20}>เอกสารเคลม {claim_id}</Typography>
                            </Stack>
                            <StatusClaim status={claim.status} />

                        </Stack>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stepper activeStep={0} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Grid2>
                    <Grid2 size={12}>
                        <Typography>รายการอะไหล่ {list.length} รายการ</Typography>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack spacing={2}>
                            {list.map((item, index) => {
                                const spImage = import.meta.env.VITE_IMAGE_SP + item.sp_code + '.jpg';
                                const defaultImage = import.meta.env.VITE_IMAGE_PID;
                                return (
                                    <Card key={index} variant='outlined'>
                                        <CardContent>
                                            <Stack direction={isMobile ? 'column' : 'row'} justifyContent='start'
                                                spacing={2}>
                                                <Box width={80} height={80}>
                                                    <img width='100%' height='100%' src={spImage} onError={handleError} />
                                                    {item.id}
                                                </Box>
                                                <Stack spacing={1} width='100%'>
                                                    <Box sx={detailBoxStyle}>
                                                        <Typography variant="subtitle2"
                                                            sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                                            รหัส/ชื่ออะไหล่
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                            {item.sp_code} {item.sp_name}
                                                        </Typography>
                                                    </Box>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Box sx={detailBoxStyle}>
                                                        <Typography variant="subtitle2"
                                                            sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                                            job แจ้งซ่อม เลขที่
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                            {item.job_id}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={detailBoxStyle}>
                                                        <Typography variant="subtitle2"
                                                            sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                                            ประเภทการเคลม
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                            {item.claim_remark || item.remark_noclaim || 'เคลมปกติ'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={detailBoxStyle}>
                                                        <Typography variant="subtitle2"
                                                            sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                                            จำนวน
                                                        </Typography>
                                                        <Chip
                                                            color='primary' label={item.qty + ' ' + item.unit}
                                                            variant="body2" sx={{ fontWeight: 'bold' }} size="small"
                                                        />
                                                    </Box>
                                                </Stack>
                                            </Stack>

                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </Stack>
                    </Grid2>
                </Grid2>

            </Container>

        </AuthenticatedLayout>
    )
}

const StatusClaim = ({ status }) => {
    const status_formated = {
        'pending': { status: 'secondary', label: 'กำลังตรวจสอบคำขอเคลม' },
        'approved': { status: 'success', label: 'เสร็จสิ้น' },
        'rejected': { status: 'error', label: 'ไม่อนุมัติ' },
    }[status] || { status: 'info', label: 'ไม่สามารถระบุได้' };
    return (
        <Chip
            size='small'
            color={status_formated.status}
            label={status_formated.label}
        />
    )
}

const detailBoxStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
}
