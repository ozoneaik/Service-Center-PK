import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link} from "@inertiajs/react";
import {
    Button,
    Card, Chip,
    Grid2,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import DescriptionIcon from '@mui/icons-material/Description';
import {useState} from "react";
import ModalDetailSendJob from "@/Pages/SendJobs/ModalDetailSendJob.jsx";

export default function DocSendJobs({groups}) {
    const [open, setOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState();
    console.log(groups)
    return (
        <>
            {open && <ModalDetailSendJob open={open} setOpen={setOpen} job_group={selectedGroup}/>}
            <AuthenticatedLayout>
                <Head title={'ทำใบ'}/>
                <Paper sx={{bgcolor: 'white', p: 3}}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Typography variant='h6'>ทำใบ PK</Typography>
                        </Grid2>
                        <Grid2 size={12}>
                            <Card variant='outlined'>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={TABLE_HEADER_STYLE}>
                                            {['ลำดับ', 'เลข job', 'ปริ้นครั้งแรก', 'ปริ้นครั้งล่าสุด', 'จัดการ'].map((item, index) => (
                                                <TableCell key={index}>{item}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {groups.map((group, index) => {
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip variant='filled' label={group.group_job}
                                                              color='secondary'/>
                                                    </TableCell>
                                                    <TableCell>{group.print_at || 'ไม่มีข้อมูล'}</TableCell>
                                                    <TableCell>{group.print_updated_at || 'ไม่มีข้อมูล'}</TableCell>
                                                    <TableCell>
                                                        <Stack direction='row' spacing={2}>
                                                            <Button size='small' variant='contained'
                                                                    startIcon={<DescriptionIcon/>}
                                                                    onClick={() => {
                                                                        setSelectedGroup(group.group_job)
                                                                        setOpen(true)
                                                                    }}
                                                            >
                                                                รายละเอียด
                                                            </Button>
                                                            <Button size='small' color='secondary' variant='contained'
                                                                    startIcon={<LocalPrintshopIcon/>}
                                                                    component="a" // ใช้ <a> แทน <Link>
                                                                    target="_blank"
                                                                    rel="noopener noreferrer" // ป้องกัน security issue
                                                                    href={route('sendJobs.printJobList', { job_group: group.group_job })}
                                                            >
                                                                พิมพ์ (จำนวนการพิมพ์ {group.counter_print} ครั้ง)
                                                            </Button>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </Card>
                        </Grid2>
                    </Grid2>
                </Paper>

            </AuthenticatedLayout>
        </>
    )
}

const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};

