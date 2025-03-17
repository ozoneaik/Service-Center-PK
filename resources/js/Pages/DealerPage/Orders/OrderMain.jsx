import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {
    Button,
    Container,
    Grid2,
    Paper, Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import React from "react";

export default function OrderMain({orderList}){
    console.log(orderList)
    return(
        <AuthenticatedLayout>
            <Head title={'รายการสั่งซื้อ'}/>
                <Container maxWidth="false">
                    <Paper variant='outlined' sx={{p: 3, mt: 3}}>
                        <Typography variant='h6' fontWeight='bold'>
                            รายการสั่งซื้อ
                        </Typography>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <Stack direction='row-reverse'>
                                    <Button onClick={()=>alert('กำลังพัฒนา')} variant='contained' size='small' >order ที่สำเร็จแล้ว</Button>
                                </Stack>
                            </Grid2>
                            <Grid2 size={12}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{backgroundColor: '#f5f5f5'}}>
                                            <TableCell>หมายเลข Order</TableCell>
                                            <TableCell>ชื่อผู้ใช้</TableCell>
                                            <TableCell>สั่งซื้อเมื่อ</TableCell>
                                            <TableCell>#</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {orderList.data.map((order,index) => (
                                            <TableRow key={index    }>
                                                <TableCell>{order.order_id}</TableCell>
                                                <TableCell>
                                                    {order.is_code_key}
                                                    <br/>
                                                    {order.address}
                                                </TableCell>
                                                <TableCell>{order.created_at}</TableCell>
                                                <TableCell>
                                                    <Button onClick={()=>alert('กำลังพัฒนา')} size='small' >รายละเอียด</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                    </TableBody>
                                </Table>
                            </Grid2>
                        </Grid2>
                    </Paper>
                </Container>
        </AuthenticatedLayout>
    )
}
