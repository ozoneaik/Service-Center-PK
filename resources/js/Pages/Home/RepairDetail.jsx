import {Button, Card, Checkbox, Grid2, Stack, TextareaAutosize, Typography} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan, faCheck, faFloppyDisk, faPenToSquare} from "@fortawesome/free-solid-svg-icons";
export function RepairDetail({imageList, setImageList}) {
    return (
        <Grid2 container spacing={2}>
            <Grid2 size={{lg: 4, xs: 12}}>
                เพิ่มรูปภาพ
            </Grid2>
            <Grid2 size={{lg: 8, xs: 12}}>
                <Grid2 container spacing={1}>
                    <Grid2 size={12}>
                        <Typography>หมายเหตุ</Typography>
                        <TextareaAutosize minRows={5} style={{width : '100%',borderRadius : 5}} placeholder='ระบุหมายเหตุ'>

                        </TextareaAutosize>
                    </Grid2>
                    <Grid2 size={{lg: 6, xs: 12}}>
                        <Checkbox label="sdfdsf"/>
                    </Grid2>
                    <Grid2 size={{lg: 6, xs: 12}}>
                        <Card>อะไหล่</Card>
                    </Grid2>
                </Grid2>
            </Grid2>
            <Grid2 size={12}>
                <Stack
                    direction={{lg: 'row', xs: 'column'}} spacing={{lg: 4, xs: 1}}
                    justifyContent={{lg: 'center', xs: 'flex-start'}}
                >
                    <Button variant="contained" color='primary' size='large'
                            startIcon={<FontAwesomeIcon icon={faFloppyDisk}/>}>
                        บันทึก
                    </Button>
                    <Button variant="contained" color='info' startIcon={<FontAwesomeIcon icon={faPenToSquare}/>}>
                        แก้ไข
                    </Button>
                    <Button variant="contained" color='error' startIcon={<FontAwesomeIcon icon={faBan}/>}>
                        ยกเลิกการซ่อม
                    </Button>
                    <Button variant="contained" color='success' startIcon={<FontAwesomeIcon icon={faCheck}/>}>
                        ปิดงานซ่อม
                    </Button>
                </Stack>
            </Grid2>
        </Grid2>
    )
}
