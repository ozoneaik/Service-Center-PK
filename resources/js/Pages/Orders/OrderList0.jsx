import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Button, Container, Grid2, Paper, Stack, TextField} from "@mui/material";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import {useRef, useState} from "react";
import CardView from "@/Pages/Orders/CardView.jsx";
import RowView from "@/Pages/Orders/RowView.jsx";
import SumOrder from "@/Pages/Orders/SumOrder.jsx";

export default function OrderList0() {
    const [cardView, setCardView] = useState(true);
    const [dmPreview, setDmPreview] = useState('');
    const [spList, setSpList] = useState([]);
    const searchSku = useRef(null);
    const [open,setOpen] = useState(false);
    const handleSearch = async (e) => {
        e.preventDefault();
        const {data, status} = await axios.post('https://slip.pumpkin.tools/diagrams/diagram.php', {
            productOrModel: searchSku.current.value,
            serialNumber: ""
        });
        console.log(data, status)
        if (status === 200) {
            console.log(data, status)
            setSpList(data.data);
            setDmPreview(data.data[0].pathfile_dm + data.data[0].namefile_dm);

        } else {
            setSpList([]);
            setDmPreview('');
        }
    }
    return (
        <AuthenticatedLayout>
            {open && <SumOrder open={open} setOpen={setOpen}/>}
            <Container maxWidth='false' sx={{backgroundColor : 'white',p : 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <form onSubmit={handleSearch}>
                            <Stack direction='row' spacing={2}>
                                <TextField required inputRef={searchSku} fullWidth label='ค้นหารหัสสินค้า' type='text'/>
                                <Button type='submit' variant='contained'>ค้นหา</Button>
                                <Button onClick={()=>setOpen(true)} startIcon={<AddShoppingCartIcon/>} color='secondary'
                                        variant='contained'>1</Button>
                            </Stack>
                        </form>
                    </Grid2>
                    {spList.length > 0 && (
                        <>
                            <Grid2 size={{md: 3, sm: 12}}>
                                <img width='100%'
                                     src={dmPreview || ''}
                                     alt='no image'/>
                            </Grid2>
                            <Grid2 size={{md: 9, sm: 12}}>
                                <Paper sx={{p: 3}} >
                                    <Grid2 container spacing={2}>
                                        <Stack direction='row' spacing={2} sx={{width: '100%'}}>
                                            <TextField fullWidth label={'ต้นหาอะไหล่'}/>
                                            <Button variant='contained' size='small'>ค้นหาอะไหล่</Button>
                                            <Button onClick={() => setCardView(!cardView)} color='inherit'
                                                    variant='contained' size='small'>
                                                <MenuIcon/>
                                            </Button>
                                        </Stack>
                                        <Grid2 container spacing={2} height={600} sx={{overflowY: 'scroll'}}>
                                            {cardView ? <CardView spList={spList}/> : <RowView spList={spList}/>}
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            </Grid2>
                        </>
                    )}

                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
