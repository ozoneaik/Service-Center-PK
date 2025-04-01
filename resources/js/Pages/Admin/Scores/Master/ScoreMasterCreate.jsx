import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, useForm} from "@inertiajs/react";
import {
    Grid2, Paper, Typography, TextField, Button, Alert, Snackbar,
    Box, Divider, InputAdornment, Container, Stack
} from "@mui/material";
import {useState} from "react";
import EngineeringIcon from '@mui/icons-material/Engineering';
import SchoolIcon from '@mui/icons-material/School';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

function ScoreMasterCreate() {
    // กำหนดค่าเริ่มต้นสำหรับฟอร์ม
    const {data, setData, post, processing, errors, reset} = useForm({
        range_value: '',
        range_name: '',
        condition: '',
        group_product: ''
    });

    // state สำหรับการแสดง Snackbar แจ้งเตือน
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // ฟังก์ชันสำหรับการจัดการข้อมูลที่มีการเปลี่ยนแปลง
    const handleChange = (e) => {
        const {name, value} = e.target;
        setData(name, value);
    };
    // ฟังก์ชันสำหรับการส่งข้อมูล
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('ScoreMaster.store'), {
            onSuccess: () => {
                setSnackbarMessage('บันทึกข้อมูลเรียบร้อยแล้ว');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                reset();
            },
            onError: () => {
                setSnackbarMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            }
        });
    };

    // ฟังก์ชันสำหรับการปิด Snackbar
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title='จัดการ master คะแนน'/>
            <Container sx={{mt: 3}}>
                <Paper
                    elevation={3}
                    sx={{backgroundColor: 'white', p: 0, borderRadius: 2, overflow: 'hidden'}}
                >
                    <Box sx={{bgcolor: 'primary.main', color: 'white', py: 2, px: 3}}>
                        <Typography variant="h6">เพิ่มข้อมูล Master คะแนน</Typography>
                    </Box>
                    <Divider/>

                    <Box sx={{p: 3}}>
                        <form onSubmit={handleSubmit}>
                            <Grid2 container spacing={3}>
                                {/* ความสามารถการซ่อม */}
                                <Grid2 size={{xs: 12, md: 6}}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        label="ความสามารถการซ่อม (ตัวเลข)"
                                        required
                                        name="range_value"
                                        type="number"
                                        value={data.range_value}
                                        onChange={handleChange}
                                        error={!!errors.range_value}
                                        helperText={errors.range_value}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EngineeringIcon color="primary"/>
                                                </InputAdornment>
                                            ),
                                        }}

                                    />
                                </Grid2>

                                {/* ระดับการอบรม */}
                                <Grid2 size={{xs: 12, md: 6}}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        label="ระดับการอบรม"
                                        required
                                        name="range_name"
                                        value={data.range_name}
                                        onChange={handleChange}
                                        error={!!errors.range_name}
                                        helperText={errors.range_name}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SchoolIcon color="primary"/>
                                                </InputAdornment>
                                            ),
                                        }}

                                    />
                                </Grid2>

                                {/* เงื่อนไข */}
                                <Grid2 size={{xs: 12, md: 6}}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        label="เงื่อนไข"
                                        required
                                        name="condition"
                                        value={data.condition}
                                        onChange={handleChange}
                                        error={!!errors.condition}
                                        helperText={errors.condition}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <ListAltIcon color="primary"/>
                                                </InputAdornment>
                                            ),
                                        }}

                                    />
                                </Grid2>

                                {/* กลุ่มสินค้า */}
                                <Grid2 size={{xs: 12, md: 6}}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        label="กลุ่มสินค้า"
                                        name="group_product"
                                        required
                                        value={data.group_product}
                                        onChange={handleChange}
                                        error={!!errors.group_product}
                                        helperText={errors.group_product}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CategoryIcon color="primary"/>
                                                </InputAdornment>
                                            ),
                                        }}

                                    />
                                </Grid2>

                                {/* ปุ่มการทำงาน */}
                                <Grid2 size={12} sx={{mt: 2}}>
                                    <Stack direction='row' spacing={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            disabled={processing}
                                            startIcon={<SaveIcon/>}
                                        >
                                            บันทึกข้อมูล
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => reset()}
                                            startIcon={<RestartAltIcon/>}
                                        >
                                            ล้างข้อมูล
                                        </Button>
                                    </Stack>
                                </Grid2>
                            </Grid2>
                        </form>
                    </Box>

                    <Snackbar
                        open={openSnackbar}
                        autoHideDuration={6000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                    >
                        <Alert
                            onClose={handleCloseSnackbar}
                            severity={snackbarSeverity}
                            variant="filled"
                            sx={{width: '100%'}}
                        >
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}

export default ScoreMasterCreate;
