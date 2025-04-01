import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link, router, usePage} from "@inertiajs/react";
import {
    Box, Button, Grid2, Paper, Stack, Typography,
    Table, TableBody, TableCell, TableHead, TableRow, Alert,
} from "@mui/material";
import {DateFormatTh} from "@/Components/DateFormat.jsx";
import {AlertDialogQuestion} from "@/Components/AlertDialog.js";
import {useState} from "react";

const AlertComponent = ({flashMessage, setShowAlert, status}) => (
    <Grid2 size={12}>
        <Alert variant='filled' severity={status} onClose={() => setShowAlert(false)}>
            {flashMessage}
        </Alert>
    </Grid2>
)

export default function ScoreMasterList({scoreMasters}) {
    const [showAlert, setShowAlert] = useState(false);
    const {flash} = usePage().props;
    const handleDelete = (Obj) => {
        AlertDialogQuestion({
            text: `กด ตกลง เพื่อ ลบข้อมูล ระดับความสามารถ ${Obj.range_value}`,
            onPassed: (confirm) => {
                confirm && router.delete(route('ScoreMaster.delete', {id: Obj.id}), {
                    onFinish: () =>  setShowAlert(true)
                })
            }
        });
    }
    return (
        <AuthenticatedLayout>
            <Head title='จัดการ master คะแนน'/>
            <Paper sx={{backgroundColor: 'white', p: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between'>
                            <Typography variant='h6'>จัดการ master คะแนน</Typography>
                            <Stack direction='row' spacing={2}>
                                <Button variant='contained' component={Link} href={route('ScoreSku.index')}>
                                    รายการคะแนนแต่ละสินค้า
                                </Button>
                                <Button variant='contained' component={Link} href={route('ScoreMaster.create')}>
                                    สร้าง
                                </Button>
                            </Stack>
                        </Stack>
                    </Grid2>
                    {showAlert && flash.success && (
                        <AlertComponent setShowAlert={setShowAlert} flashMessage={flash.success} status='success'/>
                    )}
                    {showAlert && flash.error && (
                        <AlertComponent setShowAlert={setShowAlert} flashMessage={flash.error} status='error'/>
                    )}
                    <Grid2 size={12}>
                        <Box sx={{overflow: 'auto'}}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={TABLE_HEADER_STYLE}>
                                        <TableCell>ความสามารถการซ่อม</TableCell>
                                        <TableCell>ระดับการอบรม</TableCell>
                                        <TableCell>เงื่อนไข</TableCell>
                                        <TableCell>กลุ่มสินค้า</TableCell>
                                        <TableCell>สร้างเมื่อ</TableCell>
                                        <TableCell>อัพเดทเมื่อ</TableCell>
                                        <TableCell>จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {scoreMasters.length > 0 ? (
                                        scoreMasters.map((scoreMaster, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{scoreMaster.range_value}</TableCell>
                                                <TableCell>{scoreMaster.range_name}</TableCell>
                                                <TableCell>{scoreMaster.condition}</TableCell>
                                                <TableCell>{scoreMaster.group_product}</TableCell>
                                                <TableCell>
                                                    <DateFormatTh date={scoreMaster.created_at}/>
                                                </TableCell>
                                                <TableCell>
                                                    <DateFormatTh date={scoreMaster.updated_at}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction='row' spacing={2}>
                                                        <Button variant='contained' size='small'>
                                                            แก้ไข
                                                        </Button>
                                                        <Button
                                                            variant='contained' size='small' color='error'
                                                            onClick={() => handleDelete(scoreMaster)}
                                                        >
                                                            ลบ
                                                        </Button>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7}>ไม่พบรายการ</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Grid2>
                </Grid2>
            </Paper>
        </AuthenticatedLayout>
    )
}
const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};
