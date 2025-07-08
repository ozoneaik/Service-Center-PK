import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Grid2, Typography } from "@mui/material";

export default function WrList({warranties}) {
    console.log('warranties', warranties);
    return (
        <AuthenticatedLayout header={<Typography fontWeight='bold'>S/N ที่ลงทะเบียนรับประกันในระบบ</Typography>}>
            <Grid2 container spacing={2}>
                
            </Grid2>
        </AuthenticatedLayout>
    )
}