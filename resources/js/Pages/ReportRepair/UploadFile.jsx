import {Alert, Button, Card, Grid2, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import Progress from "@/Components/Progress.jsx";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import {AlertDialog} from "@/Components/AlertDialog.js";
import CheckIcon from "@mui/icons-material/Check";

export const UploadFile = ({detail, setDetail}) => {
    const [loading, setLoading] = useState(true);
    const [menuList, setMenuList] = useState([]);
    const [selected, setSelected] = useState(detail.selected.fileUpload);

    useEffect(() => {
        fetchMenu().then();
    }, []);

    const fetchMenu = async () => {
        try {
            const {data, status} = await axios.get('menu-upload-file/show');
            const menuWithImages = data.list.map(menu => ({...menu, list: []}));
            setMenuList(menuWithImages);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const handleImageUpload = (menuId, event) => {
        const file = event.target.files[0];
        if (!file) return;
        setSelected(prevList => {
            return prevList.map(menu => {
                if (menu.id === menuId) {
                    const newImageId = menu.list.length + 1;
                    return {
                        ...menu,
                        list: [
                            ...menu.list,
                            {
                                id: newImageId,
                                image: file,
                                full_file_path: URL.createObjectURL(file)
                            }
                        ]
                    };
                }else{}
                return menu;
            });
        });
    };

    const removeImage = (menuId, imageId) => {
        setSelected(prevList => {
            return prevList.map(menu => {
                if (menu.id === menuId) {
                    return {
                        ...menu,
                        list: menu.list.filter(img => img.id !== imageId)
                    };
                }else{}
                return menu;
            });
        });
    };

    const handleSave = () => {
        AlertDialog({
            icon : 'question',
            title : 'ยินยันการบันทึกข้อมูล',
            text : 'กดตกลงเพื่อบันทึกหรืออัพเดทช้อมูล',
            onPassed : async (confirm) => {
                if (confirm){
                    try {
                        const {data, status} = await axios.post('/upload-file/store', {
                            serial_id: detail.serial,
                            list: selected,
                            job_id : detail.job.job_id
                        }, {headers: {"Content-Type": 'multipart/form-data'}});
                        console.log(data, status)
                        setSelected(data.data)
                        setDetail(prevDetail => ({
                            ...prevDetail,
                            selected: {
                                ...prevDetail.selected,
                                fileUpload: data.data
                            }
                        }));
                        AlertDialog({
                            icon : "success",
                            title : 'สำเร็จ',
                            text : data.message
                        })
                    } catch (error) {
                        AlertDialog({
                            title : 'เกิดข้อผิดพลาด',
                            text : error.response.data.message
                        })
                    }
                }
            }
        })

    };

    return (
        <>
            {!loading ? (
                <Grid2 container spacing={4}>
                    {
                        detail.job.warranty && (
                            <Grid2 size={12}>
                                <Alert severity="warning">
                                    <Typography fontSize={18}>
                                        หากคุณมีการเลือกอะไหล่ที่อยู่ในรับประกันในหน้าเลือกอะไหล่
                                        <br/>
                                        อย่าลืมอัปโหลด <b>"ภาพอะไหล่ที่เสียส่งเคลม"</b>
                                    </Typography>
                                </Alert>
                            </Grid2>

                        )
                    }
                    {selected.map((item) => (
                        <Grid2 size={12} key={item.id}>
                            <Typography fontWeight='bold'>{item.menu_name}</Typography>
                            <Stack direction='row' spacing={2} sx={{flexWrap: 'wrap', gap: 2}}>
                                {item.list.map((image) => (
                                    <Card key={image.id} sx={{width: 150, height: 150, position: 'relative'}}>
                                        <ImagePreview src={image.full_file_path} width='100%' height='100%'/>
                                        <Button
                                            variant='contained' size="small" color="error"
                                            onClick={() => removeImage(item.id, image.id)}
                                            sx={{position: 'absolute', top: 0, right: 0}}
                                        >
                                            ลบ
                                        </Button>
                                    </Card>
                                ))}
                                <Button variant="outlined" component="label" sx={{width: 150, height: 150}}>
                                    + เพิ่มรูปภาพ
                                    <input
                                        type="file" hidden
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(item.id, e)}
                                    />
                                </Button>
                            </Stack>
                        </Grid2>
                    ))}
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='end' spacing={2}>
                            <Button variant='outlined' disabled={detail.job.status === 'success'}>ยกเลิก</Button>
                            <Button onClick={handleSave} disabled={detail.job.status === 'success'} variant='contained'>บันทึก</Button>
                        </Stack>
                    </Grid2>
                </Grid2>
            ) : <Progress/>}
        </>
    );
};
