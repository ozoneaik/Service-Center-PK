import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Box, Grid2, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import React from "react";

export default function UserList(){
    return (
        <AuthenticatedLayout>
            <Head title={'จัดการผู้ใช้'}/>
            <Grid2 container spacing={2}>
                <Grid2 size={12}>
                    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>รายการผู้ใช้งาน</Typography>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell>ชื่อร้าน</TableCell>
                                        <TableCell>ชื่อผู้ใช้</TableCell>
                                        <TableCell>อีเมล</TableCell>
                                        <TableCell>สิทธิ์</TableCell>
                                        <TableCell>เจ้าของร้าน</TableCell>
                                        <TableCell>จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>

                                </TableBody>
                            </Table>
                        </Box>
                    </Paper>
                </Grid2>
            </Grid2>
        </AuthenticatedLayout>
    )
}
