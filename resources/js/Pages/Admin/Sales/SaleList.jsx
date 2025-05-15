import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link, router, usePage} from "@inertiajs/react";
import {
    Alert, Button, Grid2, Paper, Stack, Typography,
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Pagination,
} from "@mui/material";
import {DateFormatTh} from "@/Components/DateFormat.jsx";
import {AlertDialogQuestion} from "@/Components/AlertDialog.js";
import {useEffect, useState} from "react";
import UpdateSale from "@/Pages/Admin/Sales/UpdateSale.jsx";
import {Add, Delete, Edit, Search} from "@mui/icons-material";

const AlertComponent = ({status, flashMessage, setShowAlert}) => (
    <Grid2 size={12}>
        <Alert variant='filled' severity={status} onClose={() => setShowAlert(false)}>
            {flashMessage}
        </Alert>
    </Grid2>
);

export default function SaleList({sales}) {
    console.log('sales', sales)
    const {flash} = usePage().props;
    const [showAlert, setShowAlert] = useState(false);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState();
    const [filter, setFilter] = useState({sale_name: '', sale_code: ''})
    useEffect(() => {
        if (flash.success || flash.error) {
            setShowAlert(true);
        }
    }, [flash]);
    const handelDelete = (sale_code, sale_name) => {
        AlertDialogQuestion({
            text: `กด ตกลง เพื่อลบเซลล์ ${sale_name} รหัส ${sale_code}`,
            onPassed: (confirm) => {
                confirm && router.delete(route('Sales.destroy', {sale_code: sale_code}), {
                    onFinish: (e) => setShowAlert(true)
                });
            }
        });
    }

    const handleEdit = (item) => {
        setSelected(item);
        setOpen(true);
    }

    const handleFilter = () => {
        router.get(route('Sales.index'), filter, { preserveState: true });
    }

    const handleOnChange = (e) => {
        const {name, value} = e.target;
        setFilter(prevState => ({
            ...prevState,
            [name]: value
        }));
    }
    return (
        <>
            {open && <UpdateSale open={open} setOpen={setOpen} sale={selected}/>}
            <AuthenticatedLayout>
                <Head title={'จัดการเซลล์'}/>
                <Paper sx={{bgcolor: 'white', p: 3}}>
                    <Grid2 container spacing={2}>
                        {showAlert && flash.success ? (
                            <AlertComponent setShowAlert={setShowAlert} status='success' flashMessage={flash.success}/>
                        ) : flash.error && (
                            <AlertComponent setShowAlert={setShowAlert} status='error' flashMessage={flash.error}/>
                        )}
                        <Grid2 size={12}>
                            <Stack direction={{xs: 'column', md: 'row'}} justifyContent='space-between'>
                                <Typography variant='h6'>รายการเซลล์</Typography>
                                <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                                    <TextField size='small' label='รหัสเซลล์' name='sale_code'
                                               onChange={handleOnChange}/>
                                    <TextField size='small' label='ชื่อเซลล์' name='sale_name'
                                               onChange={handleOnChange}/>
                                    <Button
                                        variant='contained' startIcon={<Search/>}
                                        color='secondary' onClick={handleFilter}
                                    >
                                        ค้นหา
                                    </Button>
                                    <Button
                                        variant='contained' component={Link}
                                        href={route('Sales.create')} startIcon={<Add/>}
                                    >
                                        เพิ่มเซลล์
                                    </Button>
                                </Stack>
                            </Stack>
                        </Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{overflowX: 'auto'}} variant='outlined'>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={TABLE_HEADER_STYLE}>
                                            <TableCell>รหัสเซลล์</TableCell>
                                            <TableCell>ชื่อ</TableCell>
                                            <TableCell>สร้างเมื่อ</TableCell>
                                            <TableCell>อัพเดทล่าสุดเมื่อ</TableCell>
                                            <TableCell>จัดการ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sales.data.length > 0 ? (
                                            sales.data.map((sale, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{sale.sale_code}</TableCell>
                                                    <TableCell>{sale.name}</TableCell>
                                                    <TableCell>
                                                        <DateFormatTh date={sale.created_at}/>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DateFormatTh date={sale.updated_at}/>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction='row' spacing={2}>
                                                            <Button variant='contained' color='warning' size='small'
                                                                    onClick={() => handleEdit(sale)}
                                                                    startIcon={<Edit/>}
                                                            >
                                                                แก้ไข
                                                            </Button>
                                                            <Button
                                                                variant='contained' color='error'
                                                                onClick={() => handelDelete(sale.sale_code, sale.name)}
                                                                size='small' startIcon={<Delete/>}
                                                            >
                                                                ลบ
                                                            </Button>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5}>
                                                    ไม่พบรายการเซลล์
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </Grid2>
                        <Grid2 size={12}>
                            <Pagination
                                count={sales.last_page} page={sales.current_page}
                                onChange={(event, value) => {
                                    router.get(route('Sales.index'), {
                                        ...filter, page : value
                                    }, { preserveState: true });
                                }}
                                color="primary"
                            />
                        </Grid2>
                    </Grid2>
                </Paper>
            </AuthenticatedLayout>
        </>
    )
}
const TABLE_HEADER_STYLE = {backgroundColor: '#c7c7c7', fontWeight: 'bold', fontSize: 16};
