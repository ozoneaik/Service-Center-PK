import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm } from "@inertiajs/react";
import LayoutMangeAdmin from "@/Pages/Admin/LayoutMangeAdmin.jsx";
import {
    Container,
    Card,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    Grid2,
    Stack,
    InputAdornment,
    FormControl,
    InputLabel
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function UserCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        role: "",
        password: "",
        password_confirmation: "",
        is_code_cust_id: "",
        shop_name: "",
        phone: "",
        admin_that_branch: "",
        address: ""
    });

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <AuthenticatedLayout>
            <Head title="สร้างผู้ใช้" />
                <Container maxWidth="false" sx={{ p: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <Typography variant='h6'>สร้างผู้ใช้</Typography>
                            </Grid2>
                            <Grid2 size={12}>
                                <Card variant='outlined' sx={{ p: 2 }}>
                                    <Typography fontWeight='bold' color='primary'>ข้อมูลผู้ใช้</Typography>
                                    <Grid2 container spacing={2} mt={2}>
                                        <Grid2 size={{ md: 6, xs: 12 }}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="ชื่อ-สกุล"
                                                name="name"
                                                value={data.name}
                                                onChange={handleChange}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <AccountCircle />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ md: 6, xs: 12 }}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="อีเมล"
                                                name="email"
                                                type="email"
                                                value={data.email}
                                                onChange={handleChange}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <AccountCircle />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ md: 6, xs: 12 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>บทบาท</InputLabel>
                                                <Select
                                                    variant='outlined'
                                                    name="role"
                                                    value={data.role}
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem value="admin">Admin</MenuItem>
                                                    <MenuItem value="service">Service</MenuItem>
                                                    <MenuItem value="dealer">Dealer</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid2>
                                    </Grid2>
                                </Card>
                            </Grid2>
                            <Grid2 size={12}>
                                <Card variant='outlined' sx={{ p: 2 }}>
                                    <Typography fontWeight='bold' color='primary'>ตั้งค่ารหัสผ่าน</Typography>
                                    <Grid2 container spacing={2}>
                                        <Grid2 size={{ md: 6, xs: 12 }}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="รหัสผ่าน"
                                                name="password"
                                                type="password"
                                                value={data.password}
                                                onChange={handleChange}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ md: 6, xs: 12 }}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="ยืนยันรหัสผ่าน"
                                                name="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={handleChange}
                                            />
                                        </Grid2>
                                    </Grid2>
                                </Card>
                            </Grid2>
                            <Grid2 size={12}>
                                <Card variant='outlined' sx={{ p: 2 }}>
                                    <Typography fontWeight='bold' color='primary'>ข้อมูลร้านค้า</Typography>
                                    <Grid2 container spacing={2}>
                                        <Grid2 size={{ md: 6, xs: 12 }}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="ชื่อร้านค้า"
                                                name="shop_name"
                                                value={data.shop_name}
                                                onChange={handleChange}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ md: 6, xs: 12 }}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="เบอร์โทรศัพท์"
                                                name="phone"
                                                value={data.phone}
                                                onChange={handleChange}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ md: 6, xs: 12 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>ผู้ดูแลสาขา</InputLabel>
                                                <Select
                                                    variant='outlined'
                                                    name="admin_that_branch"
                                                    value={data.admin_that_branch}
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem value="true">True</MenuItem>
                                                    <MenuItem value="false">False</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid2>
                                    </Grid2>
                                </Card>
                            </Grid2>
                            <Grid2 size={12}>
                                <Stack direction='row-reverse' spacing={2}>
                                    <Button type='submit' variant='contained' disabled={processing}>บันทึก</Button>
                                    <Button color='secondary' variant='contained'>ยกเลิก</Button>
                                </Stack>
                            </Grid2>
                        </Grid2>
                    </form>
                </Container>
        </AuthenticatedLayout>
    );
}
