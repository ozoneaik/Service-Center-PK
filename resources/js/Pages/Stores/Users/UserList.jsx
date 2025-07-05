import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link, router, useForm, usePage} from "@inertiajs/react";
import {
    Alert,Box,Button,Chip,Grid2,Paper,Stack,Table,
    TableBody,TableCell,TableHead,TableRow,Typography
} from "@mui/material";
import React, {useState} from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {AlertDialogQuestion} from "@/Components/AlertDialog";
import ModalEditUser from "./ModalEditUser";

export default function UserList({users}) {
    const auth = usePage().props.auth.user;
    const {flash} = usePage().props;
    const [progress, setProgress] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [open, setOpen] = useState(false);
    const [userSelected, setUserSelected] = useState();


    const handleDelete = (user_code, name) => {
        AlertDialogQuestion({
            title: 'ยืนยันการลบผู้ใช้',
            text: `กดตกลงเพื่อ ลบ ผู้ใช้ ${name}`,
            onPassed: (confirm) => {
                confirm && deleteUser(user_code, name);
            }
        })
    }

    const deleteUser = (user_code, name) => {
        setProgress(true);
        router.delete(route('storeUsers.delete', {user_code: user_code}), {
            onFinish: () => {
                setShowAlert(true);
                setProgress(false);
            }
        })
    }
    return (
        <>
            {open && <ModalEditUser open={open} setOpen={setOpen} user={userSelected} onSave={(text) => {
                setShowAlert(true);
            }}/>}
            <AuthenticatedLayout>
                <Head title={'จัดการผู้ใช้'}/>
                <Paper elevation={3} sx={{p: 3}}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                <Typography variant="h5" sx={{mb: 2}}>รายการผู้ใช้งาน</Typography>
                                <Button
                                    variant="contained" startIcon={<PersonAddIcon/>}
                                    component={Link}
                                    href={route('storeUsers.create')}
                                >
                                    เพิ่มผู้ใช้
                                </Button>
                            </Stack>
                        </Grid2>
                        {showAlert && flash.success && (
                            <Grid2 size={12}>
                                <Alert severity="success" onClose={() => setShowAlert(false)}>{flash.success}</Alert>
                            </Grid2>
                        )}
                        <Grid2 size={12}>
                            <Box sx={{overflowX: 'auto'}}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{backgroundColor: '#f5f5f5'}}>
                                            <TableCell>รหัสผู้ใช้</TableCell>
                                            <TableCell>ชื่อผู้ใช้</TableCell>
                                            <TableCell>อีเมล</TableCell>
                                            <TableCell>สิทธิ์</TableCell>
                                            <TableCell>เจ้าของร้าน</TableCell>
                                            <TableCell>จัดการ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user, index) => {
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{user.user_code}</TableCell>
                                                    <TableCell>{user.name}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>{user.role}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            color={user.admin_that_branch ? 'primary' : 'secondary'}
                                                            label={user.admin_that_branch ? 'ใช่' : 'ไม่ใช่'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box display='flex' gap={2}>
                                                            <Button
                                                                disabled={progress}
                                                                variant='contained' color="info"
                                                                size="small" startIcon={<EditIcon/>}
                                                                onClick={() => {
                                                                    setUserSelected(user);
                                                                    setOpen(true);
                                                                }}
                                                            >
                                                                แก้ไข
                                                            </Button>
                                                            <Button
                                                                disabled={progress || user.user_code === auth.user_code}
                                                                variant="contained" color="error"
                                                                size="small" startIcon={<DeleteIcon/>}
                                                                onClick={() => handleDelete(user.user_code, user.name)}
                                                            >
                                                                ลบ
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Grid2>
                    </Grid2>
                </Paper>
            </AuthenticatedLayout>
        </>

    )
}
