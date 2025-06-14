import {Box, LinearProgress, Typography} from "@mui/material";
import React from "react";

export const FileUploading = ({uploadProgress}) => (
    <Box sx={{mt: 2}}>
        <Typography variant="body2" gutterBottom>
            กำลังอัปโหลด... {uploadProgress}%
        </Typography>
        <LinearProgress variant="determinate" value={uploadProgress}/>
    </Box>
)
