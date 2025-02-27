import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Button,
    Card,
    Chip,
    Container,
    Grid2,
    Paper, Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, Typography
} from "@mui/material";
import {DateFormat} from "@/Components/DateFormat.jsx";


const Detail = ({ detail }) => {
    return (
        <Stack direction="column" spacing={2}>
            <Typography fontWeight="bold">
                Sn: <Typography component="span">{detail.serial_id}</Typography>
            </Typography>
            <Typography fontWeight="bold">
                Job Id: <Typography component="span">{detail.job_id}</Typography>
            </Typography>
            <Typography fontWeight="bold">
                รหัสอะไหล่: <Typography component="span">{detail.sp_code}</Typography>
            </Typography>
            <Typography fontWeight="bold">
                ชื่ออะไหล่: <Typography component="span">{detail.sp_name}</Typography>
            </Typography>
        </Stack>
    );
};


export default function ApprovalSp({listSp}){


    const TableList = () => {
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ลำดับ</TableCell>
                        <TableCell>วันที่แจ้ง</TableCell>
                        <TableCell>ข้อมูล</TableCell>
                        <TableCell>จำนวน</TableCell>
                        <TableCell>ราคา</TableCell>
                        <TableCell>GP</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell>จัดการ</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {listSp.map((item,index) => (
                        <TableRow key={index}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{DateFormat(item.created_at)}</TableCell>
                            <TableCell><Detail detail={item}/></TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>{item.price_multiple_gp}</TableCell>
                            <TableCell>{item.gp}</TableCell>
                            <TableCell><Chip label='รออนุมัติ'/></TableCell>
                            <TableCell>
                                <Stack direction='row' spacing={2}>
                                    <Button size='small' variant='contained' color='success'>อนุมัติ</Button>
                                    <Button size='small' variant='contained' color='error'>ไม่อนุมัติ</Button>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    }


    return (
        <AuthenticatedLayout>
            <Container maxWidth='false'>
                <Grid2 container mt={3} spacing={2}>
                    <Grid2 size={12}>
                        <Card sx={{p :3}}>
                            <TableList/>
                        </Card>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
