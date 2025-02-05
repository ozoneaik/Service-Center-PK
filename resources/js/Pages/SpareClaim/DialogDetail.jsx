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

export default function DialogDetail({open , setOpen, data}){
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
                        <TableRow sx={{backgroundColor : '#eff0f1'}}>
                            <TableCell sx={{fontWeight : 'bold'}} colSpan={7}>
                                รายการอะไหล่
                            </TableCell>
                        </TableRow>
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
                        <TableRow>
                            <TableCell>Job</TableCell>
                            <TableCell>Serial</TableCell>
                            <TableCell>รหัสสินค้า</TableCell>
                            <TableCell>รหัสอะไหล่</TableCell>
                            <TableCell>ชื่ออะไหล่</TableCell>
                            <TableCell>จำนวน</TableCell>
                            <TableCell>หน่วย</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Stack direction='row-reverse' mt={2}>
                    <Button color='error' variant='contained'>ยกเลิก</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}
