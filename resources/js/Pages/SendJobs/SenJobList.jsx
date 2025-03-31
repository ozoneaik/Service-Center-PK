import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, useForm, usePage} from "@inertiajs/react";
import {
    Button, Card, Grid2, Paper, Stack, Typography,
    Table, TableBody, TableCell, TableHead, TableRow, Alert,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import {useState} from "react";

const tableHeads = ['รหัสจ็อบ', 'ข้อมูลเบื้องต้น', 'สร้างเมื่อ'];

export default function SenJobList({jobs}) {
    const { data, setData, post, processing, errors } = useForm({
        selectedJobs: []
    });
    const [showAlert, setShowAlert] = useState(false);
    const {flash} = usePage().props;
    const handleSelectJob = (job, index, e) => {
        const checked = e.target.checked;

        if (checked) {
            // เพิ่ม job ที่เลือก
            setData(prevData => {
                const isAlreadySelected = prevData.selectedJobs.some(selectedJob => selectedJob.job_id === job.job_id);
                return {
                    ...prevData,
                    selectedJobs: isAlreadySelected
                        ? prevData.selectedJobs
                        : [...prevData.selectedJobs, job]
                };
            });
        } else {
            // ลบ job ที่ยกเลิกการเลือก
            setData(prevData => ({
                ...prevData,
                selectedJobs: prevData.selectedJobs.filter(selectedJob => selectedJob.job_id !== job.job_id)
            }));
        }
    }

    const handleCloseJobs = () => {
        if (data.selectedJobs.length === 0) {
            alert('กรุณาเลือกรายการที่ต้องการปิดงาน');
            return;
        }

        // ส่งข้อมูลไปยัง route ปิดงาน
        post(route('sendJobs.update'), {
            onFinish : () => {
                setShowAlert(true)
                setData('selectedJobs',[]);
            }
        });
    }

    const isSelected = (jobId) => data.selectedJobs.some(job => job.job_id === jobId);

    return (
        <AuthenticatedLayout>
            <Head title='ส่ง job'/>
            <Paper sx={{bgcolor: 'white', p: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <Typography variant='h6'>ส่งซ่อมพิมคินฯ</Typography>
                            <Typography variant='body1'>รายการทั้งหมด {jobs.length} รายการ</Typography>
                        </Stack>

                    </Grid2>
                    {showAlert && flash.success && (
                        <Grid2 size={12}>
                            <Alert onClose={()=>setShowAlert(false)} variant='filled' severity='success'>{flash.success}</Alert>
                        </Grid2>
                    )}
                    {showAlert && flash.error && (
                        <Grid2 size={12}>
                            <Alert onClose={()=>setShowAlert(false)} variant='filled' severity='error'>{flash.error}</Alert>
                        </Grid2>
                    )}
                    <Grid2 size={12}>
                        <Card variant='outlined'>
                            <Table>
                                <TableHead>
                                    <TableRow sx={TABLE_HEADER_STYLE}>
                                        <TableCell>
                                            <Checkbox
                                                checked={data.selectedJobs.length === jobs.length}
                                                indeterminate={data.selectedJobs.length > 0 && data.selectedJobs.length < jobs.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        // เลือกทั้งหมด
                                                        setData('selectedJobs', jobs);
                                                    } else {
                                                        // ยกเลิกการเลือกทั้งหมด
                                                        setData('selectedJobs', []);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        {tableHeads.map((item, index) => (
                                            <TableCell key={index}>{item}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobs.map((job, index) => {
                                        const isJobSelected = isSelected(job.job_id);
                                        return (
                                            <TableRow
                                                key={index}
                                                sx={{
                                                    backgroundColor: isJobSelected ? '#f0f0f0' : 'inherit',
                                                    transition: 'background-color 0.3s ease'
                                                }}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={isJobSelected}
                                                        onClick={(e) => handleSelectJob(job, index, e)}
                                                    />
                                                </TableCell>
                                                <TableCell>{job.job_id}</TableCell>
                                                <TableCell>
                                                    หมายเลขซีเรียล : {job.serial_id}
                                                    <br/>
                                                    รหัสสินค้า : {job.pid}
                                                    <br/>
                                                    ชื่อสินค้า : {job.p_name}
                                                </TableCell>
                                                <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row-reverse'>
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={handleCloseJobs}
                                disabled={data.selectedJobs.length === 0 || processing}
                            >
                                ส่งไปยัง PK ({data.selectedJobs.length})
                            </Button>
                        </Stack>
                    </Grid2>
                </Grid2>
            </Paper>
        </AuthenticatedLayout>
    )
}

const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};
