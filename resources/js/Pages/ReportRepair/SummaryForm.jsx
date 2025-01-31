import { Stack } from "@mui/material"
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export const SummaryForm = () => {
    return (
        <Stack direction='column'>
            <FormGroup>
                <FormControlLabel control={<Checkbox checked  />} label="รูปภาพ" />            
                <FormControlLabel control={<Checkbox checked  />} label="อาการ / สาเหตุ" />            
                <FormControlLabel control={<Checkbox checked  />} label="บันทึกอะไหล่" />            
            </FormGroup>
        </Stack>
    )
}