import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button
} from "@mui/material";
import {Link} from "@inertiajs/react";

export default function OrderHistory({history}) {
    const historyList = history.data;

    return (
        <AuthenticatedLayout>
            <Container maxWidth="false" sx={{mt: 4}}>
                <Typography variant="h5" gutterBottom>
                    ประวัติคำสั่งซื้อ
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>หมายเลขคำสั่งซื้อ</TableCell>
                                <TableCell>วันที่สั่งซื้อ</TableCell>
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
                                        <TableCell>
                                            <Chip
                                                label={item.status_text}
                                                color={
                                                    item.status === "pending" ? "warning" : item.status === "success" ? "success" : item.status === 'progress' ? 'secondary' : item.status === 'calceled' ? 'error' : 'info'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant='contained'
                                                size='small'
                                                composer={Link}
                                                href={`/orders/history-detail/${item.order_id}`}
                                            >
                                                ดู</Button>
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
                </TableContainer>
            </Container>
        </AuthenticatedLayout>
    );
}
