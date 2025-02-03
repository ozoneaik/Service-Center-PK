import {Box, Divider, Stack, Typography} from "@mui/material";

export const PathDetail = ({name,Sn}) => (
    <div style={{marginTop : '1.5rem'}}>
        <Typography color='primary' fontWeight='bold'>
            Home {'>'} {name} {'>'} {Sn}
        </Typography>
        <Box width='100%' bgcolor='#f25822' sx={{height : 10,borderRadius : 1}}>
            <span style={{visibility : 'hidden'}}>
                line
            </span>
        </Box>
    </div>
)
