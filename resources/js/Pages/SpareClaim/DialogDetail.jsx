import {
    AppBar,
    Button,
    Dialog,
    DialogContent,
    DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import React from "react";
import CloseIcon from '@mui/icons-material/Close';

export default function DialogDetail({open , setOpen, data,sparePartsDetail}){
    return (
        <Dialog fullWidth maxWidth='lg' open={open} onClose={()=>setOpen(false)}>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton onClick={()=>setOpen(false)}>
                        <CloseIcon/>
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        รายการอะไหล่
                    </Typography>
                </Toolbar>
            </AppBar>
            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Job</TableCell>
                            <TableCell>Serial</TableCell>
                            <TableCell>รหัสสินค้า</TableCell>
                            <TableCell>รหัสอะไหล่</TableCell>
                            <TableCell>ชื่ออะไหล่</TableCell>
                            <TableCell>จำนวน</TableCell>
                            <TableCell>หน่วย</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sparePartsDetail.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.job_id}</TableCell>
                                <TableCell>{item.serial_id}</TableCell>
                                <TableCell>{item.p_name}</TableCell>
                                <TableCell sx={{color : item.sp_warranty ? 'green' : ''}}>{item.sp_code}</TableCell>
                                <TableCell>{item.sp_name}</TableCell>
                                <TableCell>{item.qty}</TableCell>
                                <TableCell>{item.sp_unit}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/*<Stack direction='row-reverse' mt={2}>*/}
                {/*    <Button color='error' variant='contained'>ปิด</Button>*/}
                {/*</Stack>*/}
            </DialogContent>
        </Dialog>
    )
}
