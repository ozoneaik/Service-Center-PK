import {
    Button,
    Card,
    CardContent, CircularProgress,
    FormControlLabel,
    FormLabel,
    Grid2,
    Stack,
    Step,
    StepLabel,
    Stepper
} from "@mui/material";
import {HeaderTitle} from "@/Pages/NewRepair/HeaderCardTitle.jsx";
import {ArrowLeft, ArrowRight, Cancel, Check, CheckBox, Done, Save} from "@mui/icons-material";
import {useEffect, useState} from "react";
import RpBehaviorForm from "@/Pages/NewRepair/Tab2/RpBehaviorForm.jsx";
import RpSpMain from "@/Pages/NewRepair/Tab2/RpSp/RpSpMain.jsx";
import RpQu from "@/Pages/NewRepair/Tab2/RpQu.jsx";
import RpUploadFileAfterForm from "@/Pages/NewRepair/Tab2/RpUploadFileAfterForm.jsx";


const steps = [
    'อาการ / สาเหตุ',
    'อะไหล่',
    'ใบเสนอราคา',
    'สภาพสินค้าหลังซ่อม',
    'สรุปจบงาน'
]


const ButtonStepper = ({children}) => (
    <Stack direction='row' justifyContent='center' spacing={2} mt={2}>
        {children}
    </Stack>
)


export default function RpTab2Form({productDetail, JOB, setJOB}) {
    const [stepForm, setStepForm] = useState(0);
    const listBehavior = productDetail.listbehavior;
    const listSparePart = productDetail.sp
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkStep().finally(() => setLoading(false));
    }, []);
    const checkStep = async () => {
        try {
            setLoading(true)
            const {data, status} = await axios.get(route('repair.after', {
                serial_id: JOB.serial_id,
                job_id: JOB.job_id
            }));
            console.log(data, status)
            setStepForm(data.step)
        } catch (error) {
            console.log(error)
        }
    }


    const handleChangeStep = (index) => {
        setStepForm(index);
    }
    const handleSelectStep = (index, label) => {
        // (index < stepForm) && setStepForm(index)
        setStepForm(index)
    }


    return (
        <>
            {loading ? (<CircularProgress/>) : (
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='center'>
                            <FormControlLabel control={<CheckBox checked={true}/>} label={'ใบเสนอราคา'}/>
                        </Stack>
                    </Grid2>
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
                                    <RpBehaviorForm JOB={JOB} listBehavior={listBehavior} setStepForm={setStepForm}/>
                                    {/*<ButtonStepper>*/}
                                    {/*    <Button*/}
                                    {/*        variant='contained' endIcon={<ArrowRight/>}*/}
                                    {/*        onClick={() => handleChangeStep(1)}*/}
                                    {/*    >*/}
                                    {/*        ถัดไป*/}
                                    {/*    </Button>*/}
                                    {/*</ButtonStepper>*/}

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
                                    <RpSpMain
                                        productDetail={productDetail} listSparePart={listSparePart}
                                        setStepForm={setStepForm} JOB={JOB}
                                    />
                                    {/*<ButtonStepper>*/}
                                    {/*    <Button*/}
                                    {/*        variant='contained' endIcon={<ArrowLeft/>} color='secondary'*/}
                                    {/*        onClick={() => handleChangeStep(0)}*/}
                                    {/*    >*/}
                                    {/*        ย้อนกลับ*/}
                                    {/*    </Button>*/}
                                    {/*    <Button*/}
                                    {/*        variant='contained' endIcon={<ArrowRight/>}*/}
                                    {/*        onClick={() => handleChangeStep(2)}*/}
                                    {/*    >*/}
                                    {/*        ถัดไป*/}
                                    {/*    </Button>*/}
                                    {/*</ButtonStepper>*/}
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
                                    <RpQu productDetail={productDetail} JOB={JOB}/>
                                    {/*<ButtonStepper>*/}
                                    {/*    <Button*/}
                                    {/*        variant='contained' endIcon={<ArrowLeft/>} color='secondary'*/}
                                    {/*        onClick={() => handleChangeStep(1)}*/}
                                    {/*    >*/}
                                    {/*        ย้อนกลับ*/}
                                    {/*    </Button>*/}
                                    {/*    <Button*/}
                                    {/*        variant='contained' endIcon={<ArrowRight/>}*/}
                                    {/*        onClick={() => handleChangeStep(3)}*/}
                                    {/*    >*/}
                                    {/*        ถัดไป*/}
                                    {/*    </Button>*/}
                                    {/*</ButtonStepper>*/}
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
                                    {/*<ButtonStepper>*/}
                                    {/*    <Button*/}
                                    {/*        variant='contained' endIcon={<ArrowLeft/>} color='secondary'*/}
                                    {/*        onClick={() => handleChangeStep(1)}*/}
                                    {/*    >*/}
                                    {/*        ย้อนกลับ*/}
                                    {/*    </Button>*/}
                                    {/*    <Button*/}
                                    {/*        variant='contained' endIcon={<ArrowRight/>}*/}
                                    {/*        onClick={() => handleChangeStep(4)}*/}
                                    {/*    >*/}
                                    {/*        ถัดไป*/}
                                    {/*    </Button>*/}
                                    {/*</ButtonStepper>*/}
                                </CardContent>
                            </Card>
                        </Grid2>
                    )}

                    {stepForm === 4 && (
                        <Grid2 size={12}>
                            <Card variant='outlined' sx={{backgroundColor: '#d9d9d9'}}>
                                <CardContent>
                                    <HeaderTitle headTitle='สรุปจบงาน'/>
                                    {/*content here*/}
                                    สรุปจบงาน
                                    {/*<ButtonStepper>*/}
                                    {/*    <Button*/}
                                    {/*        variant='contained' startIcon={<ArrowLeft/>} color='secondary'*/}
                                    {/*        onClick={() => handleChangeStep(3)}*/}
                                    {/*    >*/}
                                    {/*        ย้อนกลับ*/}
                                    {/*    </Button>*/}
                                    {/*    <Button variant='contained' color='error'*/}
                                    {/*            startIcon={<Cancel/>}>ยกเลิกงานซ่อม</Button>*/}
                                    {/*    <Button variant='contained' startIcon={<Save/>}>บันทึก</Button>*/}
                                    {/*    <Button*/}
                                    {/*        variant='contained' color='success'*/}
                                    {/*        startIcon={<Done/>}*/}
                                    {/*    >*/}
                                    {/*        บันทึกและปิดงานซ่อม*/}
                                    {/*    </Button>*/}
                                    {/*</ButtonStepper>*/}
                                </CardContent>
                            </Card>
                        </Grid2>
                    )}
                </Grid2>
            )}
        </>
    )
}
