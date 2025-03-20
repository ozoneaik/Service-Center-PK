import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Button, Container, Grid2 } from "@mui/material";
import { useState } from "react";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import GP from "@/Pages/ManageBranchPage/GP.jsx";
import Employee from "@/Pages/ManageBranchPage/Employee.jsx";
import CreateEmployeeThatBranch from "@/Pages/ManageBranchPage/CreateEmployeeThatBranch.jsx";
import { Link } from "@inertiajs/react";

export default function Manage({ listEmployeeThatBranch, gp, user }) {
    const [gpVal, setGpVal] = useState(gp);

    const onSubmit = (e) => {
        e.preventDefault();
        AlertDialogQuestion({
            text: 'กด ตกลง เพื่อสร้างหรืออัพเดท GP', onPassed: async (confirm) => {
                if (confirm) {
                    await addGp();
                }
            }
        })
    }

    const addGp = async () => {
        let Status, Message, Title;
        try {
            const { data, status } = await axios.post('/gp/store', {
                is_code_cust_id: user.is_code_cust_id,
                auth_key: user.id,
                gp_val: gpVal
            })
            Status = status;
            Message = data.message;
            Title = 'สำเร็จ';
        } catch (error) {
            Status = error.response.status
            Title = 'ไม่สำเร็จ';
            Message = error.response.data.message;
        } finally {
            AlertDialog({
                icon: Status === 200 ? 'success' : 'error',
                title: Title,
                text: Message,
                onPassed: () => {
                }
            })
        }
    }
    return (
        <AuthenticatedLayout>
            <Container maxWidth='false'>
                <Grid2 container spacing={2} mt={2}>
                    <Grid2 size={{ md: 8, sm: 12 }}>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <CreateEmployeeThatBranch listEmployeeThatBranch={listEmployeeThatBranch} />
                            </Grid2>
                            <Grid2 size={12}>
                                <Employee listEmployeeThatBranch={listEmployeeThatBranch} />
                            </Grid2>

                        </Grid2>
                    </Grid2>
                    <Grid2 size={{ md: 4, sm: 12 }}>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <GP gpVal={gpVal} setGpVal={setGpVal} onSubmit={onSubmit} />
                            </Grid2>
                            <Grid2 size={12}>
                                <Button
                                    sx={{ height: '4rem',fontSize: '1.5rem' }}
                                    variant="contained" color="info"
                                    component={Link} fullWidth
                                    href={route('stockSp.list', { is_code_cust_id: user.is_code_cust_id })}
                                >
                                    จัดการสต็อกอะไหล่
                                </Button>
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
