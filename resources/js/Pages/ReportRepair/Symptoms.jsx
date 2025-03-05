import {Button, Grid2, Stack} from "@mui/material";

export default function Symptoms() {
    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                <textarea style={{width : '100%'}} placeholder='กรอกอาการเบื้องต้น'></textarea>
            </Grid2>
            <Grid2 size={12}>
                <Stack direction='row-reverse'>
                    <Button variant='contained' color='primary'>
                        บันทึก
                    </Button>
                </Stack>
            </Grid2>
        </Grid2>
    )
}
