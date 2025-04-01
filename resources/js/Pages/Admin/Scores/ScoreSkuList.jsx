import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link} from "@inertiajs/react";
import {
    Box,
    Button,
    Grid2,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";


function ScoreSkuList({scoreSkus}) {
    return (
        <AuthenticatedLayout>
            <Head title='รายการคะแนนแต่ละสินค้า'/>
            <Paper sx={{backgroundColor : 'white',p : 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between'>
                            <Typography variant='h6'>รายการคะแนนแต่ละสินค้า</Typography>
                            <Button variant='contained' component={Link} href={route('ScoreSku.create')}>
                                สร้าง
                            </Button>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12}>
                        <Box sx={{overflow : 'auto'}}>
                            {/*สถานะ	รหัสสินค้า	ชื่อสินค้า	กลุ่มสินค้า	ความสามารถการซ่อม*/}
                            <Table>
                                <TableHead>
                                    <TableRow sx={TABLE_HEADER_STYLE}>
                                        <TableCell>สถานะ</TableCell>
                                        <TableCell>รหัสสินค้า</TableCell>
                                        <TableCell>กลุ่มสินค้า</TableCell>
                                        <TableCell>ความสามารถการซ่อม</TableCell>
                                        <TableCell>จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {scoreSkus.length > 0 ? (
                                        scoreSkus.map((scoreSku, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{scoreSku.status}</TableCell>
                                                <TableCell>{scoreSku.sku}</TableCell>
                                                <TableCell>{scoreSku.sku_name}</TableCell>
                                                <TableCell>{scoreSku.group_product_ref}</TableCell>
                                                <TableCell>{scoreSku.range_value_ref}</TableCell>
                                                <TableCell>
                                                    <Stack direction='row' spacing={2}>
                                                        <Button variant='contained' size='small'>
                                                            แก้ไข
                                                        </Button>
                                                        <Button
                                                            variant='contained' size='small' color='error'
                                                            onClick={() => handleDelete(scoreSku)}
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
);
}


export default ScoreSkuList;
const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};
