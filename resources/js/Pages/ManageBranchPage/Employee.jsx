import { Box, Button, Card, Grid2, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { usePage } from "@inertiajs/react";
export default function Employee({ listEmployeeThatBranch }) {
    const user = usePage().props.auth.user;
    return (
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, display: 'flex', alignItems: 'center' }}>
                <PersonAddIcon sx={{ mr: 1.5 }} />
                <Typography variant='h6' fontWeight="bold">รายการผู้ใช้ศูนย์ซ่อม {user.store_info.shop_name}</Typography>
            </Box>
            <Card sx={{ p: 3, boxShadow: 'none',overflow : 'auto' }} >
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {['ลำดับ', 'ชื่อ', 'อีเมล', 'สิทธิ์', 'จัดการ'].map((item, index) => (
                                        <TableCell key={index} sx={TABLE_HEADER_STYLE}>{item}</TableCell>
                                    ))}
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
                                            <Stack direction='column' spacing={2}>
                                                <Button variant='contained' size='small'>
                                                    <ModeEditIcon />
                                                </Button>
                                                <Button variant='contained' color='error' size='small'>
                                                    <DeleteIcon />
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Grid2>
                </Grid2>
            </Card>
        </Paper>
    )
}

const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 14
};
