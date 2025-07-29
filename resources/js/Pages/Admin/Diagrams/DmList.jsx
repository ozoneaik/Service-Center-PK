import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head, router} from "@inertiajs/react";
import {
    Box, Button, Container, Grid2, Stack, Typography,
    Table, TableBody, TableCell, TableHead, TableRow, TextField,
} from "@mui/material";
import {Add, Delete, Edit, FileUpload, Search} from "@mui/icons-material";
import {TableStyle} from "../../../../css/TableStyle.js";
import {AlertDialogQuestion} from "@/Components/AlertDialog.js";
import {useState} from "react";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";

export default function DmList({dm_list}) {
    const [previewImage, setPreviewImage] = useState('');
    const [selectedPreview, setSelectedPreview] = useState(false);

    const imageNotFound = (e) => {
        e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT;
    }

    const handleDelete = (dm) => {
        AlertDialogQuestion({
            text: `กดตกลงเพื่อลบ ${dm.id} ${dm.sku_code}`,
            onPassed: async (confirm) => {
                if (confirm) {
                    router.delete(route('admin.diagram.destroy',{id : dm.id}));
                }
            }
        })
    }

    const handleEdit = (id) => {
        router.get(route('admin.diagram.edit', {id}))
    }

    const handleCreate = () => {
        router.get(route('admin.diagram.create'));
    }

    const handleCreateExel = () => {
        router.get(route('admin.diagram.create.excel'));
    }

    const handleShowImage = (path_file) => {
        setPreviewImage(path_file);
        setSelectedPreview(true)
    }
    return (
        <AuthenticatedLayout>
            {selectedPreview &&
                <SpPreviewImage open={selectedPreview} setOpen={setSelectedPreview} imagePath={previewImage}/>
            }
            <Head title="รายการไดอะแกรม"/>
            <Container maxWidth='false' sx={{bgcolor: 'white', p: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography fontSize={20} fontWeight='bold'>รายการไดอะแกรม</Typography>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between'>
                            <Stack direction='row' spacing={2} justifyContent='end' alignItems='center'>
                                <TextField size='small' label='ค้นหา'/>
                                <TextField size='small' label='ค้นหา'/>
                                <TextField size='small' label='ค้นหา'/>
                                <Button variant='contained' startIcon={<Search/>}>
                                    ค้นหา
                                </Button>
                            </Stack>
                            <Stack direction='row' spacing={2} justifyContent='end' alignItems='center'>
                                <Button
                                    variant='contained' color='success' startIcon={<FileUpload/>}
                                    onClick={handleCreateExel}
                                >
                                    เพิ่มรายการไดแกรมผ่าน exel
                                </Button>
                                <Button
                                    variant='contained' startIcon={<Add/>}
                                    onClick={handleCreate}
                                >
                                    เพิ่มรายการไดอะแกรม
                                </Button>
                            </Stack>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12} maxHeight={600} overflow='auto'>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={TableStyle.TableHead}>รูปภาพ</TableCell>
                                    <TableCell sx={TableStyle.TableHead}>รหัสสินค้า</TableCell>
                                    <TableCell sx={TableStyle.TableHead}>โมเดล</TableCell>
                                    <TableCell sx={TableStyle.TableHead}>DM</TableCell>
                                    <TableCell sx={TableStyle.TableHead}>เลเยอร์</TableCell>
                                    <TableCell sx={TableStyle.TableHead} align='center'>
                                        จัดการ
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dm_list.data.map((dm, index) => (
                                    <TableRow key={index}>
                                        <TableCell onClick={() => handleShowImage(dm.path_file)}>
                                            <Box height={80} width={80}>
                                                <img
                                                    height='100%' width='100%' alt={dm.sku_code}
                                                    src={dm.path_file} loading='lazy' onError={imageNotFound}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>{dm.sku_code}</TableCell>
                                        <TableCell>{dm.fac_model}</TableCell>
                                        <TableCell>{dm.dm_type}</TableCell>
                                        <TableCell>{dm.layer}</TableCell>
                                        <TableCell>
                                            <Stack spacing={2} direction='row' justifyContent='center'>
                                                <Button
                                                    size='small' color='error' variant='outlined'
                                                    startIcon={<Delete/>} onClick={() => handleDelete(dm)}
                                                >
                                                    ลบ
                                                </Button>
                                                <Button
                                                    size='small' color='warning' variant='outlined'
                                                    startIcon={<Edit/>} onClick={() => handleEdit(dm.id)}
                                                >
                                                    แก้ไข
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
