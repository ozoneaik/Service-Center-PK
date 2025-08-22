import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import InputAdornment from '@mui/material/InputAdornment';
import { Head, Link, usePage, router } from "@inertiajs/react";
import {
    Box, Button, Card, CardContent, Chip, Container, Divider, Drawer, Grid2, MenuItem, Pagination, Paper, Select,
    Stack, Table, TableBody, TableCell, TableRow, TableHead, TextField, Typography, useMediaQuery, useTheme
} from "@mui/material";
import { useState } from "react";
import { ListDetailModal } from "@/Pages/HistoryPage/ListDetailModal.jsx";
import { ChevronLeft, FilterList, ManageHistory, LocalPhone, Person, Search, Print } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { TableStyle } from "../../../css/TableStyle"

const statusLabels = {
    pending: 'กำลังดำเนินการซ่อม', success: 'ปิดการซ่อมแล้ว',
    canceled: 'ยกเลิกการซ่อมแล้ว', send: 'ส่งไปยังศูนย์ซ่อม PK'
};
const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex', alignItems: 'center',
    padding: theme.spacing(0, 1), ...theme.mixins.toolbar, justifyContent: 'flex-end',
}));


const statusColors = { pending: 'secondary', success: 'success', canceled: 'error', send: 'info' };
export const TableDetail = ({ jobs, handleShowDetail, url }) => {
    const { palette } = useTheme();
    const pumpkinColor = palette.pumpkinColor.main;
    const handelPrint = (job_id) => {
        window.open(route('genReCieveSpPdf', job_id), '_blank')
    }
    return (
        <Table stickyHeader>
            <TableHead>
                <TableRow>
                    {(url.startsWith("/admin/history-job")
                        ? ["รูปภาพ", "ซีเรียล", "รหัส job", "ศูนย์บริการ", "ข้อมูลลูกค้า", "ช่างที่ซ่อม", "สถานะ", "รายละเอียด"]
                        : ["รูปภาพ", "ซีเรียล", "รหัส job", "ข้อมูลลูกค้า", "ช่างที่ซ่อม", "สถานะ", "รายละเอียด"]
                    ).map((head, i) => (
                        <TableCell sx={TableStyle.TableHead} key={i}>{head}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {jobs.map((job, index) => (
                    <TableRow key={index}>
                        <TableCell><img src={job.image_sku} width={50} alt="no image" /></TableCell>
                        <TableCell>
                            <Link href={route('repair.index', { job_id: job.job_id })}>
                                {job.serial_id}
                            </Link>
                        </TableCell>
                        <TableCell>
                            {job.job_id}
                        </TableCell>
                        {url.startsWith("/admin/history-job") && (
                            <TableCell>
                                <b>รหัสร้านค้า :</b> <span style={{ color: pumpkinColor }}>{job.is_code_key}</span>
                                <br />
                                <b>ชื่อร้าน :</b> <span style={{ color: pumpkinColor }}>{job.shop_name}</span>
                            </TableCell>
                        )}
                        <TableCell>
                            <b>ชื่อ :</b> <span style={{ color: pumpkinColor }}>{job.name}</span><br />
                            <b>เบอร์โทร :</b> <span style={{ color: pumpkinColor }}>{job.phone}</span>
                        </TableCell>
                        <TableCell>
                            <b>ชื่อ :</b> <span style={{ color: pumpkinColor }}>{job.technician_name}</span><br />
                            <b>เบอร์โทร :</b> <span style={{ color: pumpkinColor }}>{job.technician_phone}</span>
                        </TableCell>
                        <TableCell>
                            <Chip label={statusLabels[job.status] || 'ไม่สามารถระบุสถานะได้'}
                                color={statusColors[job.status] || 'info'} />
                        </TableCell>
                        <TableCell >
                            <Box display='flex' flexWrap='nowrap' gap={2}>
                                <Button
                                    variant="contained" size="small" color="info"
                                    startIcon={<Print />} onClick={() => handelPrint(job.job_id)}
                                >
                                    พิมพ์ใบรับงานซ่อม
                                </Button>
                                <Button
                                    startIcon={<ManageHistory />}
                                    variant="contained" size="small"
                                    onClick={() => handleShowDetail(job)}
                                >
                                    ดูรายละเอียด
                                </Button>
                            </Box>

                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const FilterForm = ({ handleFilterChange, filters, searchJobs }) => {
    const isMobile = useMediaQuery('(max-width:700px)');
    return (
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
                                <LocalPhone />
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
                                <Person />
                            </InputAdornment>
                        }
                    }}
                />
            </Grid2>
            <Grid2 size={{ md: 4, xs: 12 }}>
                <Select
                    variant='outlined'
                    fullWidth={!isMobile} value={filters.status || 'select'}
                    onChange={handleFilterChange}
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
                <Button onClick={searchJobs} startIcon={<Search />}
                    variant='contained'>ค้นหา</Button>
            </Grid2>
        </Grid2>
    )
}


const MobileDetail = ({ jobs, handleShowDetail, url }) => {
    const { palette } = useTheme();
    const pumpkinColor = palette.pumpkinColor.main;
    const TextDetail = ({ label, value }) => (
        <Stack direction='row' spacing={1}>
            <Typography fontWeight='bold' color={pumpkinColor}>{label}</Typography>
            <Typography>:</Typography>
            {label === 'สถานะ' ? (
                <Chip label={statusLabels[value] || 'ไม่สามารถระบุสถานะได้'}
                    color={statusColors[value] || 'info'} />
            ) : (
                <Typography>{value}</Typography>
            )}

        </Stack>
    )

    const handelPrint = (job_id) => {
        window.open(route('genReCieveSpPdf', job_id), '_blank')
    }
    return (
        <Stack spacing={2}>
            {jobs.map((job, index) => {
                // ["รูปภาพ", "ซีเรียล", "รหัส job", "ศูนย์บริการ", "ข้อมูลลูกค้า", "สถานะ", "รายละเอียด"]
                return (
                    <Card variant='outlined' key={index}>
                        <CardContent>
                            <Stack spacing={1}>
                                <Link href={route('repair.index', { job_id: job.job_id })}>
                                    <TextDetail label='ซีเรียล' value={job.serial_id} />
                                </Link>
                                <TextDetail label='รหัส job' value={job.job_id} />
                                <TextDetail label='ชื่อ/เบอร์โทรลูกค้า' value={job.name + job.phone} />
                                {url.startsWith("/admin/history-job") && (
                                    <TextDetail label='ศูนย์บริการ' value={`(${job.is_code_key}) ` + job.shop_name} />
                                )}
                                <TextDetail label='สถานะ' value={job.status} />
                                <TextDetail label='ช่างที่ซ่อม' value={job.technician_name + `(${job.technician_phone})`} />
                                <Divider />
                                <Stack direction='row' justifyContent='space-between'>
                                    <Button
                                        variant="contained" size="small" color="info"
                                        startIcon={<Print />} onClick={() => handelPrint(job.job_id)}
                                    >
                                        พิมพ์ใบรับงานซ่อม
                                    </Button>
                                    <Button
                                        startIcon={<ManageHistory />}
                                        variant="contained" size="small"
                                        onClick={() => handleShowDetail(job)}
                                    >
                                        ดูรายละเอียด
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                )
            })}
        </Stack>
    )
}

export default function HistoryMain({ jobs }) {
    console.log(jobs);
    
    const { url } = usePage();
    const isMobile = useMediaQuery('(max-width:700px)');
    const [filters, setFilters] = useState({
        serial_id: "", job_id: "",
        phone: "", name: "",
        status: ""
    });

    const [openDrawer, setOpenDrawer] = useState(false);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };
    const searchJobs = () => {
        const routeName = url.startsWith("/admin/history-job") ? "admin.history-job" : "history.index";
        router.get(route(routeName), filters, { preserveState: true });
        setOpenDrawer(false);
    };
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState();
    const handleShowDetail = (item) => {
        setSelected(item);
        setOpen(true);
    }


    const DrawerList = (
        <Box sx={{ minWidth: 200, maxWidth: 300, p: 3 }} role="presentation">
            <FilterForm handleFilterChange={handleFilterChange} filters={filters} searchJobs={searchJobs} />
        </Box>

    )
    return (
        <>
            {open && <ListDetailModal open={open} setOpen={setOpen} selected={selected} />}
            <AuthenticatedLayout>
                <Head title="ประวัติซ่อม" />
                <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
                    <DrawerHeader>
                        <IconButton onClick={() => setOpenDrawer(false)}>
                            <ChevronLeft />
                        </IconButton>
                    </DrawerHeader>
                    {DrawerList}
                </Drawer>
                <Container maxWidth='false' sx={{ backgroundColor: 'white', p: 3 }}>
                    <Grid2 container spacing={2}>
                        {isMobile ? (
                            <Button variant='contained' onClick={() => setOpenDrawer(true)} startIcon={<FilterList />}>
                                กรองค้นหา
                            </Button>
                        ) : (
                            <Grid2 size={12}>
                                <FilterForm handleFilterChange={handleFilterChange} filters={filters}
                                    searchJobs={searchJobs} />
                            </Grid2>
                        )}

                        <Grid2 size={12}>
                            <Stack direction={{ sm: 'row', xs: 'column' }} justifyContent='space-between'
                                alignItems='center'>
                                <Typography variant='h5' fontWeight='bold'>ประวัติซ่อม</Typography>
                                <Typography
                                    variant="subtitle1">รายการ {jobs.to} จากรายการทั้งหมด {jobs.total} รายการ</Typography>
                            </Stack>
                        </Grid2>
                        <Grid2 size={12}>
                            {isMobile ? (
                                <MobileDetail url={url} jobs={jobs.data} handleShowDetail={handleShowDetail} />
                            ) : (
                                <Paper variant='outlined' sx={{ height: 'calc(100vh - 350px)', overflowX: 'auto' }}>
                                    <TableDetail url={url} jobs={jobs.data} handleShowDetail={handleShowDetail} />
                                </Paper>
                            )}

                            <Stack mt={3} direction='row' justifyContent='center'>
                                <Pagination
                                    count={jobs.links.length - 2}
                                    onChange={(e, page) => {
                                        const routeName = url.startsWith("/admin/history-job") ? "admin.history-job" : "history.index";
                                        router.get(route(routeName), { ...filters, page: page }, { preserveState: true });
                                    }} />
                            </Stack>
                        </Grid2>
                    </Grid2>
                </Container>
            </AuthenticatedLayout>
        </>
    )
}