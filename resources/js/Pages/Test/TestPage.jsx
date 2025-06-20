import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {Button, Typography, useMediaQuery} from "@mui/material";

function createData(name, calories, fat, carbs, protein, price) {
    return {
        name,
        calories,
        fat,
        carbs,
        protein,
        price,
        history: [
            {
                date: '2020-01-05',
                customerId: '11091700',
                amount: 3,
            },
            {
                date: '2020-01-02',
                customerId: 'Anonymous',
                amount: 1,
            },
        ],
    };
}

function Row(props) {
    const {row} = props;
    const [open, setOpen] = React.useState(false);

    const isMobile = useMediaQuery('(max-width:600px)');

    return (
        <React.Fragment>
            <TableRow
                sx={{
                    '&:hover': {backgroundColor: '#ccc'},
                    '& > *': {borderBottom: 'unset'},
                }}
                onClick={() => isMobile && setOpen(!open)}
            >
                {isMobile && (
                    <TableCell>
                        <IconButton onClick={() => setOpen(!open)}>
                            {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                        </IconButton>
                    </TableCell>
                )}
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.calories}</TableCell>
                {!isMobile && (
                    <>
                        <TableCell>{row.fat}</TableCell>
                        <TableCell>{row.carbs}</TableCell>
                        <TableCell>{row.protein}</TableCell>
                    </>
                )}
            </TableRow>
            {isMobile && (
                <TableRow>
                    <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{margin: 1}}>
                                <Typography>จำนวน : {row.fat}</Typography>
                                <Typography>ราคา :  {row.carbs}</Typography>
                                <Typography>ราคารวม : {row.protein}</Typography>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
}

const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0, 3.99),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3, 4.99),
]

export default function TestPage() {
    const isMobile = useMediaQuery('(max-width:600px)');
    return (
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow sx={{backgroundColor : 'gray'}}>
                        {isMobile && <TableCell/>}
                        <TableCell>รูป</TableCell>
                        <TableCell>รหัสและชื่ออะไหล่</TableCell>
                        {!isMobile && (
                            <>
                                <TableCell>จำนวน</TableCell>
                                <TableCell>ราคา</TableCell>
                                <TableCell>ราคารวม</TableCell>
                            </>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <Row key={row.name} row={row}/>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
