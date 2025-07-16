import {
    Button, Grid2, Pagination, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography
} from "@mui/material";
import LayoutSpsDms from "@/Pages/Admin/Sps_Dms/LayoutSpsDms.jsx";
import {useEffect, useState} from "react";
import {TableStyle} from "../../../../../css/TableStyle.js";
import {RemoveRedEye} from "@mui/icons-material";
import DialogSpList from "@/Pages/Admin/Sps_Dms/Sps/DialogSpList.jsx";

export default function SpList({sp_group}) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    useEffect(() => {
        console.log(sp_group)
    }, [])

    const handleSelect = (sku_fg) => {
        setSelected(sku_fg)
        setOpen(true)
    }
    return (
        <LayoutSpsDms title='จัดการรายการอะไหล่'>
            <Grid2 container spacing={2} sx={{overflow: 'auto', height: 'calc(100vh - 160px)', mb: 3}}>
                <Grid2 size={12}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography fontWeight='bold' fontSize={20}>
                            รายการอะไหล่ {sp_group.data.length} รายการ
                        </Typography>
                        <Typography fontWeight='bold' fontSize={20}>
                            จากทั้งหมด {sp_group.total} รายการ
                        </Typography>
                    </Stack>
                </Grid2>
                <Grid2 size={12}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={TableStyle.TableHead}>รูป</TableCell>
                                <TableCell sx={TableStyle.TableHead}>รหัสสินค้า</TableCell>
                                <TableCell sx={TableStyle.TableHead}>ชื่อสินค้า</TableCell>
                                <TableCell sx={TableStyle.TableHead} align='center'>ดูรายการอะไหล่</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sp_group.data.map((item, index) => (
                                <TableRow key={index} sx={{
                                    '&:hover': {
                                        backgroundColor: '#ececec'
                                    }
                                }}>
                                    <TableCell>
                                        <img
                                            src={import.meta.env.VITE_IMAGE_PID + item.skufg + '.jpg'}
                                            alt="" width={80} height={80}
                                            onError={(e) => {
                                                e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT
                                            }}
                                            style={{mixBlendMode :"multiply"}}
                                        />
                                    </TableCell>
                                    <TableCell>{item.skufg}</TableCell>
                                    <TableCell>{item.skufgname}</TableCell>
                                    <TableCell align='center'>
                                        <Button
                                            onClick={() => handleSelect(item.skufg)}
                                            size='small' variant='contained'
                                        >
                                            <RemoveRedEye/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </Grid2>
            </Grid2>
            <Stack direction='row' justifyContent='center'>
                <Pagination color='primary' count={10}/>
            </Stack>

            {open && <DialogSpList open={open} setOpen={setOpen} skuFg={selected}/>}
        </LayoutSpsDms>
    )
}
