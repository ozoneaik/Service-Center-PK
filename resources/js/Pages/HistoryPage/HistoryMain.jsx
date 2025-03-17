import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import InputAdornment from '@mui/material/InputAdornment';
import { Head } from "@inertiajs/react";
import SearchIcon from '@mui/icons-material/Search';
import {
    Button, Chip, Container, Grid2, MenuItem, Paper, Select,
    Stack,
    Table, TableBody, TableCell, TableHead, TableRow, TextField,
    Typography
} from "@mui/material";
import { useState } from "react";
import { ListDetailModal } from "@/Pages/HistoryPage/ListDetailModal.jsx";
import { router } from "@inertiajs/react";
import PersonIcon from '@mui/icons-material/Person';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';

export const TableDetail = ({ jobs, handleShowDetail }) => {
    const statusLabels = { pending: 'กำลังดำเนินการซ่อม', success: 'ปิดการซ่อมแล้ว', canceled: 'ยกเลิกการซ่อมแล้ว' };
    const statusColors = { pending: 'secondary', success: 'success', canceled: 'error' };
    return (
        <Table>
            <TableHead>
                <TableRow sx={TABLE_HEADER_STYLE}>
                    {["รูปภาพ", "ซีเรียล", "รหัส job", "ข้อมูลลูกค้า", "สถานะ", "รายละเอียด"].map((head, i) => (
                        <TableCell key={i}>{head}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {jobs.map((job, index) => (
                    <TableRow key={index}>
                        <TableCell><img src={job.image_sku} width={50} alt="no image" /></TableCell>
                        <TableCell>{job.serial_id}</TableCell>
                        <TableCell>{job.job_id}</TableCell>
                        <TableCell>
                            <b>ชื่อ :</b> <span style={{ color: '#f15922' }}>{job.name}</span><br />
                            <b>เบอร์โทร :</b> <span style={{ color: '#f15922' }}>{job.phone}</span>
                        </TableCell>
                        <TableCell>
                            <Chip label={statusLabels[job.status] || 'ไม่สามารถระบุสถานะได้'} color={statusColors[job.status] || 'info'} />
                        </TableCell>
                        <TableCell>
                            <Button
                                startIcon={<ManageHistoryIcon />}
                                variant="contained" size="small"
                                onClick={() => handleShowDetail(job)}
                            >
                                ดูรายละเอียด
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default function HistoryMain({ jobs }) {
    const [filters, setFilters] = useState({
        serial_id: "",
        job_id: "",
        phone: "",
        name: "",
        status: "",
    });
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };
    const searchJobs = () => {
        router.get(route("history.index"), filters, { preserveState: true });
    };
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
                            <Grid2 container spacing={2}>
                                <Grid2 size={{ md: 4, xs: 12 }}>
                                    <TextField
                                        fullWidth size="small" label='ค้นหา Serial ID'
                                        type="text" name="serial_id" value={filters.serial_id}
                                        onChange={handleFilterChange}
                                        slotProps={{
                                            input: {
                                                startAdornment: <InputAdornment position="start">Sn</InputAdornment>
                                            }
                                        }}
                                    />
                                </Grid2>
                                <Grid2 size={{ md: 4, xs: 12 }}>
                                    <TextField
                                        fullWidth value={filters.job_id} name="job_id"
                                        label='ค้นหา Job ID' size="small" type="text"
                                        onChange={handleFilterChange}
                                        slotProps={{
                                            input: {
                                                startAdornment: <InputAdornment position="start">Job ID</InputAdornment>
                                            }
                                        }}
                                    />
                                </Grid2>
                                <Grid2 size={{ md: 4, xs: 12 }}>
                                    <TextField
                                        fullWidth label='ค้นหาเบอร์โทรศัพท์' size="small"
                                        type="text" name="phone" value={filters.phone}
                                        onChange={handleFilterChange}
                                        slotProps={{
                                            input: {
                                                startAdornment: <InputAdornment position="start">
                                                    <LocalPhoneIcon />
                                                </InputAdornment>
                                            }
                                        }}
                                    />
                                </Grid2>
                                <Grid2 size={{ md: 4, xs: 12 }}>
                                    <TextField
                                        fullWidth label='ค้นหาชื่อลูกค้า' size="small"
                                        type="text" name="name" value={filters.name}
                                        onChange={handleFilterChange}
                                        slotProps={{
                                            input: {
                                                startAdornment: <InputAdornment position="start">
                                                    <PersonIcon />
                                                </InputAdornment>
                                            }
                                        }}
                                    />
                                </Grid2>
                                <Grid2 size={{ md: 4, xs: 12 }}>
                                    <Select
                                        fullWidth value={filters.status || 'select'}
                                        onChange={handleFilterChange}
                                        sx={{ minWidth: 300 }}
                                        name="status" size="small"
                                    >
                                        <MenuItem disabled value={'select'}>เลือกสถานะการซ่อม</MenuItem>
                                        <MenuItem value={''}>ทั้งหมด</MenuItem>
                                        <MenuItem value={'pending'}>กำลังดำเนินการซ่อม</MenuItem>
                                        <MenuItem value={'success'}>ปิดการซ่อมแล้ว</MenuItem>
                                        <MenuItem value={'canceled'}>ยกเลิกการซ่อมแล้ว</MenuItem>
                                    </Select>
                                </Grid2>
                                <Grid2 size={{ md: 4, xs: 12 }}>
                                    <Button onClick={searchJobs} startIcon={<SearchIcon />} variant='contained'>ค้นหา</Button>
                                </Grid2>
                            </Grid2>
                        </Grid2>
                        <Grid2 size={12}>
                            <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <Typography variant='h5' fontWeight='bold'>ประวัติซ่อม</Typography>
                            <Typography variant="subtitle1">รายการทั้งหมด {jobs.length} รายการ</Typography>
                            </Stack>
                        </Grid2>
                        <Grid2 size={12}>
                            <Paper variant='outlined' sx={{ p: 2,overflowX : 'auto' }}>
                                <TableDetail jobs={jobs} handleShowDetail={handleShowDetail} />
                            </Paper>
                        </Grid2>
                    </Grid2>
                </Container>
            </AuthenticatedLayout>
        </>
    )
        
    
}
const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};