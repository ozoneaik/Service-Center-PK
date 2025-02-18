import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Button, Container, FormControl, Grid2, InputLabel, MenuItem, Stack, TextField} from "@mui/material";
import Select from '@mui/material/Select';
import {useRef, useState} from "react";
import {ListSku} from "@/Pages/HistoryPage/ListSku.jsx";

export default function HistoryMain() {
    const custPhone = useRef(null);
    const custName = useRef(null);
    const [searchBy, setSearchBy] = useState(0);
    const [listSku, setListSku] = useState([]);

    const handelSearch = async () => {
        console.log('hello world')
        // console.log(phone.current.value)
        const {data, status} = await axios.post('/history/search',{
            search : searchBy === 0 ? custPhone.current.value : custName.current.value,
            type : searchBy === 0 ? 'phone' : 'name'
        })
        console.log(data,status)
        setListSku(data)
    }
    return (
        <AuthenticatedLayout>
            <Head title="ประวัติซ่อม"/>
            <Container maxWidth='false'>
                <div className={'mt-4 p-4'}>
                    <Stack direction='row' spacing={2} mb={3}>
                        <TextField
                            inputRef={searchBy === 0 ? custPhone : custName}
                            placeholder={searchBy === 0 ? 'กรอกเบอร์โทรศัพท์' : 'กรอกชื่อลูกค้า'}
                            fullWidth size='small'
                        />
                        <FormControl>
                            <InputLabel id="demo-simple-select-label">เลือก</InputLabel>
                            <Select
                                size='small'
                                label="Age"
                                value={searchBy}
                                onChange={(e) => setSearchBy(e.target.value)}
                                variant='outlined'>
                                <MenuItem value={0}>ค้นหาด้วยเบอร์โทรศัพท์</MenuItem>
                                <MenuItem value={1}>ค้นหาด้วยชื่อ</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant='contained' onClick={()=>handelSearch()}>ค้นหา</Button>
                    </Stack>
                    <Grid2 container spacing={2}>
                        <ListSku listSku={listSku}/>
                    </Grid2>
                </div>

            </Container>
        </AuthenticatedLayout>
    )
}
