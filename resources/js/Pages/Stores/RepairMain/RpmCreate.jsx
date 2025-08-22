import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Save } from "@mui/icons-material";
import { Button, Container, FormControl, FormLabel, Grid2, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function RpmCreate({ store }) {
    const [form, setForm] = useState({
        technician_name: "",
        technician_nickname: "",
        technician_phone: "",
        is_code_cust_id: store.is_code_cust_id,
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route("repairMan.store"), form);
    };

    

    return (
        <AuthenticatedLayout>
            <Head title="สร้างช่างซ่อม" />
            <Container maxWidth="md" sx={{ mt: 3, p: 3, bgcolor: "white" }}>
                <form onSubmit={handleSubmit}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Typography fontSize={20} fontWeight='bold'>
                                สร้างช่างซ่อม ของร้าน {store.shop_name}
                            </Typography>
                        </Grid2>
                        <Grid2 size={{ sm: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <FormLabel>ชื่อช่าง</FormLabel>
                                <TextField
                                    required
                                    size="small"
                                    name="technician_name"
                                    value={form.technician_name}
                                    onChange={handleChange}
                                    placeholder="กรอกชื่อช่าง"
                                />
                            </FormControl>
                        </Grid2>

                        <Grid2 size={{ sm: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <FormLabel>ชื่อเล่น</FormLabel>
                                <TextField
                                    required
                                    size="small"
                                    name="technician_nickname"
                                    value={form.technician_nickname}
                                    onChange={handleChange}
                                    placeholder="กรอกชื่อเล่น"
                                />
                            </FormControl>
                        </Grid2>

                        <Grid2 size={{ sm: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <FormLabel>เบอร์โทร</FormLabel>
                                <TextField
                                    required
                                    size="small"
                                    name="technician_phone"
                                    value={form.technician_phone}
                                    onChange={handleChange}
                                    placeholder="กรอกเบอร์โทร"
                                />
                            </FormControl>
                        </Grid2>

                        <Grid2 size={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined" color="secondary"
                                    onClick={() => history.back()}
                                >
                                    ยกเลิก / ย้อนกลับ
                                </Button>
                                <Button
                                    type="submit" variant="contained"
                                    color="primary" startIcon={<Save/>}
                                >
                                    บันทึก
                                </Button>
                            </Stack>
                        </Grid2>
                    </Grid2>
                </form>
            </Container>
        </AuthenticatedLayout >
    );
}
