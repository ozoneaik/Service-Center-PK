import { Button, Card, Grid2, Stack, Typography } from "@mui/material"

export const UploadFile = () => {
    return (
        <Grid2 container spacing={4}>
            {[1, 2, 3,4].map((item, index) => (
                <Grid2 size={12}>
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

        </Grid2>
    )
}
