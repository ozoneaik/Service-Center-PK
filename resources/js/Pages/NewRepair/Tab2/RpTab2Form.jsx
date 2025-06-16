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
    Stepper,

} from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import {HeaderTitle} from "@/Pages/NewRepair/HeaderCardTitle.jsx";
import {ArrowLeft, ArrowRight, Cancel, Check, Done, Save} from "@mui/icons-material";
import {useEffect, useState} from "react";
import RpBehaviorForm from "@/Pages/NewRepair/Tab2/RpBehaviorForm.jsx";
import RpSpMain from "@/Pages/NewRepair/Tab2/RpSp/RpSpMain.jsx";
import RpQu from "@/Pages/NewRepair/Tab2/RpQu.jsx";
import RpUploadFileAfterForm from "@/Pages/NewRepair/Tab2/RpUploadFileAfterForm.jsx";
import RpSummary from "@/Pages/NewRepair/Tab2/Summary/RpSummary.jsx";


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


export default function RpTab2Form({productDetail, JOB, setMainStep, MainStep, setJOB}) {
    const [stepForm, setStepForm] = useState(0);
    const listBehavior = productDetail.listbehavior;
    const listSparePart = productDetail.sp
    const [loading, setLoading] = useState(false);
    const [subremark1, setSubremark1] = useState(false);
    const [firstRender, setFirstRender] = useState(true);

    useEffect(() => {
        if (firstRender) {
            setFirstRender(false)
        } else {
            console.log('render step', MainStep.sub_step)
            if (MainStep.step === 'after') {
                setStepForm(MainStep.sub_step)
            }
        }
    }, [MainStep])

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
            setSubremark1(data.subremark1)
            if (data.subremark1) {
                setStepForm(1)
            }
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
                        <Stack direction='row' justifyContent='start'>

                            <FormControlLabel disabled control={<Checkbox checked={subremark1}/>} label={'ใบเสนอราคา'}/>
                            {/*<button onClick={() => console.log(stepForm)}>stepForm</button>*/}
                        </Stack>
                    </Grid2>
                    <Grid2 size={12} className='stepper'>
                        <Stepper activeStep={stepForm} alternativeLabel>
                            {steps.map((label, index) => (
                                <Step
                                    key={index} onClick={() => handleSelectStep(index, label)}
                                >
                                    <StepLabel
                                        sx={{
                                            transition: 'all 0.1s ease-in-out',
                                            '&:hover': {
                                                backgroundColor: '#d9d9d9',
                                                cursor: 'pointer',
                                                borderRadius: '10px'
                                            }
                                        }}
                                    >
                                        {label}
                                    </StepLabel>
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
                                    <RpQu productDetail={productDetail} JOB={JOB} setStepForm={setStepForm}/>
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
                                    <RpUploadFileAfterForm
                                        productDetail={productDetail} JOB={JOB}
                                        setStepForm={setStepForm}
                                    />
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
                                    <RpSummary setJOB={setJOB} setMainStep={setMainStep} JOB={JOB}
                                               productDetail={productDetail}/>
                                </CardContent>
                            </Card>
                        </Grid2>
                    )}
                </Grid2>
            )}
        </>
    )
}
