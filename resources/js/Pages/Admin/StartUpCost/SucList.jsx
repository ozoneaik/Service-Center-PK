import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, Link, router, usePage } from "@inertiajs/react"
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Grid2,
    Pagination,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {useEffect, useState} from "react"
import {Delete, Edit, Paid, EditCalendar, CalendarMonth, AddBox} from '@mui/icons-material';
import {DateFormatTh} from "@/Components/DateFormat";
import FilterSuc from "./FilterSuc";
import {AlertDialogQuestion} from "@/Components/AlertDialog";
import {TableStyle} from "../../../../css/TableStyle.js";

const imageNotFound = 'https://images.dcpumpkin.com/images/product/500/default.jpg';
const DateDetail = ({created_at, updated_at}) => (
    <Stack direction='column' spacing={2}>
        <Stack direction='row' spacing={1} alignItems='center'>
            <CalendarMonth/>
            <Typography variant="body2">
                <DateFormatTh date={created_at}/>
            </Typography>
        </Stack>
        <Stack direction='row' spacing={1} alignItems='center'>
            <EditCalendar/>
            <Typography variant="body2">
                <DateFormatTh date={updated_at}/>
            </Typography>
        </Stack>
    </Stack>
)

export default function SucList({StartUpCosts}) {
    const [startUpCosts, setStartUpCosts] = useState(StartUpCosts);
    const {flash} = usePage().props;
    const [showAlert, setShowAlert] = useState(false);
    const user = usePage().props.auth.user;
    console.log(user)
    useEffect(() => {
        setShowAlert(true);
    }, [flash])
    const handleSearch = (sku_code, sku_name) => {
        if (route().current('startUpCost.index')) {
            router.get(route('startUpCost.index'), {sku_code, sku_name, page: 1});
        } else {
            router.get(route('report.start-up-cost.index'), {sku_code, sku_name, page: 1});
        }
    }

    const handleDelete = (item) => {
        AlertDialogQuestion({
            title: `ลบข้อมูล ${item.sku_code}`,
            text: `กด ตกลง เพื่อยืนยันการลบ <br/> รหัสสินค้า ${item.sku_code} ${item.sku_name} <br/> ออกจากระบบอย่างถาวร`,
            onPassed: (confirm) => {
                confirm && router.delete(route('startUpCost.delete', {id: item.id}))
            }
        })
    }
    return (
        <AuthenticatedLayout>
            <Head title="รายการค่าเปิดเครื่อง"/>
            <Paper sx={{bgcolor: 'white', p: 3, borderRadius: 0, boxShadow: 0}}>
                <FilterSuc onPassed={({sku_code, sku_name}) => handleSearch(sku_code, sku_name)}/>
                <Divider sx={{my: 2}}/>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        {['success', 'error'].map(type =>
                                flash[type] && (
                                    <Alert key={type} severity={type}>
                                        {flash[type]}
                                    </Alert>
                                )
                        )}
                    </Grid2>
                    {user.role === 'admin' && route().current('startUpCost.index') && (
                        <Grid2 size={12}>
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between'
                                alignItems={{ xs: 'flex-start', md: 'center' }}
                                spacing={2}
                                sx={{ mb: 1 }}
                            >
                                <Typography variant='h6'>
                                    รายการค่าเปิดเครื่อง
                                </Typography>

                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={<AddBox />}
                                        component={Link}
                                        href={route('startUpCost.create')}
                                    >
                                        สร้าง
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => {
                                            window.open(
                                                route('startUpCost.export', {
                                                    sku_code: startUpCosts?.filters?.sku_code,
                                                    sku_name: startUpCosts?.filters?.sku_name
                                                }),
                                                "_blank"
                                            );
                                        }}
                                    >
                                        ส่งออก Excel
                                    </Button>
                                </Stack>
                            </Stack>
                        </Grid2>
                    )}
                    <Grid2 size={12}>
                        <Box sx={{overflow: 'auto', height: 'calc(100dvh - 300px)'}}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={TableStyle.TableHead}>id</TableCell>
                                        <TableCell sx={TableStyle.TableHead}>รูปภาพ</TableCell>
                                        <TableCell sx={TableStyle.TableHead}>รหัสสินค้า</TableCell>
                                        <TableCell sx={TableStyle.TableHead}>ชื่อสินค้า</TableCell>
                                        <TableCell sx={TableStyle.TableHead}>หน่วย</TableCell>
                                        <TableCell sx={TableStyle.TableHead}>ค่าเปิดเครื่อง</TableCell>
                                        <TableCell sx={TableStyle.TableHead}>วันที่เพิ่ม/อัพเดท</TableCell>
                                        {(user.role === 'admin' && route().current('startUpCost.index')) && (
                                            <TableCell sx={TableStyle.TableHead}>จัดการ</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {startUpCosts.data.map((item, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{item.id}</TableCell>
                                                <TableCell>
                                                    <img
                                                        onError={(e) => e.target.src = imageNotFound} loading="lazy"
                                                        src={item.image} alt={item.sku_code} width={100}
                                                    />
                                                </TableCell>
                                                <TableCell>{item.sku_code}</TableCell>
                                                <TableCell>{item.sku_name}</TableCell>
                                                <TableCell>{item.unit}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={<Paid/>} color="success"
                                                        label={item.startup_cost}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <DateDetail created_at={item.created_at}
                                                                updated_at={item.updated_at}/>
                                                </TableCell>

                                                {(user.role === 'admin' && route().current('startUpCost.index')) && (
                                                    <TableCell>
                                                        <Stack direction='row' spacing={2}>
                                                            <Button
                                                                size="small" startIcon={<Edit/>}
                                                                variant="outlined" color="secondary"
                                                                component={Link}
                                                                href={route('startUpCost.edit', { id: item.id })}
                                                            >
                                                                แก้ไข
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleDelete(item)}
                                                                size="small" startIcon={<Delete/>}
                                                                variant="outlined" color="error">
                                                                ลบ
                                                            </Button>
                                                        </Stack>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </Grid2>
                    <Grid2 size={12} justifyContent='center' display='flex'>
                        <Pagination
                            onChange={(event, page) => {
                                if (route().current('startUpCost.index')) {
                                    router.get(route('startUpCost.index', {page: page}), {preserveState: true})
                                } else {
                                    router.get(route('report.start-up-cost.index', {page: page}), {preserveState: true})
                                }
                            }}
                            count={startUpCosts.links.length - 2} color="primary"
                            page={startUpCosts.current_page}
                        />
                    </Grid2>
                </Grid2>
            </Paper>
        </AuthenticatedLayout>
    )
}
