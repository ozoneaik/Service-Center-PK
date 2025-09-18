import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Add, Delete, Save, Search } from "@mui/icons-material";
import { Box, Button, Container, FormControl, FormControlLabel, FormLabel, Grid2, IconButton, InputLabel, Radio, RadioGroup, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { TableStyle } from "../../../../css/TableStyle";
import { useState } from "react";

export default function CreateStockJob({ new_job_id, sp_list = [], job_type = 'add' }) {
    const [spList, setSpList] = useState(sp_list);
    const [jobType, setJobType] = useState(job_type);

    const handleChangeType = (e) => {
        alert(e.target.value)
        setJobType(e.target.value);
    }
    return (
        <AuthenticatedLayout>
            <Head title="สร้าง job" />
            <Container maxWidth="false" sx={{ backgroundColor: 'white', p: 3 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <Box display='flex' justifyContent='flex-start' alignItems='center' gap={2}>
                                <Typography fontSize={20} fontWeight='bold'>
                                    สร้าง #{new_job_id}
                                </Typography>
                                <Typography variant="body2">เลือกประเภทของ job</Typography>
                                <FormControl>
                                    <RadioGroup name="select-type" defaultValue={jobType} row onChange={handleChangeType}>
                                        <FormControlLabel value="add" control={<Radio />} label="เพิ่ม" />
                                        <FormControlLabel value="remove" control={<Radio />} label="ลด" />
                                    </RadioGroup>
                                </FormControl>

                            </Box>
                            <Button
                                variant="contained" color="warning"
                                onClick={() => alert('กำลังพัฒนา')}
                            >
                                import
                            </Button>
                        </Box>
                    </Grid2>
                    <Grid2 size={12}>
                        <Box display='flex' gap={2} justifyContent='flex-start'>
                            <TextField fullWidth placeholder="รหัสอะไหล่ เช่น SP50277-01" size="small" />
                            <Button sx={{ minWidth: 100 }} size="small" startIcon={<Search />} variant="outlined">
                                ค้นหา
                            </Button>
                            <TextField fullWidth placeholder="จะแสดงชื่ออะไหล่ เมื่อค้นหา" size="small" disabled />
                            <TextField fullWidth placeholder="จะแสดงหน่วยอะไหล่ เมื่อค้นหา" size="small" disabled />
                            <TextField fullWidth placeholder="จำนวน" type="number" size="small" />
                            <Button sx={{ minWidth: '200px' }} size="small" variant="contained" startIcon={<Add />}>
                                เพิ่มรายการ
                            </Button>
                        </Box>
                    </Grid2>
                    <Grid2 size={12}>
                        <Table>
                            <TableHead>
                                <TableRow sx={TableStyle.TableHead}>
                                    <TableCell>รหัสอะไหล่</TableCell>
                                    <TableCell>ชื่ออะไหล่</TableCell>
                                    <TableCell>หน่วย</TableCell>
                                    <TableCell>จำนวน</TableCell>
                                    <TableCell>สต๊อกคงเหลือ</TableCell>
                                    <TableCell>สต็อกคงเหลือพร้อมใช้งาน</TableCell>
                                    <TableCell>สต็อกหลังปรับ</TableCell>
                                    <TableCell align="center">#</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {spList.length > 0 ? (
                                    spList.map((sp, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{sp.sp_code}</TableCell>
                                            <TableCell>{sp.sp_name}</TableCell>
                                            <TableCell>{sp.sp_unit}</TableCell>
                                            <TableCell>{sp.sp_qty}</TableCell>
                                            <TableCell>{sp.sp_qty}</TableCell>
                                            <TableCell>{sp.sp_qty}</TableCell>
                                            <TableCell>{sp.sp_qty}</TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => alert('กำลังพัฒนา')}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            ไม่พบข้อมูล
                                        </TableCell>
                                    </TableRow>
                                )}

                            </TableBody>
                        </Table>
                    </Grid2>
                    <Grid2 size={12}>
                        <Box display='flex' justifyContent='center'>
                            <Button
                                disabled={spList.length < 1}
                                variant="contained" startIcon={<Save />}
                            >
                                บันทึก
                            </Button>
                        </Box>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}