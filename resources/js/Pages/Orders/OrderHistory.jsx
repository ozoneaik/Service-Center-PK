import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Container, Table, TableBody, TableCell, TableHead, TableRow,
    Typography, Chip, Button, useMediaQuery, Grid2, Card, CardContent, Divider, Stack, useTheme
} from "@mui/material";
import {Link} from "@inertiajs/react";
import {DateFormatTh} from "@/Components/DateFormat.jsx";
import {RemoveRedEye} from "@mui/icons-material";

export default function OrderHistory({history}) {
    const historyList = history.data;
    const ColorStatus = (status) => ({
        pending: 'warning',
        success: 'success',
        progress: 'secondary',
        canceled: 'error'
    }[status] || 'info');

    const isMobile = useMediaQuery('(max-width:600px)');
    return (
        <AuthenticatedLayout>
            <Container maxWidth="false" sx={{mt: 4, bgcolor: 'white', p: 3}}>
                <Typography variant="h5" gutterBottom>
                    ประวัติคำสั่งซื้อ
                </Typography>
                <Grid2 container spacing={2}>
                    {isMobile ? (
                        <Grid2 size={12}>
                            {historyList.map((item, index) => {
                                return (
                                    <Card variant='outlined' key={index}>
                                        <CardContent>
                                            <Stack spacing={2}>
                                                <TextDetail label={'รายการที่'} value={index + 1}/>
                                                <TextDetail label={'หมายเลขคำสั่งซื้อ'} value={item.order_id}/>
                                                <TextDetail label={'วันที่สั่งซื้อ'}
                                                            value={DateFormatTh({date: item.buy_at})}/>
                                                <TextDetail label={'ที่อยู่'} value={item.address}/>
                                                <TextDetail label={'สถานะ'} value={item.status_text}/>
                                                <Divider/>
                                                <Button
                                                    fullWidth startIcon={<RemoveRedEye/>}
                                                    variant='contained' size='small' component={Link}
                                                    href={`/orders/history-detail/${item.order_id}`}
                                                >
                                                    ดู
                                                </Button>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </Grid2>
                    ) : (
                        <Grid2 size={12} overflow='auto'>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>หมายเลขคำสั่งซื้อ</TableCell>
                                        <TableCell>วันที่สั่งซื้อ</TableCell>
                                        <TableCell>ที่อยู่</TableCell>
                                        <TableCell>สถานะ</TableCell>
                                        <TableCell>รายละเอียด</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historyList.length > 0 ? (
                                        historyList.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{item.order_id}</TableCell>
                                                <TableCell>{new Date(item.buy_at).toLocaleString()}</TableCell>
                                                <TableCell>{item.address}</TableCell>
                                                <TableCell>
                                                    <Chip label={item.status_text} color={ColorStatus(item.status)}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant='contained' size='small' component={Link}
                                                        href={`/orders/history-detail/${item.order_id}`}
                                                    >
                                                        ดู
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                ไม่มีข้อมูลคำสั่งซื้อ
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Grid2>
                    )}
                </Grid2>

            </Container>
        </AuthenticatedLayout>
    );
}

const TextDetail = ({label, value}) => {
    const {palette} = useTheme();
    const pumpkinColor = palette.pumpkinColor.main;
    return (
        <Stack direction='row' spacing={1}>
            <Typography color={pumpkinColor} fontWeight='bold'>{label}</Typography>
            <Typography>:</Typography>
            <Typography>{value}</Typography>
        </Stack>
    )
}
