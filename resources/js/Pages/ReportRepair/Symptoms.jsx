import {Button, Grid2, Stack, Typography} from "@mui/material";
import {useState} from "react";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";
import ChecklistIcon from "@mui/icons-material/Checklist";

export default function Symptoms({detail, setDetail}) {
    const [symptom, setSymptom] = useState(detail.selected.symptom ?? '');
    const [remark, setRemark] = useState(detail.selected.remark ?? '');

    const onSubmit = (e) => {
        e.preventDefault();
        AlertDialogQuestion({
            text: 'กดตกลงเพื่ออัพเดท',
            onPassed: async (confirm) => {
                confirm && await storeSymptom();
            }
        })
    }
    const storeSymptom = async () => {
        let Status, Message;
        try {
            const {data, status} = await axios.post('/symptom/store', {
                job_id: detail.job.job_id,
                serial_id: detail.serial,
                symptom: symptom,
                remark : remark
            });
            Status = status;
            Message = data.message;
        } catch (error) {
            Status = error.response.status;
            Message = error.response.data.message;
        } finally {
            AlertDialog({
                icon: Status === 200 ? 'success' : 'error',
                text: Message,
                onPassed: () => {
                    Status === 200 && setDetail(prevDetail => ({
                        ...prevDetail,
                        selected: {
                            ...prevDetail.selected,
                            symptom,
                            remark
                        }
                    }));
                }
            })
        }

    }
    return (
        <>
            <form onSubmit={onSubmit}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <textarea
                            rows={8}
                            onChange={(e) => setSymptom(e.target.value)}
                            style={{width: '100%'}}
                            defaultValue={symptom}
                            placeholder='กรอกอาการเบื้องต้นก่อนแกะเครื่อง'
                        />
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row' spacing={2} alignItems='center' mb={2}>
                            <Typography variant='h5' fontWeight='bold' sx={{textDecoration: 'underline'}}>
                                <ChecklistIcon/>&nbsp;หมายเหตุสำหรับสื่อสารภายใน
                            </Typography>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12}>
                        <textarea
                            onChange={(e) => setRemark(e.target.value)}
                            style={{width: '100%'}}
                            defaultValue={remark}
                            rows={8}
                            placeholder='หมายเหตุการซ่อมของช่างเทคนิค สำหรับการสื่อสารภายในศูนย์ซ่อม'
                        />
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row-reverse'>
                            <Button disabled={detail.job.status === 'success'} variant='contained' color='primary' type='submit'>
                                บันทึก
                            </Button>
                        </Stack>
                    </Grid2>
                </Grid2>
            </form>
        </>
    )
}
