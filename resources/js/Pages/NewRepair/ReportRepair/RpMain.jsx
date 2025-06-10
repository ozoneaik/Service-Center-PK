import {Box, Grid2, Tab, Tabs} from "@mui/material";
import PropTypes from "prop-types";
import {useState} from "react";
import RpTab2Form from "@/Pages/NewRepair/Tab2/RpTab2Form.jsx";
import RpTab1Form from "@/Pages/NewRepair/Tab1/RpTab1Form.jsx";


function CustomTabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{py : 3}}>{children}</Box>}
        </div>
    )
}

export default function RpMain({productDetail,serial_id}) {
    const [tabValue, setTabValue] = useState(0);

    console.log('productDetail', productDetail)
    console.log('serial_id', serial_id)

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    }

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={tabValue} onChange={handleChange} aria-label='tabs-for-repair'>
                        <Tab label='บันทึกข้อมูลแจ้งซ่อม' {...a11yProps(0)}/>
                        <Tab label='บันทึกการซ่อม' {...a11yProps(1)}/>
                    </Tabs>
                </Box>

                <CustomTabPanel index={0} value={tabValue}>
                    <RpTab1Form/>
                </CustomTabPanel>

                <CustomTabPanel index={1} value={tabValue}>
                    <RpTab2Form productDetail={productDetail} serial_id={serial_id}/>
                </CustomTabPanel>
            </Grid2>
        </Grid2>
    )
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

