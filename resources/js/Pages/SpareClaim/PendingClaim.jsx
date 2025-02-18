import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Breadcrumbs,
    Button, Card, Chip,
    Container,
    Grid2,
    Stack,
    Table, TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {Link} from "@inertiajs/react";
import {useEffect} from "react";
import {DateFormat} from "@/Components/DateFormat.jsx";

const StatusClaim = ({status}) =>
    (<Chip
        variant='outlined'
        size='small'
        color={status === 'pending' ? 'primary' : 'success'}
        label={status === 'pending' ? 'รอดำเนินงาน' : 'เสร็จสิ้น'}
    />)

export default function PendingClaim({list}){
    useEffect(() => {
        console.log(list)
    }, []);
    return (
        <AuthenticatedLayout>
            <Container maxWidth='false'>
                <Grid2 container spacing={2}  mt={3}>
                    <Grid2 size={12}>
                        <Breadcrumbs>
                            <Typography sx={{color: 'text.primary'}}>แจ้งเคลมอะไหล่</Typography>
                            <Typography sx={{color: 'text.primary'}}>ประวัติเคลม</Typography>
                        </Breadcrumbs>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row-reverse' spacing={1} mb={2}>
                            <Button
                                component={Link} href={'/spare-claim/index'}
                                variant={route().current() === 'spareClaim.index' ? 'contained' : 'outlined'}>
                                แจ้งเคลมอะไหล่
                            </Button>
                            <Button
                                color='warning'
                                component={Link} href={'/spare-claim/history'}
                                variant={route().current() === 'spareClaim.history' ? 'contained' : 'outlined'}>
                                ประวัติเคลม
                            </Button>
                            <Button
                                color='secondary'
                                component={Link} href={'/spare-claim/pending'}
                                variant={route().current() === 'spareClaim.pending' ? 'contained' : 'outlined'}>
                                ค้างเคลมอะไหล่
                            </Button>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12}>
                        <Card>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>รหัสเอกสารเคลม</TableCell>
                                        <TableCell>รหัส job</TableCell>
                                        <TableCell>รหัสอะไหล่</TableCell>
                                        <TableCell>ชื่ออะไหล่</TableCell>
                                        <TableCell>วันที่แจ้งเคลม</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell>สถานะ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {list.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.claim_id}</TableCell>
                                            <TableCell>{item.job_id}</TableCell>
                                            <TableCell>{item.sp_code}</TableCell>
                                            <TableCell>{item.sp_name}</TableCell>
                                            <TableCell>
                                                {DateFormat(item.created_at)}
                                            </TableCell>
                                            <TableCell>{item.qty}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                            <TableCell>
                                                <StatusClaim status={item.status}/>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
