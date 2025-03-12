import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    Grid2,
    Stack,
    Tab,
    Tabs,
    Typography
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import axios from "axios";

import Progress from "@/Components/Progress.jsx";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import {AlertDialog} from "@/Components/AlertDialog.js";

export const UploadFile = ({detail, setDetail, setShowDetail}) => {
    const [loading, setLoading] = useState(true);
    const [menuList, setMenuList] = useState([]);
    const [selected, setSelected] = useState(detail.selected.fileUpload);
    const [tabValue, setTabValue] = useState(0);

    // ดึงรายการเมนูจาก API
    const fetchMenu = async () => {
        try {
            const {data} = await axios.get('menu-upload-file/show');
            const menuWithImages = data.list.map(menu => ({...menu, list: []}));
            setMenuList(menuWithImages);
            setLoading(false);
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการดึงเมนู:", error);
            setLoading(false);
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถโหลดรายการเมนูได้'
            });
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    // จัดการการอัปโหลดรูปภาพ
    const handleImageUpload = (menuId, event) => {
        const file = event.target.files[0];
        const fileType = file.type.startsWith("image") ? "image" :
            file.type.startsWith("video") ? "video" : "unknown";
        if (!file) return;

        setSelected(prevList =>
            prevList.map(menu =>
                menu.id === menuId
                    ? {
                        ...menu,
                        list: [
                            ...menu.list,
                            {
                                id: menu.list.length + 1,
                                image: file,
                                full_file_path: URL.createObjectURL(file),
                                type : fileType
                            }
                        ]
                    }
                    : menu
            )
        );
    };

    // ลบรูปภาพ
    const removeImage = (menuId, imageId) => {
        setSelected(prevList =>
            prevList.map(menu =>
                menu.id === menuId
                    ? {...menu, list: menu.list.filter(img => img.id !== imageId)}
                    : menu
            )
        );
    };

    // บันทึกข้อมูล
    const handleSave = () => {
        AlertDialog({
            icon: 'question',
            title: 'ยืนยันการบันทึกข้อมูล',
            text: 'กดตกลงเพื่อบันทึกหรืออัพเดทข้อมูล',
            onPassed: async (confirm) => {
                if (confirm) {
                    try {
                        const {data} = await axios.post('/upload-file/store', {
                            serial_id: detail.serial,
                            list: selected,
                            job_id: detail.job.job_id
                        }, {
                            headers: {"Content-Type": 'multipart/form-data'}
                        });

                        setSelected(data.data);
                        setDetail(prevDetail => ({
                            ...prevDetail,
                            selected: {
                                ...prevDetail.selected,
                                fileUpload: data.data
                            }
                        }));

                        AlertDialog({
                            icon: "success",
                            title: 'สำเร็จ',
                            text: data.message
                        });
                    } catch (error) {
                        AlertDialog({
                            title: 'เกิดข้อผิดพลาด',
                            text: error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้'
                        });
                    }
                }
            }
        });
    };

    // สร้าง Tab Panel แบบกำหนดเอง
    const CustomTabPanel = ({children, value, index, ...other}) => (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{p: 3}}>{children}</Box>}
        </div>
    );

    // แสดงรูปภาพตามแท็บ
    const renderImageSection = (startIndex, endIndex) => (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                {selected.map((item, index) => (
                    index >= startIndex && index <= endIndex && (
                        <Grid2 size={12} key={item.id} mb={2}>
                            <Typography fontWeight='bold'>{item.menu_name}</Typography>
                            <Stack
                                direction='row'
                                spacing={2}
                                sx={{flexWrap: 'wrap', gap: 2}}
                            >
                                {item.list.map((image) => (
                                    <Card
                                        key={image.id}
                                        sx={{width: 150, height: 150, position: 'relative'}}
                                    >
                                        {/\.(mp4|webm|ogg|avi|mov)$/i.test(image.full_file_path) ? (
                                            <video
                                                src={image.full_file_path}
                                                width="100%"
                                                height="100%"
                                                controls
                                            />
                                        ) : (
                                            <ImagePreview src={image.full_file_path} width="100%" height="100%" />
                                        )}
                                        <Button
                                            variant='contained'
                                            size="small"
                                            color="error"
                                            onClick={() => removeImage(item.id, image.id)}
                                            sx={{position: 'absolute', top: 0, right: 0}}
                                        >
                                            ลบ
                                        </Button>


                                    </Card>

                                ))}

                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{width: 160, height: 160}}
                                >
                                    + เพิ่มรูปภาพ/วิดีโอ
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*,video/*"
                                        onChange={(e) => handleImageUpload(item.id, e)}
                                    />
                                </Button>

                            </Stack>
                        </Grid2>
                    )
                ))}
            </Grid2>
        </Grid2>
    );

    return (
        <>
            {!loading ? (
                <Grid2 container spacing={4}>
                    {detail.job.warranty && (
                        <Grid2 size={12}>
                            <Alert severity="warning">
                                <Typography fontSize={18}>
                                    กรณีที่เป็นการเคลมอะไหล่สินค้าที่อยู่ในประกัน และเคลมอะไหล่สินค้านอกประกัน
                                    ต้องมีภาพประกอบในการพิจารณา
                                </Typography>
                            </Alert>
                        </Grid2>
                    )}

                    <Grid2 size={12}>
                        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                            <Tabs
                                value={tabValue}
                                onChange={(_, newValue) => setTabValue(newValue)}
                                aria-label="tabs"
                            >
                                <Tab label="สำหรับศูนย์ซ่อมใช้ภายใน"/>
                                <Tab label="เพิ่มเติมสำหรับร้านค้า"/>
                            </Tabs>
                        </Box>

                        <CustomTabPanel value={tabValue} index={0}>
                            {renderImageSection(0, 2)}
                        </CustomTabPanel>

                        <CustomTabPanel value={tabValue} index={1}>
                            {renderImageSection(3, selected.length - 1)}
                        </CustomTabPanel>
                    </Grid2>

                    <Grid2 size={12}>
                        <Stack
                            direction='row'
                            justifyContent='end'
                            spacing={2}
                        >
                            <Button
                                variant='outlined'
                                disabled={detail.job.status === 'success'}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={detail.job.status === 'success'}
                                variant='contained'
                            >
                                บันทึก
                            </Button>
                        </Stack>
                    </Grid2>
                </Grid2>
            ) : (
                <Progress/>
            )}
        </>
    );
};
