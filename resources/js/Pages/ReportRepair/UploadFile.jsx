import {Button, Card, Grid2, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import Progress from "@/Components/Progress.jsx";
import {ImagePreview} from "@/Components/ImagePreview.jsx";

export const UploadFile = ({detail, setDetail}) => {
    const [loading, setLoading] = useState(true);
    const [menuList, setMenuList] = useState([]);

    useEffect(() => {
        fetchMenu().then();
    }, []);

    const fetchMenu = async () => {
        try {
            const {data, status} = await axios.get('menu-upload-file/show');
            const menuWithImages = data.list.map(menu => ({
                ...menu,
                list: []
            }));
            setMenuList(menuWithImages);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const handleImageUpload = (menuId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        setMenuList(prevList => {
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
                                preview: URL.createObjectURL(file)
                            }
                        ]
                    };
                }
                return menu;
            });
        });
    };

    const removeImage = (menuId, imageId) => {
        setMenuList(prevList => {
            return prevList.map(menu => {
                if (menu.id === menuId) {
                    return {
                        ...menu,
                        list: menu.list.filter(img => img.id !== imageId)
                    };
                }
                return menu;
            });
        });
    };

    const handleSave = async () => {
        console.log(menuList)
        try {
            const {data, status} = await axios.post('/upload-file/store', {
                serial_id: 'test',
                list: menuList
            }, {headers: {"Content-Type": 'multipart/form-data'}});
            console.log(data, status)
        } catch (error) {
            console.error(error.response.data.message);
        }
    };

    return (
        <>
            {!loading ? (
                <Grid2 container spacing={4}>
                    {menuList.map((item) => (
                        <Grid2 size={12} key={item.id}>
                            <Typography fontWeight='bold'>{item.menu_name}</Typography>
                            <Stack direction='row' spacing={2} sx={{flexWrap: 'wrap', gap: 2}}>
                                {item.list.map((image) => (
                                    <Card key={image.id} sx={{width: 150, height: 150, position: 'relative'}}>
                                        <ImagePreview src={image.preview} width='100%' height='100%'/>
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
                                    sx={{width: 150, height: 150}}
                                >
                                    + เพิ่มรูปภาพ
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(item.id, e)}
                                    />
                                </Button>
                            </Stack>
                        </Grid2>
                    ))}
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='end' spacing={2}>
                            <Button onClick={handleSave} variant='contained'>บันทึก</Button>
                            <Button variant='contained' color='secondary'>ยกเลิก</Button>
                        </Stack>
                    </Grid2>
                </Grid2>
            ) : <Progress/>}
        </>
    );
};
