import {Button, Card, CardContent, Grid2, Stack, Step, StepLabel, Stepper} from "@mui/material";
import {HeaderTitle} from "@/Pages/NewRepair/HeaderCardTitle.jsx";
import {ArrowLeft, ArrowRight, Cancel, Done, Save} from "@mui/icons-material";
import {useState} from "react";
import RpBehaviorForm from "@/Pages/NewRepair/Tab2/RpBehaviorForm.jsx";
import RpSpMain from "@/Pages/NewRepair/Tab2/RpSp/RpSpMain.jsx";
import RpQu from "@/Pages/NewRepair/Tab2/RpQu.jsx";
import RpUploadFileAfterForm from "@/Pages/NewRepair/Tab2/RpUploadFileAfterForm.jsx";


export default function RpTab2Form({productDetail,serial_id}) {
    const [stepForm, setStepForm] = useState(0);

    const listBehavior = productDetail.listbehavior;

    const listSparePart = productDetail.sp

    const steps = [
        'อาการ / สาเหตุ',
        'อะไหล่',
        'ใบเสนอราคา',
        'สภาพสินค้าหลังซ่อม',
    ]

    const handleChangeStep = (index) => {
        setStepForm(index);
    }

    const handleSelectStep = (index, label) => {
        (index < stepForm) && setStepForm(index)

    }


    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12} className='stepper'>
                <Stepper activeStep={stepForm} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={index} onClick={() => handleSelectStep(index, label)}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Grid2>
            {stepForm === 0 && (
                <Grid2 size={12}>
                    <Card
                        variant='outlined'
                        sx={(theme) => (
                            {backgroundColor: theme.palette.cardFormRpColor.main}
                        )}
                    >
                        <CardContent>
                            <HeaderTitle headTitle='อาการ / สาเหตุ'/>
                            <RpBehaviorForm listBehavior={listBehavior}/>
                            <Stack direction='row' spacing={2} justifyContent='end'>
                                <Button
                                    variant='contained' endIcon={<ArrowRight/>}
                                    onClick={() => handleChangeStep(1)}
                                >
                                    ถัดไป
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid2>
            )}

            {stepForm === 1 && (
                <Grid2 size={12}>
                    <Card
                        variant='outlined'
                        sx={(theme) => (
                            {backgroundColor: theme.palette.cardFormRpColor.main}
                        )}
                    >
                        <CardContent>
                            <HeaderTitle headTitle='อะไหล่'/>
                            {/*content here*/}
                            <RpSpMain productDetail={productDetail} listSparePart={listSparePart}/>
                            <Stack direction='row' spacing={2} justifyContent='end'>
                                <Button
                                    variant='contained' endIcon={<ArrowLeft/>} color='secondary'
                                    onClick={() => handleChangeStep(0)}
                                >
                                    ย้อนกลับ
                                </Button>
                                <Button
                                    variant='contained' endIcon={<ArrowRight/>}
                                    onClick={() => handleChangeStep(2)}
                                >
                                    ถัดไป
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid2>
            )}

            {stepForm === 2 && (
                <Grid2 size={12}>
                    <Card
                        variant='outlined'
                        sx={(theme) => (
                            {backgroundColor: theme.palette.cardFormRpColor.main}
                        )}
                    >
                        <CardContent>
                            <HeaderTitle headTitle='ใบเสนอราคา'/>
                            {/*content here*/}
                            <RpQu/>
                            <Stack direction='row' justifyContent='end' spacing={2}>
                                <Button
                                    variant='contained' endIcon={<ArrowLeft/>} color='secondary'
                                    onClick={() => handleChangeStep(1)}
                                >
                                    ย้อนกลับ
                                </Button>
                                <Button
                                    variant='contained' endIcon={<ArrowRight/>}
                                    onClick={() => handleChangeStep(3)}
                                >
                                    ถัดไป
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid2>
            )}

            {stepForm === 3 && (
                <Grid2 size={12}>
                    <Card variant='outlined' sx={{backgroundColor: '#d9d9d9'}}>
                        <CardContent>
                            <HeaderTitle headTitle='สภาพสินค้าหลังซ่อม'/>
                            {/*content here*/}
                            <RpUploadFileAfterForm/>
                            <Stack direction='row' justifyContent='end' spacing={2}>
                                <Button
                                    variant='contained' endIcon={<ArrowLeft/>} color='secondary'
                                    onClick={() => handleChangeStep(2)}
                                >
                                    ย้อนกลับ
                                </Button>
                                <Button variant='contained' color='error' startIcon={<Cancel/>}>ยกเลิกงานซ่อม</Button>
                                <Button variant='contained' startIcon={<Save/>}>บันทึก</Button>
                                <Button
                                    variant='contained' color='success'
                                    startIcon={<Done/>}
                                >
                                    บันทึกและปิดงานซ่อม
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid2>
            )}
        </Grid2>
    )
}
