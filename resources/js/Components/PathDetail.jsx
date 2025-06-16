import {Box, Typography} from "@mui/material";

export const PathDetail = ({name, Sn,job_id = '',jobStatus =''}) => (
    <div style={{marginTop: '1.5rem',marginBottom : '1rem'}}>
        <Typography color='primary' fontWeight='bold'>
            Home {'>'} {name} {'>'} {Sn} {job_id && `> ${job_id}`} {jobStatus && `> ${jobStatus}`}
        </Typography>
        <Box width='100%' bgcolor='#f25822' sx={{height: 10, borderRadius: 1}}>
            <span style={{visibility: 'hidden'}}>
                line
            </span>
        </Box>
    </div>
)
