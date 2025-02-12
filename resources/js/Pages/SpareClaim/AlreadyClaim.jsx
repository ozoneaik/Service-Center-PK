import {Button, Stack, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import PreviewIcon from "@mui/icons-material/Preview";
import {useState} from "react";
import DialogDetail from "@/Pages/SpareClaim/DialogDetail.jsx";
import {router} from "@inertiajs/react";
import {AlertDialog} from "@/Components/AlertDialog.js";

export default function AlreadyClaim({spareParts}) {
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState();
    const [selected, setSelected] = useState(spareParts.map(item => ({
        ...item,
        checked: false,
        detail: item.detail.map(detailItem => ({...detailItem, checked: false}))
    })));

    const showModal = (data) => {
        setDetail(data.detail);
        setOpen(true);
    };

    const selectAll = (event) => {
        const checked = event.target.checked;
        setSelected(prevSelected =>
            prevSelected.map(item => ({
                ...item, checked,
                detail: item.detail.map(detailItem => ({
                    ...detailItem, checked
                }))
            }))
        );
    };

    const handleCheckboxChange = (index) => {
        setSelected(prevSelected =>
            prevSelected.map((item, i) => i === index ? {...item, checked: !item.checked} : item)
        );
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const formData = selected.filter((item) => item.checked === true);
        let message = '';
        let Status
        AlertDialog({
            icon: 'question',
            title: 'ยืนยันการบันทึก',
            text: 'กด ตกลง เพื่อสร้างเอกสารเคลมอะไหล่',
            onPassed: async (confirm) => {
                if (confirm) {
                    try {
                        const {data, status} = await axios.post('/claim/store', {
                            selected: formData
                        });
                        message = data.message;
                        Status = status;
                    } catch (error) {
                        message = error.response.data.message ?? 'มีปัญหาทาง server';
                        Status = error.response.status
                    } finally {
                        AlertDialog({
                            icon: Status === 200 ? 'success' : 'error',
                            text: message,
                            onPassed: () => {
                                if (Status === 200) window.location.reload()
                            }
                        })
                    }
                } else console.log('ไม่ได้กด confirm')
            }
        })

    }

    return (
        <>
            {open && <DialogDetail sparePartsDetail={detail} open={open} setOpen={setOpen} data={[1, 2, 3, 4]}/>}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Checkbox onChange={selectAll} checked={selected.every(item => item.checked)}/>
                        </TableCell>
                        <TableCell>รหัสอะไหล่</TableCell>
                        <TableCell>ชื่ออะไหล่</TableCell>
                        <TableCell>จำนวน</TableCell>
                        <TableCell>หน่วย</TableCell>
                        <TableCell>รายละเอียด</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {selected.map((item, index) => (
                        <TableRow key={index} sx={{backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent'}}>
                            <TableCell>
                                <Checkbox
                                    checked={item.checked}
                                    onChange={() => handleCheckboxChange(index)}
                                />
                            </TableCell>
                            <TableCell>{item.sp_code}</TableCell>
                            <TableCell>{item.sp_name}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>{item.sp_unit}</TableCell>
                            <TableCell>
                                <Button onClick={() => showModal(item)}>
                                    <PreviewIcon/>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <form onSubmit={onSubmit}>
                <Stack direction='row-reverse' spacing={2} m={2}>
                    <Button variant='contained' type='submit'>
                        สร้างเอกสารเคลม
                    </Button>
                </Stack>
            </form>
        </>
    );
}
