import {Grid2, Stack} from "@mui/material";
import {CardComponent} from "@/Components/CardComponent.jsx";
import {getFileType} from "@/utils/fileUploadManage.js";

export default function RpsUploadFile({file_uploads}) {
    const file_befores = file_uploads?.file_befores || [];
    const file_afters = file_uploads?.file_afters || [];
    return (
        <Grid2 container spacing={2}>
            <Grid2 size={{md: 6, sm: 12}}>
                <CardComponent headTitle='รูปภาพ/วิดีโอสำหรับเคลมสินค้า' sx={{minHeight: 300}}>
                    <ShowMedia list={file_befores}/>
                </CardComponent>
            </Grid2>
            <Grid2 size={{md: 6, sm: 12}}>
                <CardComponent headTitle='รูปภาพ/วิดีโอสำหรับร้านค้าใช้ภายใน' sx={{minHeight: 300}}>
                    <ShowMedia list={file_afters}/>
                </CardComponent>
            </Grid2>
        </Grid2>
    )
}

const ShowMedia = ({list}) => (
    <Stack direction='row' gap={1} flexWrap='wrap'>
        {list.map((file, index) => {
            const getType = getFileType(file);
            console.log(getType)
            if (getType === 'video/mp4') {
                return (
                    <video key={index} width={200} height={200} controls>
                        <source src={file.full_file_path}/>
                    </video>
                )
            } else {
                return (
                    <img src={file.full_file_path} width={200} alt="" key={index}/>
                )
            }
        })}
    </Stack>
)
