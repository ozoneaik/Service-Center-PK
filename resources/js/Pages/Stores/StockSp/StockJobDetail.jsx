import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {useRef, useState} from "react";
import {
    Box, TextField, Button, Typography, Grid2, Paper, Container,
    List, ListItem, ListItemText, ListItemButton, Divider, IconButton, Alert, InputAdornment, Stack, Chip, useMediaQuery
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PasswordIcon from '@mui/icons-material/Password';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {router, useForm, usePage} from "@inertiajs/react";
import {AlertDialogQuestion} from "@/Components/AlertDialog.js";
import axios from "axios";
import {Done} from "@mui/icons-material";

export default function StockJobDetail({stock_job_id, jobDetail, stockJob}) {
    const isMobile = useMediaQuery('(max-width:600px)');
    const {flash} = usePage().props
    const [alert, setAlert] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isNewItem, setIsNewItem] = useState(false);
    const {data, setData, processing, post, errors} = useForm({
        sp_code: "", sp_name: "", sku_code: "", sku_name: "", sp_qty: 1,
    });

    const [searchingSpName, setSearchingSpName] = useState(false);

    const delaySearch = useRef(null);

    const handleSelectItem = (index) => {
        if (jobDetail && jobDetail[index]) {
            setSelectedIndex(index);
            setIsNewItem(false);
            setData('sp_code', jobDetail[index].sp_code || "");
            setData('sp_name', jobDetail[index].sp_name || "");
            setData('sku_code', jobDetail[index].sku_code || "");
            setData('sku_name', jobDetail[index].sku_name || "");
            setData('sp_qty', jobDetail[index].sp_qty || "");
        }
    };

    const handleDeleteItem = (item) => {
        AlertDialogQuestion({
            text: `กดตกลงเพื่อลบรหัสอะไหล่ ${item.sp_code}`,
            onPassed: (confirm) => {
                confirm && router.delete(route('stockJob.deleteSp', {
                    stock_job_id: stock_job_id,
                    sp_code: item.sp_code
                }), {
                    onFinish: () => {
                        setAlert(true);
                    }
                })
            }
        })
    }

    const handleNewItem = () => {
        setSelectedIndex(null);
        setIsNewItem(true);
        setData('sp_code', "");
        setData('sp_name', "");
        setData('sku_code', "");
        setData('sku_name', "");
        setData('sp_qty', "");
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setData(name, value);
        if (name === 'sp_code') {
            if (delaySearch.current) {
                clearTimeout(delaySearch.current)
            }
            delaySearch.current = setTimeout(() => {
                searchSpName(value).finally(() => setSearchingSpName(false))
            }, [1000])

        }
    };

    const searchSpName = async (sp_code) => {
        try {
            setSearchingSpName(true)
            const {data, status} = await axios.post(route('search-sp', {sp_code}))
            console.log(data, status);
            setData('sp_name', data.sp_name)

        } catch (error) {
            setData('sp_name', null);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("ข้อมูลที่ส่ง:", data);
        post(route('stockJob.addSpInJob', {stock_job_id: stock_job_id}), {
            onFinish: () => {
                setAlert(true)
            }
        })
        console.log(errors)
    };

    const handleEndJob = () => {
        router.post(route('stockJob.endSpInJob', {
            stock_job_id: stock_job_id,
        }), {}, {
            onFinish: (e) => {
                console.log(e)
                setAlert(true);
            }
        })
    }

    return (
        <AuthenticatedLayout>
            <Container maxWidth="false" sx={{mt: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography variant="h5" fontWeight='bold'>
                            <Paper variant='outlined' sx={{bgcolor: 'white', py: 2, px: 1}}>
                                <Stack
                                    spacing={2} direction={isMobile ? 'column' : 'row'}
                                    justifyContent='space-between'
                                >
                                    <Typography fontSize={20} fontWeight='bold'>
                                        รายละเอียดงานสต็อก #{stock_job_id}
                                    </Typography>
                                    <Chip
                                        label={stockJob.job_status}
                                        color={stockJob.job_status === 'success' ? 'success' : 'primary'}
                                    />
                                </Stack>
                            </Paper>
                        </Typography>
                    </Grid2>
                    <Grid2 size={12}>
                        {alert && flash.error && (
                            <Alert onClose={() => setAlert(false)} severity='error'>
                                {flash.error}
                            </Alert>
                        )}
                        {alert && flash.success && (
                            <Alert onClose={() => setAlert(false)} severity='success'>
                                {flash.success}
                            </Alert>
                        )}
                    </Grid2>


                    <Grid2 size={{xs: 12, md: 4, lg: 7}}>
                        <Paper variant='outlined' sx={{height: "100%", minHeight: 400}}>
                            <Box sx={{px: 2, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <Typography variant="body1" fontWeight='bold'>รายการอะไหล่</Typography>
                                <IconButton disabled={stockJob.job_status === 'success'} color="primary"
                                            onClick={handleNewItem} title="เพิ่มรายการใหม่">
                                    <AddIcon/>
                                </IconButton>
                            </Box>
                            <Divider/>

                            {jobDetail.length > 0 ? (
                                <List sx={{width: '100%', bgcolor: 'background.paper', p: 0}}>
                                    {jobDetail.map((item, index) => (
                                        <ListItem
                                            key={index} disablePadding
                                            secondaryAction={
                                                <Stack direction='row' spacing={2}>
                                                    <IconButton disabled={stockJob.job_status === 'success'} edge="end"
                                                                onClick={() => handleSelectItem(index)}>
                                                        <EditIcon fontSize="small"/>
                                                    </IconButton>
                                                    <IconButton disabled={stockJob.job_status === 'success'} edge="end"
                                                                onClick={() => handleDeleteItem(item)}>
                                                        ลบ
                                                    </IconButton>
                                                </Stack>
                                            }
                                        >
                                            <ListItemButton
                                                selected={selectedIndex === index}
                                                onClick={() => handleSelectItem(index)}
                                            >
                                                <ListItemText
                                                    primary={item.sp_name || "ไม่ระบุชื่อ"}
                                                    secondary={`รหัส: ${item.sp_code || "-"} | จำนวน: ${item.sp_qty || "0"}`}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{p: 3, textAlign: 'center'}}>
                                    <Typography color="text.secondary">ไม่มีรายการอะไหล่</Typography>
                                    <Button variant="text" startIcon={<AddIcon/>} onClick={handleNewItem} sx={{mt: 1}}>
                                        เพิ่มรายการใหม่
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Grid2>
                    <Grid2 size={{xs: 12, md: 8, lg: 5}}>
                        <Paper variant='outlined' sx={{p: 3}}>
                            <Typography variant="h6" gutterBottom>
                                {isNewItem ? "เพิ่มรายการใหม่" : (selectedIndex !== null ? "แก้ไขรายการ" : "เลือกรายการที่ต้องการแก้ไข หรือเพิ่มรายการใหม่")}
                            </Typography>
                            {(isNewItem || selectedIndex !== null) ? (
                                <Box component="form" onSubmit={handleSubmit} sx={{mt: 3}}>
                                    <Grid2 container spacing={3}>
                                        <Grid2 size={{xs: 12, md: 6}}>
                                            <TextField
                                                autoFocus
                                                required fullWidth id="sp_code" label="รหัสอะไหล่" name="sp_code"
                                                size='small'
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position='start'>
                                                                <PasswordIcon/>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                                value={data.sp_code} onChange={handleChange} variant="outlined"
                                            />
                                        </Grid2>
                                        <Grid2 size={{xs: 12, md: 6}}>
                                            <TextField
                                                size='small'
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position='start'>
                                                                <DriveFileRenameOutlineIcon/>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                                disabled fullWidth id="sp_name" label="ชื่ออะไหล่" name="sp_name"
                                                value={data.sp_name} onChange={handleChange} variant="outlined"
                                            />
                                        </Grid2>
                                        <Grid2 size={{xs: 12, md: 6}}>
                                            <TextField
                                                size='small'
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position='start'>
                                                                <AddCircleIcon/>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                                required fullWidth id="sp_qty" label="จำนวนที่ต้องการ"
                                                name="sp_qty" type="number" InputProps={{inputProps: {min: 1}}}
                                                value={data.sp_qty} onChange={handleChange} variant="outlined"
                                            />
                                        </Grid2>
                                    </Grid2>

                                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
                                        <Button
                                            disabled={processing || stockJob.job_status === 'success'}
                                            type="submit" variant="contained" color="primary"
                                            startIcon={<SaveIcon/>} sx={{mt: 1}}
                                        >
                                            {isNewItem ? "เพิ่มรายการ" : "บันทึกการแก้ไข"}
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{p: 3, textAlign: 'center', mt: 5}}>
                                    <Typography color="text.secondary">
                                        กรุณาเลือกรายการที่ต้องการแก้ไขจากรายการด้านซ้าย หรือเพิ่มรายการใหม่
                                    </Typography>
                                    <Button
                                        disabled={stockJob.job_status === 'success'}
                                        variant="contained" startIcon={<AddIcon/>}
                                        onClick={handleNewItem} sx={{mt: 2}}
                                    >
                                        เพิ่มรายการใหม่
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Grid2>
                    <Grid2 size={12}>
                        <Button
                            disabled={!jobDetail.length > 0 || stockJob.job_status === 'success'} variant='contained'
                            onClick={() => handleEndJob()} startIcon={<Done/>} color='success'
                        >
                            ปิดจ็อบ{stockJob.job_status === 'success' && 'แล้ว'}
                        </Button>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}
