import {Button, Stack} from "@mui/material"
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {AlertDialog} from "@/Components/AlertDialog.js";

export const SummaryForm = ({detail, setDetail}) => {
    const selected = detail.selected;
    const uploadSelected = selected.fileUpload;

    async function endJob() {
        let message = '';
        let Status = 400;
        try {
            const {data, status} = await axios.post('jobs/update', {
                job_id: detail.job.job_id
            });
            Status = status;
            message = data.message;
            setDetail(prevDetail => ({
                ...prevDetail,
                job: {
                    ...prevDetail.job,
                    status : 'success'
                }
            }));
        }catch (error){
            Status = error.response.status;
            message = error.response.data.message;
        }finally {
            AlertDialog({
                icon: Status === 200 ? 'success' : 'error',
                text: message,
                onPassed: () => {
                }
            })
        }


    }

    return (
        <Stack direction='column'>
            <FormGroup>
                <FormControlLabel control={<Checkbox checked={selected.fileUpload.length > 0}/>} label="รูปภาพ"/>
                <FormControlLabel control={<Checkbox checked={selected.behavior.length > 0}/>} label="อาการ / สาเหตุ"/>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={selected.sp_warranty.length > 0 || selected.sp.length > 0}
                        />
                    }
                    label="บันทึกอะไหล่"/>
                <FormControlLabel control={<Checkbox checked={selected.remark !== ""}/>} label="หมายเหตุ"/>
            </FormGroup>
            <Stack direction='row' spacing={2} justifyContent='end'>
                <Button variant='contained' color='error' onClick={() => console.log(selected)}>ยกเลิกงานซ่อม</Button>
                <Button variant='contained' color='success' disabled={detail.job.status === 'success'} onClick={() => endJob()}>ปิดงานซ่อม</Button>
            </Stack>
        </Stack>
    )
}
