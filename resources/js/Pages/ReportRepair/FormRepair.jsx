import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head} from "@inertiajs/react";
import ProductDetail from "@/Components/ProductDetail.jsx";
import {Divider, Grid2, Stack, Typography} from "@mui/material";
import UploadImages from "@/Components/UploadImages.jsx";

export default function FormRepair({detail}) {
    return (
        <AuthenticatedLayout>
            <Head title="แจ้งซ่อม"/>
            <div className="bg-white mt-4 p-4 ">
                <Stack direction='column' spacing={2}>
                    <ProductDetail {...detail} />
                    <Divider/>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{sm: 12, md: 4}}>
                            <UploadImages title={'ด้านหน้า'}/>
                        </Grid2>
                        <Grid2 size={{sm: 12, md: 8}}>
                            <Grid2 container spacing={2}>
                                <Grid2 size={12}>
                                    <Typography variant='h6'>หมายเหตุ</Typography>
                                    <textarea style={{width: '100%', borderRadius: 5, padding: 10, fontSize: 16}}
                                              placeholder={'joker on the rock'}></textarea>
                                </Grid2>
                                <Grid2 size={{sm: 12, md: 6}}>
                                    <Typography variant='h6' onClick={()=>console.log(detail)}>เลือกอาการ</Typography>

                                </Grid2>
                                <Grid2 size={{sm: 12, md: 6}}>
                                    <Typography variant='h6'>เลือกอะไหล่</Typography>
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </Stack>
            </div>
        </AuthenticatedLayout>
    )
}
