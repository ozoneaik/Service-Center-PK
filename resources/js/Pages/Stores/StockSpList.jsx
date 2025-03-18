import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Container, Table, TableBody, TableCell, TableHead, TableRow, TextField, Grid2, InputAdornment, Button, Paper, Chip, Stack, Typography } from "@mui/material";
import StoreIcon from '@mui/icons-material/Store';
import PasswordIcon from '@mui/icons-material/Password';
import SearchIcon from '@mui/icons-material/Search';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';


const TableDetail = ({ stocks }) => {
    return (
        <Table>
            <TableHead>
                <TableRow sx={TABLE_HEADER_STYLE}>
                    {['รูปภาพสินค้า', 'รหัสสินค้า', 'ชื่อสินค้า', 'รูปภาพอะไหล่', 'รหัสอะไหล่', 'ชื่ออะไหล่', 'จำนวน', 'จัดการ'].map((head, index) => (
                        <TableCell key={index}>{head}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {stocks.map((stock, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <img src="" alt="no image" />
                        </TableCell>
                        <TableCell>{stock.sku_code}</TableCell>
                        <TableCell>{stock.sku_name}</TableCell>
                        <TableCell>
                            <img src="" alt="no image" />
                        </TableCell>
                        <TableCell>{stock.sp_code}</TableCell>
                        <TableCell>{stock.sp_name}</TableCell>
                        <TableCell>{stock.qty_sp}</TableCell>
                        <TableCell>
                            <Button size="small" variant="contained">
                                เพิ่ม / ลด จำนวนอะไหล่
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function StockSpList({ stocks, store }) {
    console.log(stocks, store);
    return (
        <AuthenticatedLayout>
            <Head title="จัดการสต็อกอะไหล่" />
            <Container maxWidth='false' sx={{ backgroundColor: 'white', p: 3 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={{ md: 3, xs: 12 }}>
                        <TextField
                            fullWidth size="small" label='รหัสอะไหล่'
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
                    <Grid2 size={{ md: 3, xs: 12 }}>
                        <TextField
                            fullWidth size="small" label='ชื่ออะไหล่'
                            type="text" name="stock_name"
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
                    <Grid2 size={{ md: 3, xs: 12 }}>
                        <TextField
                            fullWidth size="small" label='รหัสสินค้า'
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
                    <Grid2 size={{ md: 3, xs: 12 }}>
                        <TextField
                            fullWidth size="small" label='ชื่อสินค้า'
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
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <Typography variant='h5' fontWeight='bold'>จัดการสต็อกอะไหล่ ร้าน{store.shop_name}</Typography>
                            <Stack direction='row' spacing={2} alignItems='center'>
                                <Typography variant="subtitle1">รายการทั้งหมด {stocks.length} รายการ</Typography>
                                <Button variant="contained" >เพิ่มอะไหล่</Button>
                            </Stack>
                        </Stack>
                    </Grid2>

                    <Grid2 size={12}>
                        <Paper variant='outlined' sx={{ p: 2, overflowX: 'auto' }}>
                            <TableDetail stocks={stocks} />
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