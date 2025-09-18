import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link, router, useForm, usePage} from "@inertiajs/react";
import {
    Alert, Button, Card, CardContent, Container, Grid2, InputAdornment, MenuItem, Paper, Select, Stack,
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useMediaQuery
} from "@mui/material";
import PasswordIcon from "@mui/icons-material/Password";
import {AlertDialogQuestion} from "@/Components/AlertDialog.js";
import {useState} from "react";
import {DateFormatTh} from "@/Components/DateFormat.jsx";
import {Add, ClearAll, Search} from "@mui/icons-material";
import {TableStyle} from "../../../../css/TableStyle.js";

export default function StockJobs({jobs}) {
    const {flash, auth} = usePage().props
    const [alert, setAlert] = useState(false)
    const {post, delete: destroy} = useForm();
    const isMobile = useMediaQuery('(max-width:600px)');
    const [searchJob, setSearchJob] = useState('');
    const [searchJobStatus, setSearchJobStatus] = useState('');
    const handleStoreJob = () => {
        router.get(route('stockJob.create',{is_code_cust_id : auth.user.is_code_cust_id}));
    }

    const handleDelete = (stock_job_id) => {
        AlertDialogQuestion({
            text: 'กด ตกลง เพื่อลบ JOB',
            onPassed: (confirm) => {
                confirm && destroy(route('stockJob.delete', {stock_job_id: stock_job_id}), {
                    onFinish: () => setAlert(true)
                })
            }
        })
    }

    const handleChangeFilter = (e) => {
        const {name, value} = e.target;
        console.log(name, value)
        if (name === 'searchJob') {
            setSearchJob(value);
        } else {
            setSearchJobStatus(value)
        }
    }

    const handleSearchFilter = (clear = false) => {
        if (clear) {
            router.get(route('stockJob.index'));
        } else {
            router.get(route('stockJob.index', {searchJob, searchJobStatus}), {}, {preserveState: true, replace: true});
        }
    };
    return (
        <AuthenticatedLayout>
            <Head title='ปรับปรุง stock'/>
            <Container maxWidth='false' sx={{backgroundColor: 'white', p: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                            <TextField
                                fullWidth size="small" label='ค้นหารหัสจ็อบ'
                                type="text" name="searchJob"
                                onChange={handleChangeFilter} value={searchJob}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">
                                            <PasswordIcon/>
                                        </InputAdornment>
                                    }
                                }}
                            />
                            <Select
                                name='searchJobStatus'
                                onChange={handleChangeFilter} variant='outlined' fullWidth
                                value={searchJobStatus} size='small'
                            >
                                <MenuItem value='' disabled>เลือก</MenuItem>
                                <MenuItem value='success'>success</MenuItem>
                                <MenuItem value='processing'>processing</MenuItem>
                            </Select>
                            <Button
                                sx={{minWidth: 100}} size='small'
                                variant='contained' startIcon={<Search/>}
                                onClick={() => handleSearchFilter(false)}
                            >
                                ค้นหา
                            </Button>
                            <Button
                                sx={{minWidth: 150}} size='small' color='secondary'
                                variant='contained' startIcon={<ClearAll/>}
                                onClick={() => handleSearchFilter(true)}
                            >
                                ล้างการค้นหา
                            </Button>
                            <Button sx={{minWidth: 150}} variant='contained' startIcon={<Add/>}
                                    onClick={handleStoreJob}>
                                สร้าง jobs
                            </Button>
                        </Stack>
                    </Grid2>
                    {flash.success && alert && (
                        <Grid2 size={12}>
                            <Alert sx={{fontWeight: 'bold'}} onClose={() => {
                                setAlert(false)
                            }}>
                                {flash.success}
                            </Alert>
                        </Grid2>
                    )}

                    <Grid2 size={12}>
                        {isMobile ? (
                            <Stack spacing={1}>
                                {jobs.length > 0 && jobs.map((job, index) => {
                                    return (
                                        <Card key={index} variant='outlined'>
                                            <CardContent>
                                                <Stack spacing={1}>
                                                    <Typography>รหัสจ็อบ : {job.stock_job_id}</Typography>
                                                    <Typography>
                                                        สถานะ : {job.job_status}
                                                    </Typography>
                                                    <Typography>
                                                        จำนวนอะไหล่ทั้งหมด : {job.total_qty}
                                                    </Typography>
                                                    <Typography>
                                                        สร้างเมื่อ : <DateFormatTh date={job.created_at}/>
                                                    </Typography>
                                                    <Typography>
                                                        ปิดจ็อบเมื่อ : <DateFormatTh date={job.closeJobAt}/>
                                                    </Typography>
                                                    <Stack direction='row' spacing={2}>
                                                        <Button
                                                            fullWidth
                                                            variant='contained' component={Link}
                                                            href={route('stockJob.addSp', {stock_job_id: job.stock_job_id})}
                                                            size='small'>
                                                            รายละเอียด
                                                        </Button>
                                                        <Button
                                                            fullWidth
                                                            variant='contained' size='small' color='error'
                                                            onClick={() => handleDelete(job.stock_job_id)}>
                                                            ลบ
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </Stack>
                        ) : (

                            <Paper variant='outlined' sx={{p: 2, overflowX: 'auto'}}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={TableStyle.TableHead}>
                                            <TableCell>สถานะ</TableCell>
                                            <TableCell>รหัส job</TableCell>
                                            <TableCell>ประเภท</TableCell>
                                            <TableCell>จำนวนรายการ</TableCell>
                                            <TableCell>วันที่เวลาสร้าง</TableCell>
                                            <TableCell>ชื่อผู้สร้าง</TableCell>
                                            <TableCell>#</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {jobs.length > 0 ? (
                                            jobs.map((job, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{job.stock_job_id}</TableCell>
                                                    <TableCell>{job.stock_job_id}</TableCell>
                                                    <TableCell>
                                                        {job.job_status}
                                                    </TableCell>
                                                    <TableCell align='center'>
                                                        {job.total_qty}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DateFormatTh date={job.created_at}/>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DateFormatTh date={job.closeJobAt}/>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack spacing={2} direction='row' justifyContent='center'>
                                                            <Button
                                                                variant='contained' component={Link} size='small'
                                                                href={route('stockJob.addSp', {stock_job_id: job.stock_job_id})}
                                                            >
                                                                รายละเอียด
                                                            </Button>
                                                            <Button
                                                                variant='contained' size='small' color='error'
                                                                onClick={() => handleDelete(job.stock_job_id)}
                                                            >
                                                                ลบ
                                                            </Button>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3}>ไม่มีรายการ Job</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Paper>
                        )}

                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
