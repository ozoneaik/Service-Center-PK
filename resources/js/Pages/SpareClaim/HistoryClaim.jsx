import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Breadcrumbs,
    Button,
    Card,
    Container,
    Grid2,
    Stack, Table, TableBody, TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {Link} from "@inertiajs/react";
import SearchIcon from '@mui/icons-material/Search';

export default function HistoryClaim() {
    return (
        <AuthenticatedLayout>
            <Container>
                <Grid2 container spacing={2} mt={3}>
                    <Grid2 size={12}>
                        <Breadcrumbs>
                            <Typography sx={{color: 'text.primary'}}>Home</Typography>
                            <Typography sx={{color: 'text.primary'}}>เคลมอะไหล่</Typography>
                        </Breadcrumbs>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row-reverse' spacing={2} mb={2}>
                            <Button
                                component={Link} href={'/spare-claim/index'}
                                variant={route().current() === 'spareClaim.index' ? 'contained' : 'outlined'}>
                                สร้างเอกสารเคลม
                            </Button>
                            <Button
                                component={Link} href={'/spare-claim/history'}
                                variant={route().current() === 'spareClaim.historyShow' ? 'contained' : 'outlined'}>
                                ประวัติเคลม
                            </Button>
                        </Stack>
                        <Card sx={{padding : 3}}>
                            <Stack direction='row' spacing={2} mb={2} alignItems='center'>
                                <TextField size='small' type='date'/>
                                <Typography>ถึง</Typography>
                                <TextField size='small' type='date'/>
                                <Button startIcon={<SearchIcon/>} variant='contained'>ค้นหา</Button>
                            </Stack>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{fontWeight : 'bold'}} colSpan={8}>
                                            ประวัติเคลมอะไหล่
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>รหัสอะไหล่</TableCell>
                                        <TableCell>ชื่ออะไหล่</TableCell>
                                        <TableCell>วันที่แจ้งเคลม</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell>วันที่รับ</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell>สถานะ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>รหัสอะไหล่</TableCell>
                                        <TableCell>ชื่ออะไหล่</TableCell>
                                        <TableCell>ชื่ออะไหล่</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell>วันที่รับ</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell>สถานะ</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
