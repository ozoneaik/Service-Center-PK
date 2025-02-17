import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Button, Card,
    Container,
    Grid2,
    Stack,
    Table, TableBody, TableCell, TableHead, TableRow, TextField,
    Typography,
    Box
} from "@mui/material";
import { useRef, useState } from "react";
import { ImagePreview } from "@/Components/ImagePreview.jsx";
import Checkbox from "@mui/material/Checkbox";

export default function OrderList() {
    const search = useRef(null);
    const [diagram, setDiagram] = useState('');
    const [productDetail, setProductDetail] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [quantities, setQuantities] = useState({});

    const searchProduct = async () => {
        const productOrModel = search.current.value;
        const { data, status } = await axios.post('https://slip.pumpkin.tools/diagrams/diagram.php', {
            productOrModel,
            serialNumber: ""
        });

        if (status === 200) {
            console.log(data, status)
            setProductDetail(data.data);
            setDiagram(data.data[0].pathfile_dm + data.data[0].namefile_dm);
            // Reset selections when new search is performed
            setSelectedItems({});
            setQuantities({});
        } else {
            setProductDetail([]);
            setDiagram('');
        }
    };

    const handleSelectAll = (event) => {
        const newSelectedItems = {};
        const newQuantities = {};

        if (event.target.checked) {
            productDetail.forEach(item => {
                newSelectedItems[item.skusp] = true;
                newQuantities[item.skusp] = quantities[item.skusp] || 1;
            });
        }

        setSelectedItems(newSelectedItems);
        setQuantities(newQuantities);
    };

    const handleSelectItem = (skusp) => {
        setSelectedItems(prev => {
            const newSelected = { ...prev };
            if (newSelected[skusp]) {
                delete newSelected[skusp];
                // Also remove quantity when unselecting
                setQuantities(prev => {
                    const newQuantities = { ...prev };
                    delete newQuantities[skusp];
                    return newQuantities;
                });
            } else {
                newSelected[skusp] = true;
                // Set default quantity of 1 when selecting
                setQuantities(prev => ({
                    ...prev,
                    [skusp]: 1
                }));
            }
            return newSelected;
        });
    };

    const handleQuantityChange = (skusp, value) => {
        const quantity = Math.max(1, parseInt(value) || 1);
        setQuantities(prev => ({
            ...prev,
            [skusp]: quantity
        }));
    };

    const handleOrder = () => {
        const orderItems = productDetail
            .filter(item => selectedItems[item.skusp])
            .map(item => ({
                skusp: item.skusp,
                skuspname: item.skuspname,
                quantity: quantities[item.skusp] || 1,
                price: item.stdprice,
                total: (quantities[item.skusp] || 1) * item.stdprice
            }));

        // Calculate order total
        const orderTotal = orderItems.reduce((sum, item) => sum + item.total, 0);

        console.log('Order Details:', { items: orderItems, total: orderTotal });
        // Here you would typically make an API call to submit the order
    };

    const getSelectedItemsCount = () => Object.keys(selectedItems).length;

    const getOrderTotal = () => {
        return productDetail
            .filter(item => selectedItems[item.skusp])
            .reduce((total, item) => total + (item.stdprice * (quantities[item.skusp] || 1)), 0);
    };

    return (
        <AuthenticatedLayout>
            <Container maxWidth='false' style={{marginTop: 10}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' spacing={1}>
                            <TextField
                                inputRef={search}
                                fullWidth
                                size='small'
                                sx={{backgroundColor: 'white'}}
                                placeholder={'ค้นหา serial'}
                            />
                            <Button
                                onClick={searchProduct}
                                variant='contained'
                            >
                                ค้นหา
                            </Button>
                        </Stack>
                    </Grid2>
                    <Grid2 size={{lg: 5, md: 6}}>
                        <ImagePreview width='70%' src={diagram}/>
                    </Grid2>
                    <Grid2 size={{lg: 7, md: 6}} height={700} overflow='scroll'>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Checkbox
                                            checked={getSelectedItemsCount() === productDetail.length && productDetail.length > 0}
                                            onChange={handleSelectAll}
                                            indeterminate={getSelectedItemsCount() > 0 && getSelectedItemsCount() < productDetail.length}
                                        />
                                    </TableCell>
                                    <TableCell>รูปภาพ</TableCell>
                                    <TableCell>รหัสอะไหล่</TableCell>
                                    <TableCell>ชื่ออะไหล่</TableCell>
                                    <TableCell>ราคาต่อหน่วย</TableCell>
                                    <TableCell>จำนวน</TableCell>
                                    <TableCell>ราคารวม</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productDetail.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Checkbox
                                                checked={!!selectedItems[item.skusp]}
                                                onChange={() => handleSelectItem(item.skusp)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <ImagePreview
                                                src={item.pathfile_sp + item.skufg + '/' + item.namefile_sp}
                                            />
                                        </TableCell>
                                        <TableCell>{item.skusp}</TableCell>
                                        <TableCell>{item.skuspname}</TableCell>
                                        {/*<TableCell>{item.stdprice.toLocaleString()} บาท</TableCell>*/}
                                        <TableCell>{item.price ?? 0}</TableCell>
                                        <TableCell>
                                            {selectedItems[item.skusp] && (
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={quantities[item.skusp] || 1}
                                                    onChange={(e) => handleQuantityChange(item.skusp, e.target.value)}
                                                    inputProps={{ min: 1 }}
                                                    sx={{ width: '80px' }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {selectedItems[item.skusp]
                                                ? ((quantities[item.skusp] || 1) * item.price).toLocaleString() + ' บาท'
                                                : '-'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Grid2>
                    <Grid2 size={{lg: 12, md: 6}}>
                        <Card sx={{ p: 2, mt: 2 }}>
                            <Stack spacing={2}>
                                <Typography variant='h5'>สั่งซื้ออะไหล่</Typography>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography>
                                        รายการที่เลือก: {getSelectedItemsCount()} รายการ
                                    </Typography>
                                    <Typography variant="h6">
                                        ยอดรวมทั้งสิ้น: {getOrderTotal().toLocaleString()} บาท
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={getSelectedItemsCount() === 0}
                                        onClick={handleOrder}
                                    >
                                        ยืนยันการสั่งซื้อ
                                    </Button>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}
