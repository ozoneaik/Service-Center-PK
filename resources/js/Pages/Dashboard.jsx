import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import {
    Box,
    Button,
    Card, CardActionArea,
    CardContent,
    Container,
    Dialog,
    DialogContent, Divider,
    Grid2,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import {Search, Edit, ManageHistory, YouTube, MenuBook} from '@mui/icons-material';
import ProductDetail from '@/Components/ProductDetail';
import {useEffect, useState} from 'react';
import Progress from "@/Components/Progress.jsx";
import {AlertDialog, AlertDialogQuestionForSearch, AlertWithFormDialog} from "@/Components/AlertDialog.js";
import FormRepair from "@/Pages/ReportRepair/FormRepair.jsx";
import {PathDetail} from "@/Components/PathDetail.jsx";
import ListHistoryRepair from "@/Pages/HistoryRepair/ListHistoryRepair.jsx";


const ModalSelectSkuComponent = ({open, setOpen, selectSku, onSelect}) => {
    const [selectedCard, setSelectedCard] = useState();
    const [selectedItem, setSelectedItem] = useState();

    console.log(selectSku)

    const handleSelect = (index, sku) => {
        setSelectedItem(sku)
        setSelectedCard(index);
    }

    const handleSelectConfirm = () => {
        onSelect(selectedItem);
        setOpen(false);
    }

    const handleClose = (e,reason) => {
        if (reason === 'escapeKeyDown' || reason === 'backdropClick') {
            return ;
        }

        setOpen(false);
    }
    return (
        <Dialog
            open={open}
            onClose={handleClose}
        >
            <DialogContent>
                <Typography variant='h6' fontWeight='bold' mb={2}>เลือกสินค้าที่ต้องการซ่อม</Typography>
                <Stack direction={{sm: 'column', md: 'row'}} spacing={2} mb={3}>
                    {selectSku.list_sku && selectSku.list_sku.length > 0 && selectSku.list_sku.map((sku, index) => {
                            const pImage = import.meta.env.VITE_IMAGE_PID + sku.pid + '.jpg';
                            return (
                                <Card key={index} variant='outlined'>
                                    <CardActionArea
                                        data-active={selectedCard === index ? '' : undefined}
                                        sx={{
                                            height: '100%',
                                            '&[data-active]': {
                                                backgroundColor: 'green',
                                            },
                                        }}
                                        onClick={() => handleSelect(index, sku)}
                                    >
                                        <CardContent>
                                            <Stack direction='column' spacing={2}>
                                                <Box width='100%'>
                                                    <img src={pImage} width={200} alt=""/>
                                                </Box>
                                                <Divider/>
                                                <Typography>{sku.pid}</Typography>
                                                <Typography>{sku.pname}</Typography>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            )
                        }
                    )}
                </Stack>
                <Stack direction={{sm: 'column', md: 'row'}} spacing={2}>
                    <Button onClick={handleSelectConfirm} fullWidth disabled={!selectedItem} variant='contained'>
                        เลือก {selectedItem && `รหัสสินค้า ${selectedItem.pid} แล้ว`}
                    </Button>
                    <Button fullWidth onClick={() => setOpen(false)} variant='outlined' color='error'>
                        ยกเลิก
                    </Button>
                </Stack>

            </DialogContent>
        </Dialog>
    )
}

export default function Dashboard({SN, JOB_ID}) {
    useEffect(() => {
        if (SN && JOB_ID) {
            fetchData(SN, false).then();
        }
    }, [])

    const searchFormHistory = async () => {
        console.log(SN, JOB_ID)
    }


    const [check, setCheck] = useState('before');
    const [detail, setDetail] = useState();
    const [processing, setProcessing] = useState(false);
    const [sn, setSn] = useState(SN || '');
    const [showContent, setShowContent] = useState();


    // เมื่อพบว่า sn เป็น combo set
    const [selectSku, setSelectSku] = useState();
    const [selectedSku, setSelectedSku] = useState({sn : '', pid : ''});
    const [modalSelectSku, setModalSelectSku] = useState(false);


    useEffect(() => {
        if (selectedSku.pid && selectedSku.sn) {
            searchDetailAfter().finally(()=> setSelectedSku({
                sn  : '',
                pid : ''
            }));
        }
    }, [selectedSku]);

    const fetchData = async (ser, createJob) => {
        setProcessing(true);
        try {

            const {data, status} = await axios.post('/search', {
                sn: ser,
                views: 'single',
                pid : selectedSku.pid || null,
                createJob: createJob
            });
            if (status === 202) { //   // เมื่อพบว่า sn เป็น combo set
                setSelectSku(data);
                setModalSelectSku(true)
            }
            if (data.status === 'SUCCESS') {
                const responseData = data.searchResults;
                console.log(data.searchResults)
                setDetail(responseData)
                setSn(null);
                document.getElementById('search').value = null;
            }
        } catch (err) {
            setDetail();
            console.log(err)
            AlertDialog({
                title: 'เกิดข้อผิดพลาด', text: err.response.data.message, onPassed: () => {
                }
            })
        } finally {
            setProcessing(false);
            setShowContent();
        }
    }

    const checkSn = async (SN = sn) => {
        try {
            const {data, status} = await axios.get(`/jobs/check/${SN}`,{
                params : {pid : selectedSku.pid}
            });
            console.log(data, status)
            return {
                message: data.message,
                status: status
            }
        } catch (error) {
            console.error(error.response.data.message)
            return {
                message: error.response.data.message,
                status: error.response.status ?? 500
            }
        }
    }

    const fetchDataBySku = async () => {
        await AlertWithFormDialog({
            icon: 'question',
            title: 'คุณได้กรอกซีเรียลเลข 9999',
            text: 'โปรดระบุรหัสสินค้าที่ต้องการแจ้งซ่อม',
            res: async (confirm, value) => {
                confirm && await searchDetailSku(value)
            }
        });
    };

    const searchDetailSku = async (sku) => {
        try {
            setProcessing(true)
            const {data, status} = await axios.post(route('search.sku'), {sku});
            console.log('search Detail Sku ==> ', data, status);
            setSn(data.serial_id);
            const response = await checkSn(data.serial_id);
            if (response.status === 200) {
                if (data.message === 'ไม่พบประวัติการซ่อมจากระบบ') {
                    alert(data.message)
                    await fetchData(data.serial_id, true);
                } else {
                    await fetchData(data.serial_id, false);
                }
            } else if (response.status === 400) {
                console.log('error >> ', response)
                const showConfirmButton = !(response.message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น' || response.message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin');
                AlertDialogQuestionForSearch({
                    title: response.message,
                    cancelButtonText: response.message === 'ไม่พบประวัติการซ่อมจากระบบ' || response.message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น' ? 'ปิด' : response.message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin' ? 'ปิด' : 'ดูแค่ประวัติการซ่อม',
                    text: 'เลือกเมนูดังต่อไปนี้',
                    showConfirmButton,
                    message: response.message,
                    onPassed: async (confirm) => {
                        if (confirm) {
                            const result = str.slice(0, 4);
                            console.log(result);
                            if (result === '9999') {
                            } else {
                                await fetchData(sn, true);
                            }
                        } else {
                            if (response.message === 'ไม่พบประวัติการซ่อมจากระบบ') return;
                            if (response.message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น') return;
                            if (response.message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin') return;
                            await fetchData(sn, false)
                        }
                    }
                })
            } else if (status === 202) {
                alert('hello')
            } else {
                AlertDialog({
                    title: 'เกิดข้อผิดพลาด',
                    text: message || 'error',
                })
            }
            setProcessing(false);
        } catch (error) {
            console.log(error.response.data, error.response.status);
        }
    }


    const searchDetail = async (e) => {
        e.preventDefault();


        if (sn === '9999') {
            console.log('ค้นหารหัส 🔍 sn === 9999')
            await fetchDataBySku()
        } else {
            console.log('ค้นหารหัส 🔍 sn !== 9999')
            await searchDetailAfter();
        }
    }

    const searchDetailAfter = async () => {
        const {message, status} = await checkSn();
        console.log(message, status);
        if (status === 200) {
            if (message === 'ไม่พบประวัติการซ่อมจากระบบ') {
                await fetchData(sn, true);
            } else {
                await fetchData(sn, false);
            }
            // await fetchData(sn, false);
        } else if (status === 400) {
            const showConfirmButton = !(message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น' || message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin');
            AlertDialogQuestionForSearch({
                title: message,
                cancelButtonText: message === 'ไม่พบประวัติการซ่อมจากระบบ' || message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น' ? 'ปิด' : message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin' ? 'ปิด' : 'ดูแค่ประวัติการซ่อม',
                text: 'เลือกเมนูดังต่อไปนี้',
                showConfirmButton,
                message,
                onPassed: async (confirm) => {
                    if (confirm) {
                        await fetchData(sn, true);
                    } else {
                        if (message === 'ไม่พบประวัติการซ่อมจากระบบ') return;
                        if (message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น') return;
                        if (message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin') return;
                        await fetchData(sn, false)
                    }
                }
            })
        } else {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: message,
            })
        }
        setProcessing(false);
    }

    const ButtonLink = ({icon, title, color, menu}) => (
        <Button disabled={showContent === menu} onClick={() => setShowContent(menu)} component='a' variant='contained'
                color={color} sx={{width: {xs: '100%', md: 150}}}>
            <Stack direction='column' justifyContent='center' alignItems='center'>
                {icon}
                {title}
            </Stack>
        </Button>
    )

    const ButtonList = () => {
        return (
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} justifyContent='start' alignItems='center'>
                <ButtonLink menu={1} icon={<Edit/>} title={'แจ้งซ่อม'} data={detail}
                            color='primary'/>
                <ButtonLink menu={2} icon={<ManageHistory/>} title={'ดูประวัติการซ่อม'}
                            data={detail} color='secondary'/>
                <ButtonLink menu={3} icon={<MenuBook/>} title={'คู่มือ'}
                            data={detail} color='pumpkinColor'/>
                <ButtonLink menu={4} icon={<YouTube/>} title={'วิดีโอที่เกี่ยวข้อง'}
                            data={detail} color='error'/>
            </Stack>
        )
    }

    const handleSelectSku = (sku) => {
        setSelectedSku(prevState => {
            return {
                ...prevState,
                sn : sn,
                pid: sku.pid
            }
        })
    }


    return (
        <AuthenticatedLayout>
            <Head title="หน้าหลัก"/>
            {modalSelectSku && <ModalSelectSkuComponent
                open={modalSelectSku}
                setOpen={setModalSelectSku}
                selectSku={selectSku}
                onSelect={(sku)=>handleSelectSku(sku)}
            />}
            <Container>
                <div className=" mt-4 p-4 ">
                    <Stack direction='column' spacing={1}>
                        <form onSubmit={searchDetail}>
                            <Grid2 container spacing={2}>
                                <Grid2 size={12} mb={10}>
                                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                                        <TextField id={'search'} sx={{backgroundColor: 'white'}}
                                                   placeholder='ค้นหาหมายเลขซีเรียล'
                                                   fullWidth autoComplete='off'
                                                   defaultValue={sn || ''}
                                                   onChange={(e) => setSn(e.target.value)}/>
                                        <Button sx={{minWidth: 100}} disabled={processing || !sn} type='submit'
                                                size='small' variant='contained'
                                                startIcon={<Search/>}>
                                            {processing && 'กำลัง'}ค้นหา
                                        </Button>
                                    </Stack>
                                </Grid2>
                            </Grid2>
                        </form>
                        {!processing ? (
                            <>
                                {detail && <ProductDetail {...detail} />}
                                {detail && !processing && <ButtonList/>}
                                {detail && showContent &&
                                    <PathDetail
                                        name={showContent === 1 ? 'แจ้งซ่อม' : 'ดูประวัติการซ่อม'}
                                        Sn={detail.serial}
                                    />
                                }
                                {detail && showContent === 1 &&
                                    <FormRepair
                                        detail={detail} setDetail={setDetail}
                                        check={check} setCheck={setCheck}
                                    />
                                }
                                {detail && showContent === 2 &&
                                    <ListHistoryRepair
                                        detail={detail} setDetail={setDetail}
                                        check={check} setCheck={setCheck}
                                    />
                                }

                                {detail && showContent === 3 &&
                                    (
                                        <div>
                                            กำลังพัฒนา
                                        </div>
                                    )
                                }

                                {detail && showContent === 4 &&
                                    (
                                        <Stack direction={{sm: 'row', xs: 'column'}} spacing={2}>
                                            <iframe width='100%' height="315"
                                                    src="https://www.youtube.com/embed/uZVqdkxYu9k?si=4rtZDIPeF8vznlhS"
                                                    title="YouTube video player"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    referrerPolicy="strict-origin-when-cross-origin"
                                                    allowFullScreen>
                                            </iframe>
                                        </Stack>
                                    )
                                }
                            </>
                        ) : <Progress/>}
                    </Stack>
                </div>
            </Container>
        </AuthenticatedLayout>
    );
}
