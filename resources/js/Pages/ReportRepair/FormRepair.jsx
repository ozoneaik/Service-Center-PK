import {Box, Button, Card, Grid2, Stack} from "@mui/material";

export default function FormRepair({detail}) {
    const ButtonStyle = ({title}) => (
        <Button sx={{height : 80}} variant='contained'>
            {title}
        </Button>
    )

    return (
        <Grid2 container spacing={2}>
            <Grid2 size={2}>
                <Stack direction='column' spacing={2}>
                    <ButtonStyle />
                    <Button sx={{height : 80}} variant='contained'>
                        สรุปการทำงาน
                    </Button>
                    <Button sx={{height : 80}} variant='contained'>
                        รูปภาพ
                    </Button>
                    <Button sx={{height : 80}} variant='contained'>
                        อาการ/สาเหตุ
                    </Button>
                    <Button sx={{height : 80}} variant='contained'>
                        อะไหล่
                    </Button>
                    <Button sx={{height : 80}} variant='contained'>
                        เพิ่มเติม
                    </Button>
                </Stack>
            </Grid2>
            <Grid2 size={10}>
                detail
            </Grid2>
        </Grid2>
    )
}
