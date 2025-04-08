import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link, usePage} from "@inertiajs/react";
import {
    Button, Grid2, Paper, Stack, Typography, useTheme,
    Table, TableBody, TableCell, TableHead, TableRow, Chip, Alert,
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import {DateFormatTh} from "@/Components/DateFormat.jsx";
import {useEffect, useState} from "react";

const SubDetail = ({label, value}) => {
    const theme = useTheme();
    const pumpkinColor = theme.palette.pumpkinColor.main;
    return (
        <Stack direction='row' spacing={1}>
            <Typography variant='body2' fontWeight='bold'>{label} :</Typography>
            <Typography variant='body2' color={pumpkinColor}>{value}</Typography>
        </Stack>
    )
}


const DetailComponent = ({job}) => (
    <Stack direction='row' spacing={3} alignItems='center'>
        <img src={job.image_sku} width={100} alt="ไม่พบรูป"/>
        <Stack direction='column' spacing={1}>
            <SubDetail label={'S/N'} value={job.serial_id}/>
            <SubDetail label={'รหัสสินค้า'} value={job.pid}/>
            <SubDetail label={'ชื่อสินค้า'} value={job.p_name}/>
            <SubDetail label={'ศูนย์ซ่อมที่ส่งเข้ามา'} value={job.shop_name}/>
        </Stack>
    </Stack>
)

export default function JobFromServiceList({jobList}) {
    console.log(jobList)
    const [showAlert, setShowAlert] = useState(false);
    const {flash} = usePage().props;
    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowAlert(true)
        }
    }, [flash]);
    return (
        <AuthenticatedLayout>
            <Head title={'รายการจ็อบที่ส่งมายัง Pumpkin'}/>
            <Paper variant='outlined' sx={{padding: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between'>
                            <Typography variant='h6' fontWeight='bold'>รายการจ็อบที่ส่งมายัง Pumpkin</Typography>
                            <Typography variant='body2'>รายการทั้งหมด {jobList.length} รายการ</Typography>
                        </Stack>
                    </Grid2>
                    {showAlert && (
                        <Grid2 size={12}>
                            <Alert severity={flash?.success ? 'success' : 'error'} onClose={() => setShowAlert(false)}>
                                {flash.success || flash.error}
                            </Alert>
                        </Grid2>
                    )}
                    <Grid2 size={12}>
                        <Paper variant='outlined' sx={{width: '100%', height: '80dvh', overflow: 'auto'}}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={TABLE_HEADER_STYLE}>หมายเลข job</TableCell>
                                        <TableCell sx={TABLE_HEADER_STYLE}>ข้อมูลเบื้องต้น</TableCell>
                                        <TableCell sx={TABLE_HEADER_STYLE}>ส่งซ่อมเมื่อ</TableCell>
                                        <TableCell sx={TABLE_HEADER_STYLE}>รายละเอียด</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobList.length > 0 ? (
                                        jobList.map((job, index) => (
                                            <TableRow key={index} sx={{
                                                '&:hover': {
                                                    backgroundColor: '#ffdbd4',
                                                },
                                            }}>
                                                <TableCell>{job.job_id}</TableCell>
                                                <TableCell>
                                                    <DetailComponent job={job}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction='column' spacing={2}>
                                                        <Typography variant='body2'>
                                                            job ถูกสร้างเมื่อ : <DateFormatTh date={job.created_at}/>
                                                        </Typography>
                                                        <Typography variant='body2'>
                                                            ส่งมาเมื่อ : <DateFormatTh date={job.updated_at}/>
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        component={Link}
                                                        href={route('JobFormService.detail', {job_id: job.job_id})}
                                                        startIcon={<SettingsIcon/>} size='small' variant='contained'>
                                                        จัดการ
                                                    </Button>

                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3}>ไม่มีรายการ</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid2>
                </Grid2>
            </Paper>
        </AuthenticatedLayout>
    )
}

const TABLE_HEADER_STYLE = {backgroundColor: '#c7c7c7', fontWeight: 'bold', fontSize: 16};
