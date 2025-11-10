import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    Box,
    Button,
    Container,
    Stack,
    TextField,
    Typography,
    Paper,
} from "@mui/material";
import { Save, ArrowBack } from "@mui/icons-material";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

export default function CreateWithdrawJob({ new_job_id, is_code_cust_id }) {
    const [jobId, setJobId] = useState(new_job_id || "");
    const [custId] = useState(is_code_cust_id || "");

    const handleSaveJob = () => {
        const dataToSave = {
            job_id: jobId,
            is_code_cust_id: custId,
            list: [],
        };

        router.post(route("withdrawJob.store"), { dataToSave });
    };

    return (
        <AuthenticatedLayout>
            <Head title="สร้างเอกสารเบิกอะไหล่" />
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        🧾 สร้างเอกสารเบิกอะไหล่ใหม่
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            label="เลขที่เอกสาร (Job ID)"
                            value={jobId}
                            fullWidth
                            disabled
                        />

                        <TextField
                            label="รหัสศูนย์บริการ"
                            value={custId}
                            fullWidth
                            disabled
                        />

                        <Stack direction="row" spacing={2} mt={2}>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<Save />}
                                onClick={handleSaveJob}
                                fullWidth
                            >
                                บันทึกและไปเลือกอะไหล่
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<ArrowBack />}
                                onClick={() => router.get(route("withdrawJob.index"))}
                                fullWidth
                            >
                                ย้อนกลับ
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}