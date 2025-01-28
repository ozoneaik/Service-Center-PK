import {Grid2, ImageList, ImageListItem, Typography} from "@mui/material";

const UploadButton = () => (
    <ImageListItem onClick={()=>alert('test')}>
        <img
            srcSet={`https://cdn-icons-png.freepik.com/256/10977/10977576.png?semt=ais_hybrid?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
            src={`https://cdn-icons-png.freepik.com/256/10977/10977576.png?semt=ais_hybrid?w=164&h=164&fit=crop&auto=format`}
            alt={'title'}
            loading="lazy"
        />
    </ImageListItem>
)

export default function UploadImages({list, setList,title}){
    return (
        <Grid2 container spacing={1}>
            <Grid2 size={12}>
                <Typography variant='h6'>{title}</Typography>
            </Grid2>
            <ImageList sx={{ width: '100%', maxHeight: 300 }} cols={3}>
                {list && list.map((item) => (
                    <ImageListItem key={item.img} onClick={()=>alert(item.title)}>
                        <img
                            srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                            src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
                            alt={item.title}
                            loading="lazy"
                        />
                    </ImageListItem>
                ))}
                <UploadButton/>
            </ImageList>

        </Grid2>
    )
}
