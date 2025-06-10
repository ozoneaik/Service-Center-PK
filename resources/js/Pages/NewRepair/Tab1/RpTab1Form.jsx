import {Button, Card, CardContent, Grid2, Stack, Typography} from "@mui/material";
import {HeaderTitle} from "@/Pages/NewRepair/HeaderCardTitle.jsx";
import RpCustomerForm from "@/Pages/NewRepair/Tab1/RpCustomerForm.jsx";
import RpSRA from "@/Pages/NewRepair/Tab1/RpSRA.jsx";
import RpUploadFileBeforeForm from "@/Pages/NewRepair/Tab1/RpUploadFileBeforeForm.jsx";
import {Save} from "@mui/icons-material";

export default function RpTab1Form() {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert('submit')
    }
    return (
        <form onSubmit={handleSubmit}>
            <Grid2 container spacing={2}>
                <Grid2 size={12}>
                    <Card
                        variant='outlined'
                        sx={(theme) => (
                            {backgroundColor: theme.palette.cardFormRpColor.main}
                        )}
                    >
                        <CardContent>
                            <HeaderTitle headTitle='ข้อมูลลูกค้า'/>
                            <RpCustomerForm/>
                        </CardContent>
                    </Card>
                </Grid2>
                <Grid2 size={12}>
                    <Card
                        variant='outlined'
                        sx={(theme) => (
                            {backgroundColor: theme.palette.cardFormRpColor.main}
                        )}
                    >
                        <CardContent>
                            <HeaderTitle headTitle='อาการเบื้องต้น'/>
                            <RpSRA/>
                        </CardContent>
                    </Card>
                </Grid2>
                <Grid2 size={12}>
                    <Card
                        variant='outlined'
                        sx={(theme) => (
                            {backgroundColor: theme.palette.cardFormRpColor.main}
                        )}
                    >
                        <CardContent>
                            <HeaderTitle headTitle='สภาพสินค้าก่อนซ่อม'/>
                            <RpUploadFileBeforeForm/>
                        </CardContent>
                    </Card>
                </Grid2>
                <Grid2 size={12}>
                    <Stack direction='row' spacing={2} justifyContent='end'>
                        <Button variant='contained' startIcon={<Save/>} type='submit'>
                            บันทึก
                        </Button>
                    </Stack>
                </Grid2>
            </Grid2>
        </form>
    )
}
