import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {
    Button, Container, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField
} from "@mui/material";
import {useState} from "react";
import {ListDetailModal} from "@/Pages/HistoryPage/ListDetailModal.jsx";

export default function HistoryMain({jobs}) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState();
    const handleShowDetail = (item) => {
        setSelected(item);
        setOpen(true);
    }
    return (
        <>
            {open && <ListDetailModal open={open} setOpen={setOpen} selected={selected}/>}
            <AuthenticatedLayout>
                <Head title="ประวัติซ่อม"/>
                <Container maxWidth='false'>
                    <div className={'mt-4 p-4'}>
                        <Stack direction='row' spacing={2} mb={3}>
                            <TextField
                                fullWidth size='small'
                            />
                            <Button variant='contained'>ค้นหา</Button>
                        </Stack>
                        <Paper variant='outlined' sx={{p: 2}}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>รูปภาพ</TableCell>
                                        <TableCell>ซีเรียล</TableCell>
                                        <TableCell>รหัส job</TableCell>
                                        <TableCell>รายละเอียด</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobs.map((job, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <img src={job.image_sku} width={50} alt={'no image'}/>
                                            </TableCell>
                                            <TableCell>{job.serial_id}</TableCell>
                                            <TableCell>{job.job_id}</TableCell>
                                            <TableCell>
                                                <Button variant='contained' size='small'
                                                        onClick={() => handleShowDetail(job)}>
                                                    ดู
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>

                    </div>

                </Container>
            </AuthenticatedLayout>
        </>
    )
}
