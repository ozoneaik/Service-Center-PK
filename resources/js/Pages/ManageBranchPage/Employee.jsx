import {Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";

export default function Employee({listEmployeeThatBranch}) {
    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ลำดับ</TableCell>
                        <TableCell>ชื่อ</TableCell>
                        <TableCell>อีเมล</TableCell>
                        <TableCell>สิทธิ์</TableCell>
                        <TableCell>จัดการ </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {listEmployeeThatBranch.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{'('}ID : {item.id}{')'} {item.name}</TableCell>
                            <TableCell>{item.email}</TableCell>
                            <TableCell>{item.role}</TableCell>
                            <TableCell>
                                <Stack direction='row' spacing={2}>
                                    <Button variant='contained' size='small'>แก้ไข</Button>
                                    <Button variant='contained' color='error' size='small'>ลบ</Button>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    )
}
