import LayoutSku from "@/Pages/Admin/Skus/LayoutSku.jsx";
import {
    Box, Button, Grid2, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
    useTheme
} from "@mui/material";
import { TableStyle } from "../../../../css/TableStyle.js";
import { router } from "@inertiajs/react";
import { Add, Delete, Edit, Image, PictureInPicture } from "@mui/icons-material";

export default function SkuDetail(props) {
    console.log(props)
    const { product, detail, sku_fg } = props;
    return (
        <LayoutSku title='รายละเอียดสินค้า'>
            <Grid2 container spacing={2}>
                <Grid2 size={12}>
                    <Stack direction='row' spacing={2} alignItems='center'>
                        <Box sx={{ borderRight: 'solid 1px #ccc', p: 1 }}>
                            <img
                                width={150} height={150} src={import.meta.env.VITE_IMAGE_PID + sku_fg + '.jpg'}
                                onError={(e) => {
                                    e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT;
                                }}
                            />
                        </Box>
                        <Stack width='100%' spacing={2}>
                            <Typography fontSize={20} fontWeight='bold'>รายละเอียด</Typography>
                            <TitleComponent title={'ชื่อ/รหัสสินค้า'} value={product.skufg + ' ' + `(${product.skufgname})`} />
                            <TitleComponent title={'โมเดล'} value={product.modelfg} />
                            <TitleComponent title={'ประเภท DM'} value={product.typedm} />
                        </Stack>
                        <Stack spacing={2} direction='row' justifyContent='end' width='100%'>
                            <Button variant='contained' color='warning' startIcon={<Edit />}>แก้ไขข้อมูลสินค้า</Button>
                            <Button variant='contained' startIcon={<Add />}>เพิ่มอะไหล่</Button>
                             <Button variant='contained' startIcon={<Image />}>จัดการรูปไดอะแกรม</Button>
                        </Stack>
                    </Stack>
                </Grid2>
                <Grid2 size={12}>
                    <Typography fontSize={20} fontWeight='bold'>รายการอะไหล่</Typography>
                </Grid2>
                <Grid2 size={12} maxHeight={'calc(100dvh - 300px)'} overflow='auto'>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={TableStyle.TableHead}>รูป</TableCell>
                                <TableCell sx={TableStyle.TableHead}>รหัสอะไหล่</TableCell>
                                <TableCell sx={TableStyle.TableHead}>ชื่ออะไหล่</TableCell>
                                <TableCell sx={TableStyle.TableHead}>หน่วย</TableCell>
                                <TableCell align='center' sx={TableStyle.TableHead}>จัดการ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detail.map((sp, index) => {
                                const skuImage = import.meta.env.VITE_IMAGE_SP + sp.skusp + '.jpg';
                                const imageError = import.meta.env.VITE_IMAGE_DEFAULT;
                                return (
                                    <TableRow key={index}>
                                        <TableCell sx={{ p: 1 }}>
                                            <img
                                                loading="lazy"
                                                src={skuImage} width={50} height={50}
                                                onError={(e) => {
                                                    e.currentTarget.src = imageError;
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={TableStyle.TableCellBody}>{sp.skusp}</TableCell>
                                        <TableCell sx={TableStyle.TableCellBody}>{sp.skuspname}</TableCell>
                                        <TableCell sx={TableStyle.TableCellBody}>{sp.skuspunit}</TableCell>
                                        <TableCell sx={TableStyle.TableCellBody} align='center'>
                                            <Stack direction='row' spacing={2} justifyContent='center'>
                                                <Button
                                                    color='warning' size='small'
                                                    variant='contained' startIcon={<Edit />}
                                                >
                                                    แก้ไข
                                                </Button>
                                                <Button
                                                    color='error' size='small'
                                                    variant='contained' startIcon={<Delete />}
                                                >
                                                    ลบ
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Grid2>
            </Grid2>
        </LayoutSku>
    )
}

const TitleComponent = ({ title, value }) => {
    const theme = useTheme();
    const pumpkinColor = theme.palette.pumpkinColor.main;

    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Typography fontWeight="bold" minWidth={120}>
                {title}:
            </Typography>
            <Typography color={pumpkinColor}>{value}</Typography>
        </Stack>
    );
};
