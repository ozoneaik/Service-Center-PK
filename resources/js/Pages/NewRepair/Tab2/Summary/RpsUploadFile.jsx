import {Grid2, Stack, Typography} from "@mui/material";
import {CardComponent} from "@/Components/CardComponent.jsx";
import {getFileType} from "@/utils/fileUploadManage.js";

const sizeImage = 150;
const sizeVideo = 150;

export default function RpsUploadFile({file_uploads}) {
    const file_befores = file_uploads?.file_befores || [];
    const file_afters = file_uploads?.file_afters || [];
    return (
        <Grid2 container spacing={2}>
            <Grid2 size={{md: 6, xs: 12}}>
                <CardComponent headTitle='รูปภาพ/วิดีโอสำหรับเคลมสินค้า' sx={{minHeight: 200}}>
                    <ShowMedia list={file_befores}/>
                </CardComponent>
            </Grid2>
            <Grid2 size={{md: 6, xs: 12}}>
                <CardComponent headTitle='รูปภาพ/วิดีโอสำหรับร้านค้าใช้ภายใน' sx={{minHeight: 200}}>
                    <ShowMediaAfterFile list={file_afters}/>
                </CardComponent>
            </Grid2>
        </Grid2>
    )
}

const ShowMedia = ({list}) => (
    <Stack direction='row' gap={1} flexWrap='wrap'>
        {list.map((file, index) => {
            const getType = getFileType(file);
            if (getType === 'video/mp4' || getType === 'video/mov') {
                return (
                    <video key={index} width={sizeVideo} height={sizeVideo} controls>
                        <source src={file.full_file_path}/>
                    </video>
                )
            } else {
                return (

                        <img loading='lazy' src={file.full_file_path} width={sizeImage} height={sizeImage} alt=""
                             key={index}/>
                )
            }
        })}
    </Stack>
)

const ShowMediaAfterFile = ({list}) => {

    const menu2 = list.filter(file => file.menu_id === 2);
    const menu3 = list.filter(file => file.menu_id === 3);
    const menu4 = list.filter(file => file.menu_id === 4);
    const menu5 = list.filter(file => file.menu_id === 5);

    return (
        <>
            {menu2.length > 0 && (
                <>
                    <Typography>สภาพสินค้าหลังซ่อม</Typography>
                    <ShowMedia list={menu2}/>
                </>
            )}
            {menu3.length > 0 && (
                <>
                    <Typography>ภาพอะไหล่ที่เสียส่งเคลม</Typography>
                    <ShowMedia list={menu3}/>
                </>
            )}

            {menu4.length > 0 && (
                <>
                    <Typography>ภาพอะไหล่ที่เปลี่ยน</Typography>
                    <ShowMedia list={menu4}/>
                </>
            )}
            {menu5.length > 0 && (
                <>
                    <Typography>ภาพอะไหล่เสียอื่นๆ</Typography>
                    <ShowMedia list={menu5}/>
                </>
            )}
        </>
    )
}


