import {Button, Stack} from "@mui/material";

export const AddMore = () => {
    return (
        <Stack direction='column' spacing={2}>
            <textarea></textarea>
            <Stack direction='row' justifyContent='end' spacing={2}>
                <Button color='secondary' variant='contained'>ยกเลิก</Button>
                <Button color='primary' variant='contained'>บันทึก</Button>
            </Stack>
        </Stack>
    )
}
