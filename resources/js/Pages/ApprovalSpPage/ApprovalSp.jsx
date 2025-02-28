import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Button, Card, Chip,
    Container, Grid2, Stack,
    Table, TableBody, TableCell,
    TableHead, TableRow, Typography
} from "@mui/material";
import {DateFormat} from "@/Components/DateFormat.jsx";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";

const orangeFont = {color: '#f15922'};
const blackFont = {color: '#000'};


const Detail = ({detail}) => {
    return (
        <Stack direction="column" spacing={2}>
            <Typography sx={orangeFont} fontWeight="bold">
                Sn: <Typography sx={blackFont} component="span">{detail.serial_id}</Typography>
            </Typography>
            <Typography sx={orangeFont} fontWeight="bold">
                Job Id: <Typography sx={blackFont} component="span">{detail.job_id}</Typography>
            </Typography>
            <Typography sx={orangeFont} fontWeight="bold">
                รหัสอะไหล่: <Typography sx={blackFont} component="span">{detail.sp_code}</Typography>
            </Typography>
            <Typography sx={orangeFont} fontWeight="bold">
                ชื่ออะไหล่: <Typography sx={blackFont} component="span">{detail.sp_name}</Typography>
            </Typography>
        </Stack>
    );
};


export default function ApprovalSp({listSp}) {


    const handleClick = (spId, approve_status) => {
        AlertDialogQuestion({
            text: approve_status === 'yes' ? 'กด ตกลง เพื่อยืนยันการอนุมัติ ✅' : 'กด ตกลง เพื่อยืนยันไม่อนุมัติ ❌',
            onPassed: async (confirm) => {
                confirm && await handleApprove(spId, approve_status);
            }
        })
    }

    const handleApprove = async (spId, approve_status) => {
        let Status, Message;
        try {
            const {data, status} = await axios.put(`/admin/approval/update/${spId}/${approve_status}`);
            Status = status;
            Message = data.message;
        }catch (error) {
            Status = error.response.status;
            Message = error.response.data.message;
        }finally {
            AlertDialog({
                icon : Status === 200 ? 'success' : 'error',
                title : Status === 200 ? 'สำเร็จ' : 'เกิดข้อผิดพลาด',
                text : Message,
                onPassed : () => Status === 200 && window.location.reload()
            })
        }
    }


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
                    {listSp.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{DateFormat(item.created_at)}</TableCell>
                            <TableCell><Detail detail={item}/></TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>{item.price_multiple_gp}</TableCell>
                            <TableCell>{item.gp}</TableCell>
                            <TableCell><Chip label='รออนุมัติ'/></TableCell>
                            <TableCell>
                                <Stack direction='column' spacing={2}>
                                    <Button size='small' variant='contained' onClick={()=>handleClick(item.id,'yes')} color='success'>อนุมัติ</Button>
                                    <Button size='small' variant='contained' onClick={()=>handleClick(item.id,'no')} color='error'>ไม่อนุมัติ</Button>
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
                        <Card sx={{p: 3}}>
                            <TableList/>
                        </Card>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
