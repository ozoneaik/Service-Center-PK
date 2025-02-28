import {
    alpha,
    AppBar,
    Button, createTheme,
    Dialog, Divider, getContrastRatio,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from '@mui/material/styles';

export default function SumOrder({open , setOpen}){
    const theme = useTheme();
    return (
        <Dialog
            fullScreen
            open={open}
            onClose={()=>setOpen(false)}
        >
            <AppBar sx={{ backgroundColor: theme.palette.pumpkinColor.main, position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={()=>setOpen(false)}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        สรุปรายการคำสั่งซื้อ
                    </Typography>
                </Toolbar>
            </AppBar>
            <List>
                <ListItemButton>
                    <ListItemText primary="Phone ringtone" secondary="Titania" />
                </ListItemButton>
                <Divider />
                <ListItemButton>
                    <ListItemText
                        primary="Default notification ringtone"
                        secondary="Tethys"
                    />
                </ListItemButton>
            </List>
        </Dialog>
    )
}
