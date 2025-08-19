import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Edit, Save } from "@mui/icons-material";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Grid2,
    TextField,
} from "@mui/material";
import { useState } from "react";

export default function PrinterIp({ printer_ip = null }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        printer_ip: printer_ip?.printer_ip || null,
        updated_by: printer_ip?.updated_by || null,
    });

    // handle change value ในฟอร์ม
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // handle save
    const handleSave = () => {
        // ส่งข้อมูลไป backend ด้วย inertia
        router.put(`/printer-ip/${printer_ip.id}`, formData, {
            onSuccess: () => {
                setIsEditing(false); // ปิดโหมดแก้ไข
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="จัดการเครื่องปริ้นต์" />
            <Container maxWidth="false" sx={{ bgcolor: "white", p: 3 }}>
                <Grid2 container spacing={2} sx={{ p: 3 }}>
                    <Grid2 size={12}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            ข้อมูลเครื่องปริ้นต์
                        </Typography>
                    </Grid2>

                    <Grid2 size={{xs : 12, md : 6}}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                            <CardContent>
                                {isEditing ? (
                                    <>
                                        <TextField
                                            label="IP เครื่องปริ้นต์"
                                            name="printer_ip"
                                            value={formData.printer_ip}
                                            onChange={handleChange}
                                            fullWidth
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            label="แก้ไขโดย"
                                            name="updated_by"
                                            value={formData.updated_by}
                                            onChange={handleChange}
                                            fullWidth
                                            sx={{ mb: 2 }}
                                        />

                                        <Grid2 container spacing={2}>
                                            <Grid2>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={handleSave}
                                                    startIcon={<Save/>}
                                                >
                                                    บันทึก
                                                </Button>
                                            </Grid2>
                                            <Grid2>
                                                <Button
                                                    variant="outlined"
                                                    color="inherit"
                                                    onClick={() =>
                                                        setIsEditing(false)
                                                    }
                                                >
                                                    ยกเลิก
                                                </Button>
                                            </Grid2>
                                        </Grid2>
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="h6" gutterBottom>
                                            รหัสร้าน: {printer_ip?.is_code_cust_id}
                                        </Typography>
                                        <Typography variant="body1">
                                            <b>IP เครื่องปริ้นต์:</b>{" "}
                                            {printer_ip?.printer_ip}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            <b>สร้างโดย:</b> {printer_ip?.created_by}
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>แก้ไขโดย:</b> {printer_ip?.updated_by}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            display="block"
                                            sx={{ mt: 2 }}
                                        >
                                            สร้างเมื่อ:{" "}
                                            {new Date(
                                                printer_ip?.created_at
                                            ).toLocaleString()}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            อัพเดทเมื่อ:{" "}
                                            {new Date(
                                                printer_ip?.updated_at
                                            ).toLocaleString()}
                                        </Typography>

                                        {/* ปุ่ม action */}
                                        <Grid2 container spacing={2} sx={{ mt: 3 }}>
                                            <Grid2>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => setIsEditing(true)}
                                                    startIcon={<Edit/>}
                                                >
                                                    แก้ไข
                                                </Button>
                                            </Grid2>
                                        </Grid2>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}