import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {
    Button,
    Card, CardActions, CardContent,
    CardMedia, CircularProgress,
    Container,
    FormControl,
    Grid2,
    InputLabel,
    MenuItem,
    Stack,
    TextField, Typography
} from "@mui/material";
import Select from '@mui/material/Select';
import {useRef, useState} from "react";
import {ListDetailModal} from "@/Pages/HistoryPage/ListDetailModal.jsx";

export default function HistoryMain() {
    const [open ,setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const custPhone = useRef(null);
    const custName = useRef(null);
    const [searchBy, setSearchBy] = useState(0);
    const [listSku, setListSku] = useState([]);
    const [listSelected, setListSelected] = useState()

    const handelSearch = async () => {
        setLoading(true)
        // console.log(phone.current.value)
        const {data, status} = await axios.post('/history/search',{
            search : searchBy === 0 ? custPhone.current.value : custName.current.value,
            type : searchBy === 0 ? 'phone' : 'name'
        })
        console.log(data,status)
        setListSku(data)
        setLoading(false)
    }
    return (
        <>
            {open && <ListDetailModal open={open} setOpen={setOpen} selected={listSelected}/>}
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
                        {!loading ? (
                            <Grid2 container spacing={2}>
                                {listSku.map((item,index) => (
                                    <Grid2 key={index} size={{md: 3, xl: 2, sm: 6}}>
                                        <Card>
                                            <CardMedia
                                                sx={{height: 140, width: '100%'}}
                                                image={item.image_sku}
                                                title="green iguana"
                                            />
                                            <CardContent>
                                                <Stack direction='column' spacing={1}>
                                                    <Typography variant="h6">
                                                        SN : {item.serial_id}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                                        รหัสสินค้า : {item.pid}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                                        ชื่อสินค้า : {item.p_name}
                                                    </Typography>
                                                </Stack>
                                            </CardContent>
                                            <CardActions>
                                                <Button onClick={() => {
                                                    setListSelected(item)
                                                    setOpen(true)
                                                }} size="small">ประวัติการซ่อม</Button>
                                            </CardActions>
                                        </Card>
                                    </Grid2>
                                ))}
                            </Grid2>
                        ) : (
                            <CircularProgress/>
                        )}

                    </div>

                </Container>
            </AuthenticatedLayout>
        </>
    )
}
