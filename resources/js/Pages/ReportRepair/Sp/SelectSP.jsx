import {Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import {ImagePreview} from "@/Components/ImagePreview.jsx";


export default function SelectSP({pid, list, selected, setSelected, warranty = false, sp_warranty = []}) {
    const spPath = import.meta.env.VITE_IMAGE_PATH + pid;

    const handleOnChange = (item, e) => {
        const checked = e.target.checked;
        if (warranty) {
            item.price_per_unit = 0
            item.spunit = 'อัน'
        }
        if (sp_warranty.some(w => w.spcode === item.spcode)) {
            warranty = true
            item.warranty = true
        } else {
            warranty = false
            item.warranty = false
        }
        console.log(warranty,item)

        setSelected(prevSelected =>
            checked
                ? {...prevSelected, sp: [...prevSelected.sp, item]}
                : {
                    ...prevSelected,
                    sp: prevSelected.sp.filter(spItem => spItem.spcode !== item.spcode)
                }
        );
        // if (!warranty) {
        //     setSelected(prevSelected =>
        //         checked
        //             ? {...prevSelected, sp: [...prevSelected.sp, item]}
        //             : {
        //                 ...prevSelected,
        //                 sp: prevSelected.sp.filter(spItem => spItem.spcode !== item.spcode)
        //             }
        //     );
        // } else {
        //     setSelected(prevSelected =>
        //         checked
        //             ? {...prevSelected, sp_warranty: [...prevSelected.sp_warranty, item]}
        //             : {
        //                 ...prevSelected,
        //                 sp_warranty: prevSelected.sp_warranty.filter(spItem => spItem.spcode !== item.spcode)
        //             }
        //     );
        // }
    };

    return (
        <Table stickyHeader>
            <TableHead>
                <TableRow sx={{fontWeight: 'bold'}}>
                    <TableCell width={10}>เลือก</TableCell>
                    <TableCell width={10}>รูปภาพ</TableCell>
                    <TableCell>รหัสอะไหล่</TableCell>
                    <TableCell>ชื่ออะไหล่</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {list && list.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            {warranty ? (
                                <>#</>
                            ) : (
                                <Checkbox
                                    checked={selected.sp.some(l =>
                                        item.spcode === l.spcode
                                    )}
                                    onChange={(e) => handleOnChange(item, e)}
                                />
                            )}
                        </TableCell>
                        <TableCell>
                            <ImagePreview src={spPath + '/' + item.spcode + '.jpg'}/>
                        </TableCell>
                        <TableCell>{item.spcode}</TableCell>
                        <TableCell>{item.spname}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
