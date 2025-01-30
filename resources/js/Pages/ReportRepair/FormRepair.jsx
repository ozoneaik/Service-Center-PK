import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head} from "@inertiajs/react";
import ProductDetail from "@/Components/ProductDetail.jsx";
import {Box, Button, Checkbox, Divider, FormControlLabel, Grid2, Stack, Typography} from "@mui/material";
import UploadImages from "@/Components/UploadImages.jsx";
import {useState} from "react";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ChecklistIcon from '@mui/icons-material/Checklist';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';

export default function FormRepair({detail}) {
    const [listBehavior, setListBehavior] = useState(detail.listbehavior)
    const HeadTitle = ({title, icon = <FormatListBulletedIcon/>}) => (
        <Typography variant='h6' fontWeight='bold' sx={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            color : '#ef5a24'
        }}>
            {icon}&nbsp;{title}
        </Typography>
    )

    const ButtonHandel = ({title, onClick,icon}) => (
        <>
            <Button
                sx={{width: {xs: '100%', md: 'auto'}}}
                variant='contained'
                onClick={onClick}
                startIcon={icon && icon}
            >
                {title}
            </Button>
        </>
    )
    return (
        <AuthenticatedLayout>
            <Head title="แจ้งซ่อม"/>
            <div className="bg-white mt-4 p-4 ">
                <Stack direction='column' spacing={2}>
                    <ProductDetail {...detail} />
                    <Divider/>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{sm: 12, md: 4}}>
                            <UploadImages title={'รูปกลุ่มที่  1'}/>
                            <UploadImages title={'รูปกลุ่มที่ 2'}/>
                        </Grid2>
                        <Grid2 size={{sm: 12, md: 8}}>
                            <Grid2 container spacing={2}>
                                <Grid2 size={12}>
                                    <HeadTitle title={'หมายเหตุ'}/>
                                    <textarea
                                        style={{width: '100%', borderRadius: 5, padding: 10, fontSize: 16}}></textarea>
                                </Grid2>
                                <Grid2 size={{sm: 12, md: 6}}>
                                    <HeadTitle title={'เลือกอาการ'} icon={<ChecklistIcon/>}/>
                                    <Box maxHeight={400} sx={{overflowY: 'scroll'}}>
                                        {listBehavior.map((items, index) => (
                                            <Box key={index} my={2}>
                                                <Typography fontWeight='bold' sx={{textDecoration: 'underline'}}>
                                                    {items.groupName}
                                                </Typography>
                                                {items.items.map((item, i) => (
                                                    <FormControlLabel control={<Checkbox/>} label={item.causename}/>
                                                ))}
                                                <Divider/>
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid2>
                                <Grid2 size={{sm: 12, md: 6}}>
                                    <HeadTitle title={'เลือกอะไหล่'}/>
                                </Grid2>~
                            </Grid2>
                        </Grid2>
                        <Grid2 size={12}>
                            <Stack direction={{xs: 'column', md: 'row'}} justifyContent={{md: 'center'}} spacing={2}>
                                <ButtonHandel title={'บันทึก'} icon={<SaveIcon/>} onClick={()=> alert('hello')}/>
                                <ButtonHandel title={'แก้ไข'} icon={<EditIcon/>} onClick={()=> alert('hello')}/>
                                <ButtonHandel title={'ยกเลิกงานซ่อม'} icon={<CancelIcon/>} onClick={()=> alert('hello')}/>
                                <ButtonHandel title={'ปิดงานซ่อม'} icon={<CheckIcon/>} onClick={()=> alert('hello')}/>
                            </Stack>
                        </Grid2>
                    </Grid2>
                </Stack>
            </div>
        </AuthenticatedLayout>
    )
}
