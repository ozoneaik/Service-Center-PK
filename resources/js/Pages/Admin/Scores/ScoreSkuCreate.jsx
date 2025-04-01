import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, useForm} from "@inertiajs/react";
import {
    Grid2,
    Paper,
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    FormHelperText,
    Box
} from "@mui/material";
import {useState, useEffect} from "react";

function ScoreSkuCreate({groups}) {
    const {data, setData, post, processing, errors} = useForm({
        status: 'active',
        sku: '',
        sku_name: '',
        group_product_ref: '',
        range_value_ref: '',
    });

    const [groupProducts, setGroupProducts] = useState([]);
    const [rangeValues, setRangeValues] = useState([]);

    // สมมติว่าเราจะดึงข้อมูลกลุ่มสินค้าและระดับคะแนนจาก API
    useEffect(() => {
        // ในโค้ดจริงคุณจะต้องเรียก API เพื่อดึงข้อมูลจริง
        // นี่เป็นเพียงข้อมูลตัวอย่าง
        setGroupProducts([
            {id: 'electronics', name: 'อิเล็กทรอนิกส์'},
            {id: 'appliance', name: 'เครื่องใช้ไฟฟ้า'},
            {id: 'mobile', name: 'โทรศัพท์มือถือ'},
        ]);

        setRangeValues([
            {id: 1, name: 'ระดับ 1', condition: 'ซ่อมเบื้องต้น'},
            {id: 2, name: 'ระดับ 2', condition: 'ซ่อมปานกลาง'},
            {id: 3, name: 'ระดับ 3', condition: 'ซ่อมขั้นสูง'},
        ]);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // post(route('skuScore.store')); // สมมติว่า route นี้มีอยู่
    };

    return (
        <AuthenticatedLayout>
            <Head title='จัดการ master คะแนน'/>
            <Paper sx={{backgroundColor: 'white', p: 3}}>
                <Typography variant="h6" gutterBottom>
                    เพิ่มคะแนน SKU ใหม่
                </Typography>
                <Divider sx={{mb: 3}}/>

                <form onSubmit={handleSubmit}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{xs: 12, md: 6}}>
                            <TextField
                                size='small'
                                fullWidth
                                label="รหัสสินค้า (SKU)"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                error={!!errors.sku}
                                helperText={errors.sku}
                                margin="normal"
                                required
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12, md: 6}}>
                            <TextField
                                size='small'
                                fullWidth
                                label="ชื่อสินค้า"
                                value={data.sku_name}
                                onChange={(e) => setData('sku_name', e.target.value)}
                                error={!!errors.sku_name}
                                helperText={errors.sku_name}
                                margin="normal"
                                required
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12, md: 6}}>
                            <FormControl fullWidth margin="normal" error={!!errors.group_product_ref} required>
                                <InputLabel>กลุ่มสินค้า</InputLabel>
                                <Select
                                    size='small'
                                    value={data.group_product_ref}
                                    label="กลุ่มสินค้า"
                                    onChange={(e) => setData('group_product_ref', e.target.value)}
                                    variant='outlined'>
                                    {groupProducts.map((group) => (
                                        <MenuItem key={group.id} value={group.id}>
                                            {group.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.group_product_ref && (
                                    <FormHelperText>{errors.group_product_ref}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid2>

                        <Grid2 size={{xs: 12, md: 6}}>
                            <FormControl fullWidth margin="normal" error={!!errors.range_value_ref} required>
                                <InputLabel>ความสามารถการซ่อม</InputLabel>
                                <Select
                                    size='small'
                                    value={data.range_value_ref}
                                    label="ความสามารถการซ่อม"
                                    onChange={(e) => setData('range_value_ref', e.target.value)}
                                    variant='outlined'>
                                    {groups.map((group,index) => (
                                        <MenuItem key={index} value={group.range_value}>
                                            {group.range_value} - {group.condition}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.range_value_ref && (
                                    <FormHelperText>{errors.range_value_ref}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid2>

                        <Grid2 size={{xs: 12, md: 6}}>
                            <FormControl fullWidth margin="normal" error={!!errors.status}>
                                <InputLabel>สถานะ</InputLabel>
                                <Select
                                    size='small'
                                    value={data.status}
                                    label="สถานะ"
                                    onChange={(e) => setData('status', e.target.value)}
                                    variant='outlined'>
                                    <MenuItem value="active">เปิดใช้งาน</MenuItem>
                                    <MenuItem value="inactive">ปิดใช้งาน</MenuItem>
                                </Select>
                                {errors.status && (
                                    <FormHelperText>{errors.status}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid2>

                        <Grid2 size={12}>
                            <Box sx={{mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2}}>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    component="a"
                                    // href={route('skuScore.index')} // สมมติว่ามี route นี้
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={processing}
                                >
                                    บันทึกข้อมูล
                                </Button>
                            </Box>
                        </Grid2>
                    </Grid2>
                </form>
            </Paper>
        </AuthenticatedLayout>
    );
}

export default ScoreSkuCreate;
