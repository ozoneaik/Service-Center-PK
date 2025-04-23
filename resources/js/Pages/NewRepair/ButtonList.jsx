import {Button, Stack, Typography} from "@mui/material";
import {Handyman, History, MenuBook, YouTube} from "@mui/icons-material";

export default function ButtonList({menuSel,setMenuSel}) {
    const handleChangeMenu = (value) => {
        setMenuSel(parseInt(value))
    }
    return (
        <>
            <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                <Button
                    disabled={menuSel === 1} onClick={() => handleChangeMenu(1)}
                    variant='contained' sx={{minWidth: 150}}
                    component={Stack} direction={'column'} spacing={1}
                >
                    <Handyman/>
                    <Typography variant='body1'>แจ้งซ่อม</Typography>
                </Button>
                <Button
                    disabled={menuSel === 2} onClick={() => handleChangeMenu(2)}
                    variant='contained' sx={{minWidth: 150}} color='secondary'
                    component={Stack} direction={'column'} spacing={1}
                >
                    <History/>
                    <Typography variant='body1'>ดูประวัติการซ่อม</Typography>
                </Button>
                <Button
                    disabled={menuSel === 3} onClick={() => handleChangeMenu(3)}
                    color='warning' variant='contained' sx={{minWidth: 150}} component={Stack} direction={'column'}
                    spacing={1}>
                    <MenuBook/>
                    <Typography variant='body1'>คู่มือ</Typography>
                </Button>
                <Button
                    disabled={menuSel === 4} onClick={() => handleChangeMenu(4)}
                    color='error' variant='contained' sx={{minWidth: 150}} component={Stack} direction={'column'}
                    spacing={1}>
                    <YouTube/>
                    <Typography variant='body1'>วิดีโอที่เกี่ยวข้อง</Typography>
                </Button>
            </Stack>
        </>
    )
}
