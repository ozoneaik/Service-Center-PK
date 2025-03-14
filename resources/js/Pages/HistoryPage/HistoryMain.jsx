import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head } from "@inertiajs/react";
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import {
    Button, Container, Grid2, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField
} from "@mui/material";
import { useState } from "react";
import { ListDetailModal } from "@/Pages/HistoryPage/ListDetailModal.jsx";

export default function HistoryMain({ jobs }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState();
    const handleShowDetail = (item) => {
        setSelected(item);
        setOpen(true);
    }
    return (
        <>
            {open && <ListDetailModal open={open} setOpen={setOpen} selected={selected} />}
            <AuthenticatedLayout>
                <Head title="ประวัติซ่อม" />
                <Container maxWidth='false' sx={{ backgroundColor: 'white', p: 3 }}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Stack direction='row' spacing={2}>
                                <TextField
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                    fullWidth label='ค้นหา ซีเรียล,รหัสจ็อบ หรือ เบอร์โทรศัพท์,ชื่อลูกค้า'
                                />
                                <Button variant='contained'>ค้นหา</Button>
                            </Stack>
                        </Grid2>
                        <Grid2 size={12} sx={{ display: 'flex', justifyContent: 'end' }}>
                            <Select
                                sx={{ minWidth: 300 }} labelId="demo-simple-select-label"
                                id="demo-simple-select" value={'select'} variant="filled"
                            >
                                <MenuItem disabled value={'select'}>เลือกสถานะการซ่อม</MenuItem>
                                <MenuItem value={'pending'}>กำลังกำเนินการซ่อม</MenuItem>
                                <MenuItem value={'success'}>ปิดการซ่อมปล้ว</MenuItem>
                            </Select>
                        </Grid2>
                        <Grid2 size={12}>
                            <Paper variant='outlined' sx={{ p: 2 }}>
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
                                                    <img src={job.image_sku} width={50} alt={'no image'} />
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
                        </Grid2>
                    </Grid2>


                </Container>
            </AuthenticatedLayout>
        </>
    )
}
