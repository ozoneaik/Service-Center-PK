import { Table, TableHead, TableBody, TableRow, TableCell, Button, Typography, Stack, Box } from "@mui/material";
import { TableStyle } from "../../../../css/TableStyle";
import { Delete, Edit } from "@mui/icons-material";

export default function RpmListDesktopView({ repair_mans, onSoftDelete }) {
    return (
        <Table stickyHeader>
            <TableHead>
                <TableRow>
                    <TableCell sx={TableStyle.TableHead}>ไอดี</TableCell>
                    <TableCell sx={TableStyle.TableHead}>ชื่อช่างซ่อม</TableCell>
                    <TableCell sx={TableStyle.TableHead}>เบอร์โทร</TableCell>
                    <TableCell align="center" sx={TableStyle.TableHead}>#</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {repair_mans.map((repair_man) => (
                    <TableRow key={repair_man.id}>
                        <TableCell>
                            {repair_man.id}
                        </TableCell>
                        <TableCell>
                            {repair_man.technician_name} ({repair_man.technician_nickname})
                        </TableCell>
                        <TableCell>
                            {repair_man.technician_phone}
                        </TableCell>
                        <TableCell>
                            <Box display='flex' flexWrap='nowrap' gap={2} justifyContent='center'>
                                <Button
                                    variant="outlined" size="small"
                                    color="warning" startIcon={<Edit />}
                                >
                                    แก้ไข
                                </Button>
                                <Button
                                    onClick={() => onSoftDelete(repair_man)}
                                    variant="outlined" size="small"
                                    color="error" startIcon={<Delete />}
                                >
                                    ลบ
                                </Button>
                                <Button variant="outlined" size="small">
                                    รายละเอียด
                                </Button>
                            </Box>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}