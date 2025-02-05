import {Button, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import PreviewIcon from "@mui/icons-material/Preview";
import {useState} from "react";
import DialogDetail from "@/Pages/SpareClaim/DialogDetail.jsx";

export default function AlreadyClaim(){
    const [open, setOpen] = useState(false);
    return (
        <>
            {open && <DialogDetail open={open} setOpen={setOpen} data={[1,2,3,4]}/>}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{fontWeight : 'bold'}} colSpan={6}>
                            รายการอะไหล่พร้อมเคลม
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><Checkbox/></TableCell>
                        <TableCell>รหัสอะไหล่</TableCell>
                        <TableCell>ชื่ออะไหล่</TableCell>
                        <TableCell>จำนวน</TableCell>
                        <TableCell>หน่วย</TableCell>
                        <TableCell>รายละเอียด</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell><Checkbox/></TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>4</TableCell>
                        <TableCell>
                            <Button onClick={()=>setOpen(true)}>
                                <PreviewIcon/>
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    )
}
