import { Grid2, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export default function TableSpList({ sparePart }) {
    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                <Paper sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>รหัสอะไหล่</TableCell>
                                <TableCell>ชื่ออะไหล่</TableCell>
                                <TableCell>จำนวน</TableCell>
                                <TableCell>หน่วย</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sparePart.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.spcode}</TableCell>
                                    <TableCell>{item.spname}</TableCell>
                                    <TableCell>{item.qty}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </Paper>

            </Grid2>

        </Grid2>

    )
}
