import {Box, Card, CardContent, Grid2, Tab, Tabs} from "@mui/material";
import React, {useState} from "react";

export default function RpUploadFile() {
    const [tabValue, setTabValue] = useState(0);
    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                <Card variant='outlined'>
                    <CardContent>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={tabValue}
                                onChange={(_, newValue) => setTabValue(newValue)}
                                aria-label="tabs"
                            >
                                <Tab label="ภาพประกอบสำหรับการเคลม" />
                                <Tab label="สำหรับศูนย์ซ่อมใช้ภายใน" />
                            </Tabs>
                        </Box>

                        <CustomTabPanel value={tabValue} index={0}>
                            0
                        </CustomTabPanel>

                        <CustomTabPanel value={tabValue} index={1}>
                            1
                        </CustomTabPanel>
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>
    )
}

const CustomTabPanel = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
    >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
);
