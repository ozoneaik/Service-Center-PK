import { DateFormatTh, DateFormatThString } from "@/Components/DateFormat";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    Box,
    Container, Grid2, Paper, Stack, Table, TableBody,
    TableCell, TableHead, TableRow, Typography
} from "@mui/material";

export default function WrList({ warranties }) {
    console.log('warranties', warranties);
    return (
        <AuthenticatedLayout >
            <Head title="S/N ที่ลงทะเบียนรับประกันในระบบ" />
            <Container maxWidth='false' sx={{ backgroundColor: 'white', p: 3 }}>

                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography fontSize={20} fontWeight='bold'>
                            S/N ที่ลงทะเบียนรับประกันในระบบ
                        </Typography>
                    </Grid2>
                    <Grid2 size={12}>
                        <Table>
                            <TableHead>
                                <TableRow sx={TABLE_HEADER_STYLE}>
                                    <TableCell>S/N</TableCell>
                                    <TableCell>ลงทะเบียนเมื่อ</TableCell>
                                    <TableCell>วันที่หมดรับประกัน</TableCell>
                                    <TableCell>ร้านที่บันทึกข้อมูล</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {warranties?.data.map((warranty, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Stack direction='row' spacing={2} alignItems='center'>
                                                <Box width={80} height={80}>
                                                    <img width='100%' height='100%'
                                                        src={import.meta.env.VITE_IMAGE_PID + warranty.pid + '.jpg'}
                                                        alt="ไม่มีรูปภาพ"
                                                    />
                                                </Box>
                                                <Stack spacing={2}>
                                                    <Typography>
                                                        S/N : {warranty.serial_id}
                                                    </Typography>
                                                    <Typography>
                                                        สินค้า : {warranty.pid} {warranty.p_name}
                                                    </Typography>
                                                </Stack>

                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {DateFormatThString(warranty.date_warranty)}
                                        </TableCell>
                                        <TableCell>
                                            {DateFormatThString(warranty.expire_date)}
                                        </TableCell>
                                        <TableCell>{warranty.shop_name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
}