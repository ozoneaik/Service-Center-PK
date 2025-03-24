import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, Link } from "@inertiajs/react";
import { Container, Table, TableBody, TableCell, TableHead, TableRow, TextField, Grid2, InputAdornment, Button, Paper, Chip, Stack, Typography } from "@mui/material";
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import StoreIcon from '@mui/icons-material/Store';
import PasswordIcon from '@mui/icons-material/Password';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from "react";
import EditGP from "./EditGP.jsx";
import AddStore from "./AddStore.jsx";

const TableDetail = ({ shops }) => {
    console.log(shops);
    const [open, setOpen] = useState(false);
    const [isCodeSel, setIsCodeSel] = useState();
    return (
        <>
            {open && <EditGP open={open} setOpen={setOpen} is_code_cust_id={isCodeSel} />}
            <Table>
                <TableHead>
                    <TableRow sx={TABLE_HEADER_STYLE}>
                        {['รหัสร้าน', 'ชื่อร้าน / เบอร์โทรศัพท์', 'ที่อยู่', 'GP', 'จำนวนผู้ใช้', 'สต็อกอะไหล่รวม','ยอดปรับปรุง (AT)', 'จัดการ'].map((head, index) => (
                            <TableCell key={index}>{head}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {shops.map((shop, index) => (
                        <TableRow key={index}>
                            <TableCell>{shop.is_code_cust_id}</TableCell>
                            <TableCell>
                                {shop.shop_name}
                                <br />
                                {shop.phone}
                            </TableCell>
                            <TableCell>{shop.address}</TableCell>
                            <TableCell>{shop.gp ? shop.gp.gp_val : 0}</TableCell>
                            <TableCell>{shop.count_user}</TableCell>
                            <TableCell>{shop.count_user}</TableCell>
                            <TableCell>กำลังพัฒนา</TableCell>
                            <TableCell>
                                <Stack direction='column' spacing={2}>
                                    {/* <Button
                                        onClick={() => {
                                            setOpen(true);
                                            setIsCodeSel(shop.is_code_cust_id)
                                        }}
                                        variant="outlined" color='info' size="small">
                                        จัดการ GP
                                    </Button> */}
                                    <Button
                                        component={Link} variant="outlined" color='info' size="small"
                                        href={route('stockSp.list', { is_code_cust_id: shop.is_code_cust_id })}>
                                        จัดการสต็อกอะไหล่
                                    </Button>
                                </Stack>

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>

    )
}

export default function StoreList({ shops }) {
    const [addStoreOpen, setAddStoreOpen] = useState(false);
    return (
        <>
            {addStoreOpen && <AddStore addStoreOpen={addStoreOpen} setAddStoreOpen={setAddStoreOpen} />}
            <AuthenticatedLayout>
                <Head title="รายการร้านทั้งหมด" />
                <Container maxWidth='false' sx={{ backgroundColor: 'white', p: 3 }}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{ md: 4, xs: 12 }}>
                            <TextField
                                fullWidth size="small" label='ค้นหารหัสร้าน'
                                type="text" name="is_code_cust_id"
                                // onChange={handleFilterChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">
                                            <PasswordIcon />
                                        </InputAdornment>
                                    }
                                }}
                            />
                        </Grid2>
                        <Grid2 size={{ md: 4, xs: 12 }}>
                            <TextField
                                fullWidth size="small" label='ค้นหาชื่อร้าน'
                                type="text" name="shop_name"
                                // onChange={handleFilterChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">
                                            <StoreIcon />
                                        </InputAdornment>
                                    }
                                }}
                            />
                        </Grid2>
                        <Grid2 size={{ md: 4, xs: 12 }}>
                            <TextField
                                fullWidth size="small" label='ค้นหาเบอร์โทรศัพท์'
                                type="text" name="serial_id"
                                // onChange={handleFilterChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">
                                            <LocalPhoneIcon />
                                        </InputAdornment>
                                    }
                                }}
                            />
                        </Grid2>
                        <Grid2 size={12}>
                            <Button disabled fullWidth startIcon={<SearchIcon />} variant="contained">ค้นหา</Button>
                        </Grid2>

                        <Grid2 size={12}>
                            <Stack direction={{sm : 'row' , xs : 'column'}} justifyContent='space-between' alignItems='center'>
                                <Typography variant='h5' fontWeight='bold'>จัดการศูนย์ซ่อม (สต็อกอะไหล่,GP)</Typography>
                                <Stack direction={{sm : 'row' , xs : 'column'}} spacing={2} alignItems='center'>
                                    <Typography variant="subtitle1">รายการทั้งหมด {shops.length} รายการ</Typography>
                                    <Button variant="contained" onClick={() => setAddStoreOpen(true)}>เพิ่มศูนย์ซ่อม</Button>
                                </Stack>
                            </Stack>
                        </Grid2>

                        <Grid2 size={12}>
                            <Paper variant='outlined' sx={{ p: 2, overflowX: 'auto' }}>
                                <TableDetail shops={shops} />
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
