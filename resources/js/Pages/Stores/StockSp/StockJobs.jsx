import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link, useForm, usePage} from "@inertiajs/react";
import {
    Alert, Button, Container, Grid2, InputAdornment, Paper, Stack,
    Table, TableBody, TableCell, TableHead, TableRow, TextField
} from "@mui/material";
import PasswordIcon from "@mui/icons-material/Password";
import {AlertDialogQuestion} from "@/Components/AlertDialog.js";
import {useState} from "react";
import {DateFormatTh} from "@/Components/DateFormat.jsx";


export default function StockJobs({jobs}) {
    const tableHeads = ['รหัส job', 'สร้างเมื่อ', 'จัดการ'];
    const {flash} = usePage().props
    const [alert, setAlert] = useState(false)
    const {post, delete: destroy} = useForm();
    const handleStoreJob = () => {
        AlertDialogQuestion({
            text: 'กด ตกลง เพื่อสร้าง job',
            onPassed: (confirm) => {
                confirm && post(route('stockJob.store'), {
                    onFinish: () => setAlert(true)
                })
            }
        })
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
    return (
        <AuthenticatedLayout>
            <Head title='ปรับปรุง stock'/>
            <Container maxWidth='false' sx={{backgroundColor: 'white', p: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                            <TextField
                                fullWidth size="small" label='ค้นหารหัสจ็อบ'
                                type="text" name="is_code_cust_id"
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">
                                            <PasswordIcon/>
                                        </InputAdornment>
                                    }
                                }}
                            />
                            <Button size='small' variant='contained' disabled>
                                ค้นหา
                            </Button>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row-reverse'>
                            <Button variant='contained' onClick={handleStoreJob}>
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
                        <Paper variant='outlined' sx={{p: 2, overflowX: 'auto'}}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {tableHeads.map((head, index) => (
                                            <TableCell sx={TABLE_HEADER_STYLE} key={index}>{head}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobs.length > 0 ? (
                                        jobs.map((job, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{job.stock_job_id}</TableCell>
                                                <TableCell>
                                                    <DateFormatTh date={job.created_at}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                                                        <Button
                                                            variant='contained' component={Link}
                                                            href={route('stockJob.addSp', {stock_job_id: job.stock_job_id})}
                                                            size='small'>
                                                            รายละเอียด
                                                        </Button>
                                                        <Button
                                                            variant='contained' size='small' color='error'
                                                            onClick={() => handleDelete(job.stock_job_id)}>
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
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}

const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};
