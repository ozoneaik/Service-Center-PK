import { Button, Card, Grid2, Stack, Typography } from "@mui/material"
import {useEffect, useState} from "react";
import Progress from "@/Components/Progress.jsx";
import {ImagePreview} from "@/Components/ImagePreview.jsx";

export const UploadFile = ({detail, setDetail}) => {
    const [loading, setLoading] = useState(true);
    const [menuList, setMenuList] = useState([]);
    useEffect(() => {
        fetchMenu()
    }, []);
    const fetchMenu = async () => {
        try {
            const {data, status} = await axios.get('api/admin/menu-upload-file/show');
            console.log(data, status)
            setMenuList(data.list);
        }catch (error){
            console.log(error)
        }
        setLoading(false)
    }
    return (
        <>
            {!loading ? (
                <Grid2 container spacing={4}>
                    {menuList.map((item, index) => (
                        <Grid2 size={12} key={index}>
                            <Typography fontWeight='bold'>{item.menu_name}</Typography>
                            <Stack direction='row' spacing={2}>
                                <Card sx={{ width: 150, height: 150 }}>
                                    <ImagePreview src='https://images.dcpumpkin.com/images/product/500/default.jpg' width='100%'/>
                                </Card>
                                <Button variant="outlined" sx={{ width: 150, height: 150 }}>
                                    + เพิ่มรูปภาพ
                                </Button>
                            </Stack>
                        </Grid2>
                    ))}
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='end' spacing={2}>
                            <Button variant='contained'>บันทึก</Button>
                            <Button variant='contained' color='secondary'>ยกเลิก</Button>
                        </Stack>
                    </Grid2>
                </Grid2>
            ) : <Progress/>}
        </>
    )
}
