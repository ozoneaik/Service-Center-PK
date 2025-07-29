import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head, useForm} from "@inertiajs/react";
import {
    Box, Button, Container, FormControl,
    FormLabel, Grid2, MenuItem, Select, Stack,
    TextField, Typography
} from "@mui/material";
import {Save} from "@mui/icons-material";

export default function DmCreateUpdate({dm_data, action}) {
    const {data, setData,post, processing} = useForm({
        id : dm_data.id,
        sku_code: dm_data.sku_code,
        fac_model: dm_data.fac_model,
        dm_type: dm_data.dm_type,
        layer: dm_data.layer ,
        path_file : dm_data.path_file,
        multi_form : false,
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data, action)
        post(route('admin.diagram.store'),{
            onFinish : (e) => {
                console.log(e)
            }
        })
    }

    const handleOnChange = (e) => {
        const {name, value} = e.target;
        setData(name, value);
    }
    return (
        <AuthenticatedLayout>
            <Head title="สร้างไดอะแกรม"/>
            <Container sx={{bgcolor: 'white', p: 3, mt: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography fontSize={20} fontWeight='bold'>
                            {action === 'edit' ? 'อัพเดทไดอะแกรม' : 'สร้างไดอะแกรม'}
                        </Typography>
                    </Grid2>
                    <Grid2 size={3}>
                        <Box height={300} width={200}>
                            <img src={data.path_file} width='100%' height='100%' alt="no image"/>
                        </Box>
                    </Grid2>
                    <Grid2 size={9}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                {action === 'edit' && (
                                    <FormControl>
                                        <FormLabel htmlFor='sku_code'>id</FormLabel>
                                        <TextField
                                            value={data.id} disabled
                                            id='sku_code' name='sku_code' size='small'
                                        />
                                    </FormControl>
                                )}
                                <FormControl>
                                    <FormLabel htmlFor='sku_code'>รหัสสินค้า</FormLabel>
                                    <TextField
                                        value={data.sku_code}
                                        onChange={handleOnChange} fullWidth
                                        id='sku_code' name='sku_code' size='small'
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor='fac_model'>รุ่นโมเดล</FormLabel>
                                    <TextField
                                        value={data.fac_model}
                                        onChange={handleOnChange} fullWidth
                                        id='fac_model' name='fac_model' size='small'
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor='dm_type'>ประเภทไดอะแกรม</FormLabel>
                                    <Select
                                        value={data.dm_type}
                                        value={data.dm_type}
                                        onChange={handleOnChange} size='small'
                                        name='dm_type' id='dm_type' variant='outlined'
                                    >
                                        <MenuItem value='DM01'>DM01</MenuItem>
                                        <MenuItem value='DM02'>DM02</MenuItem>
                                        <MenuItem value='DM03'>DM03</MenuItem>
                                        <MenuItem value='DM04'>DM04</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor='layer'>เลเยอร์</FormLabel>
                                    <TextField
                                        value={data.layer}
                                        onChange={handleOnChange} fullWidth
                                        id='layer' name='layer' size='small'
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor='path_file'>ที่อยู่รูปภาพ</FormLabel>
                                    <TextField
                                        value={data.path_file}
                                        onChange={handleOnChange} fullWidth
                                        id='path_file' name='path_file' size='small'
                                    />
                                </FormControl>
                                <Stack direction='row-reverse'>
                                    <Button loading={processing} variant='contained' type='submit' startIcon={<Save/>}>
                                        {action === 'edit' ? 'อัพเดท' : 'สร้าง'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </form>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
