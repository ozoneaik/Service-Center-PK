import { Button, Card, Grid2, Stack, Typography } from "@mui/material"
import {useEffect, useState} from "react";
import Progress from "@/Components/Progress.jsx";

export const UploadFile = () => {
    const [loading, setLoading] = useState(false);
    useEffect(() => {

    }, []);
    return (
        <>
            {!loading ? (
                <Grid2 container spacing={4}>
                    {[1, 2, 3,4].map((item, index) => (
                        <Grid2 size={12} key={index}>
                            <Typography fontWeight='bold'>สถาพสินค้าหลังซ่อม</Typography>
                            <Stack direction='row' spacing={2}>
                                <Card sx={{ width: 150, height: 150 }}>
                                    <img src="" alt="no image" />
                                </Card>
                                <Button variant="outlined" sx={{ width: 150, height: 150 }}>
                                    + เพิ่มรูปภาพ
                                </Button>
                            </Stack>
                        </Grid2>
                    ))}
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='end' spacing={2}>
                            <Button variant='contained'>บันทึก</Button>
                            <Button variant='contained' color='secondary'>ยกเลิก</Button>
                        </Stack>
                    </Grid2>
                </Grid2>
            ) : <Progress/>}
        </>
    )
}
