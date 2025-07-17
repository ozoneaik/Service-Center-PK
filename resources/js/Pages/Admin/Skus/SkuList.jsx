import LayoutSku from "@/Pages/Admin/Skus/LayoutSku.jsx";
import {
    Button, FormControl, FormLabel, Grid2, Pagination, Stack,
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography
} from "@mui/material";
import {TableStyle} from "../../../../css/TableStyle.js";
import {Search} from "@mui/icons-material";
import {router} from "@inertiajs/react";

export default function SkuList({skus}) {
    const handleSearch = (e) => {
        e.preventDefault();
        alert('test');
    }

    const redirectDetail = (sku_fg,model_fg) => {
        router.get(route('admin.skus.detail',{sku_fg, model_fg}));
    }
    
    return (
        <LayoutSku title='รายการอะไหล่'>
            <Grid2 container spacing={2}>
                <Grid2 size={12}>
                    <form onSubmit={handleSearch}>
                        <Grid2 container spacing={1} sx={{width: '100%'}}>
                            <Grid2 size={3}>
                                <FormControl fullWidth>
                                    <FormLabel htmlFor='pid'>รหัสสินค้า</FormLabel>
                                    <TextField fullWidth id='pid' name='pid' size='small'/>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={3}>
                                <FormControl fullWidth>
                                    <FormLabel htmlFor='pid'>ชื่อสินค้า</FormLabel>
                                    <TextField fullWidth id='pid' name='pid' size='small'/>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={3}>
                                <FormControl fullWidth>
                                    <FormLabel htmlFor='pid'>โมเดล</FormLabel>
                                    <TextField fullWidth id='pid' name='pid' size='small'/>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={3}>
                                <FormControl fullWidth>
                                    <FormLabel htmlFor='pid' sx={{visibility: 'hidden'}}>ค้นหา</FormLabel>
                                    <Button variant='contained' sx={{width: 100}} startIcon={<Search/>}>ค้นหา</Button>
                                </FormControl>
                            </Grid2>
                        </Grid2>
                    </form>
                </Grid2>
                <Grid2 size={12}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography>รายการสินค้า</Typography>
                        <Typography>จำนวน {skus.data.length} รายการ จากทั้งหมด {skus.total} รายการ</Typography>
                    </Stack>
                </Grid2>
                <Grid2 size={12} maxHeight={'calc(100dvh - 300px)'} overflow='auto'>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={TableStyle.TableHead}>รูป</TableCell>
                                <TableCell sx={TableStyle.TableHead}>รหัสสินค้า</TableCell>
                                <TableCell sx={TableStyle.TableHead}>ชื่อสินค้า</TableCell>
                                <TableCell sx={TableStyle.TableHead}>โมเดล</TableCell>
                                <TableCell align='center' sx={TableStyle.TableHead}>จัดการ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {skus.data.map((sku, index) => {
                                const skuImage = import.meta.env.VITE_IMAGE_PID + sku.skufg + '.jpg';
                                const imageError = import.meta.env.VITE_IMAGE_DEFAULT;
                                return (
                                    <TableRow key={index}>
                                        <TableCell sx={TableStyle.TableCellBody}>
                                            <img
                                                src={skuImage} width={80} height={80}
                                                onError={(e) => {
                                                    e.currentTarget.src = imageError;
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={TableStyle.TableCellBody}>{sku.skufg}</TableCell>
                                        <TableCell sx={TableStyle.TableCellBody}>{sku.skufgname}</TableCell>
                                        <TableCell sx={TableStyle.TableCellBody}>{sku.modelfg}</TableCell>
                                        <TableCell sx={TableStyle.TableCellBody} align='center'>
                                            <Button
                                                onClick={()=>redirectDetail(sku.skufg,sku.modelfg)}
                                                size='small'>
                                                รายละเอียด
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Grid2>
                <Grid2 size={12}>
                    <Stack justifyContent='center' direction='row'>
                        <Pagination count={10} color="primary"/>
                    </Stack>
                </Grid2>
            </Grid2>
        </LayoutSku>
    )
}
