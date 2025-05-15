import {Button, Dialog, DialogContent, DialogTitle, FormControl, FormLabel, Stack, TextField} from "@mui/material";
import {useForm} from "@inertiajs/react";

export default function UpdateSale({open, setOpen, sale}) {

    const {data, processing, put, setData} = useForm({
        'sale_code': sale.sale_code,
        'sale_name': sale.name,
        'lark_token': sale.lark_token
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data)
        put(route('Sales.update', {id: sale.id}),{
            onFinish : (e) => {
                setOpen(false)
            }
        })
    }

    const handleOnChange = (e) => {
        const {name, value} = e.target;
        setData(name, value);
    }

    const handleCloseModal = (event, reason) => {
        if (!(reason === 'escapeKeyDown' || reason === 'backdropClick')) {
            setOpen(false);
        }
    }
    return (
        <Dialog open={open} onClose={handleCloseModal}>
            <DialogTitle id="alert-dialog-title">
                {'แก้ไขข้อมูล เซลล์'}
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Stack direction='column' spacing={2} minWidth={400}>
                        <FormControl>
                            <FormLabel htmlFor='sale_code'>รหัสเซลล์</FormLabel>
                            <TextField
                                value={data.sale_code} size='small'
                                id='sale_code' name='sale_code'
                                onChange={handleOnChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor='sale_name'>ชื่อ</FormLabel>
                            <TextField
                                value={data.sale_name} size='small'
                                id='sale_name' name='sale_name'
                                onChange={handleOnChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor='lark_token'>lark token</FormLabel>
                            <TextField
                                value={data.lark_token} size='small' type='password'
                                id='lark_token' name='lark_token' onChange={handleOnChange}
                            />
                        </FormControl>
                        <Button loading={processing} color='secondary' variant='contained'
                                onClick={() => setOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button loading={processing} type='submit' variant='contained'>
                            อัพเดท
                        </Button>
                    </Stack>
                </form>
            </DialogContent>
        </Dialog>
    )
}
