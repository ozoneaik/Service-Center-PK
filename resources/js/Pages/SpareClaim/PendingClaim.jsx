import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Breadcrumbs,
    Button, Card, Chip,
    Container,
    Grid2,
    Paper,
    Stack,
    Table, TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    Box,
    Divider
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

// Mobile Card Component
const MobileClaimCard = ({ item }) => (
    <Card sx={{ mb: 2, p: 2 }}>
        <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="primary">
                    {item.claim_id}
                </Typography>
                <StatusClaim status={item.status}/>
            </Stack>

            <Box>
                <Typography variant="caption" color="text.secondary">Job ID:</Typography>
                <Typography variant="body2">{item.job_id}</Typography>
            </Box>

            <Box>
                <Typography variant="caption" color="text.secondary">ลูกค้า:</Typography>
                <Typography variant="body2">{item.name} ({item.phone})</Typography>
            </Box>

            <Divider />

            <Box>
                <Typography variant="caption" color="text.secondary">รหัสอะไหล่:</Typography>
                <Typography variant="body2">{item.sp_code}</Typography>
            </Box>

            <Box>
                <Typography variant="caption" color="text.secondary">ชื่ออะไหล่:</Typography>
                <Typography variant="body2">{item.sp_name}</Typography>
            </Box>

            <Stack direction="row" spacing={2}>
                <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">จำนวน:</Typography>
                    <Typography variant="body2">{item.qty} {item.unit}</Typography>
                </Box>
                <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">วันที่แจ้ง:</Typography>
                    <Typography variant="body2">{DateFormat(item.created_at)}</Typography>
                </Box>
            </Stack>
        </Stack>
    </Card>
);

export default function PendingClaim({list}){
    const isMobile = useMediaQuery('(max-width:700px)');

    useEffect(() => {
        console.log(list)
    }, []);

    return (
        <AuthenticatedLayout>
            <Container maxWidth='false' >
                <Grid2 container spacing={2} mt={3} sx={{bgcolor : 'white', p : isMobile ? 0 : 2}}>
                    <Grid2 size={12}>
                        <Breadcrumbs>
                            <Typography sx={{color: 'text.primary'}}>แจ้งเคลมอะไหล่</Typography>
                            <Typography sx={{color: 'text.primary'}}>ประวัติเคลม</Typography>
                        </Breadcrumbs>
                    </Grid2>

                    <Grid2 size={12}>
                        <Stack
                            direction='row'
                            spacing={1}
                            mb={2}
                        >
                            <Button
                                component={Link}
                                href={'/spare-claim/index'}
                                variant={route().current() === 'spareClaim.index' ? 'contained' : 'outlined'}
                                fullWidth={isMobile}
                            >
                                แจ้งเคลมอะไหล่
                            </Button>
                            <Button
                                color='warning'
                                component={Link}
                                href={'/spare-claim/history'}
                                variant={route().current() === 'spareClaim.history' ? 'contained' : 'outlined'}
                                fullWidth={isMobile}
                            >
                                ประวัติเคลม
                            </Button>
                            <Button
                                color='secondary'
                                component={Link}
                                href={'/spare-claim/pending'}
                                variant={route().current() === 'spareClaim.pending' ? 'contained' : 'outlined'}
                                fullWidth={isMobile}
                            >
                                ค้างเคลมอะไหล่
                            </Button>
                        </Stack>
                    </Grid2>

                    <Grid2 size={12}>
                        {isMobile ? (
                            // Mobile View - Cards
                            <Stack spacing={1}>
                                {list.map((item, index) => (
                                    <MobileClaimCard key={index} item={item} />
                                ))}
                            </Stack>
                        ) : (
                            // Desktop View - Table
                            <Paper sx={{overflow: 'auto'}}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>รหัสเอกสารเคลม</TableCell>
                                            <TableCell>รหัส job</TableCell>
                                            <TableCell>ชื่อลูกค้า</TableCell>
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
                                                <TableCell>{item.name} {'('} {item.phone} {')'}</TableCell>
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
                            </Paper>
                        )}
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
