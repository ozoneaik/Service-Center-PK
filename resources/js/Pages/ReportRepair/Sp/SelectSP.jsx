import {Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import ProductImage from "@/Pages/ReportRepair/Sp/ProductImage.jsx";
import {useEffect} from "react";


export default function SelectSP({pid, list, selected, setSelected, warranty = false, sp_warranty = []}) {
    const spPath = import.meta.env.VITE_IMAGE_PATH + pid;

    useEffect(() => {
        console.log('hello')
        Fetch();
    }, []);

    const Fetch = async () => {
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        fetch("https://images.pumpkin.tools/A%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%20%e0%b9%81%e0%b8%a5%e0%b8%b0%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%e0%b9%84%e0%b8%a3%e0%b9%89%e0%b8%aa%e0%b8%b2%e0%b8%a2/50227/SP50227-30.jpg", requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
    }

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
        console.log(warranty, item)

        setSelected(prevSelected =>
            checked
                ? {...prevSelected, sp: [...prevSelected.sp, item]}
                : {
                    ...prevSelected,
                    sp: prevSelected.sp.filter(spItem => spItem.spcode !== item.spcode)
                }
        );
    };

    const fetchImage = async (spcode) => {
        const path = spPath + '/' + spcode + '.jpg'
        try {
            const {status} = await axios.get(path,{
                headers : {
                    "Content-Type" : 'image/jpeg'
                }
            });
            console.log(status)
            if (status === 200) {
                return path;
            }else{
                return 'https://images.dcpumpkin.com/images/product/500/default.jpg';
            }
        }catch (error) {
            console.log(error.response.status)
        }
    }

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
                    <TableRow key={index}
                              sx={
                                  item.price_per_unit === '-' ? {backgroundColor: '#fdeded'}
                                      : sp_warranty.find(it => it.spcode === item.spcode) ?
                                      {backgroundColor: '#edf7ed'} : {backgroundColor: 'white'}
                              }
                    >
                        <TableCell>
                            {warranty ? (
                                <>#</>
                            ) : (
                                <Checkbox
                                    checked={selected.sp.some(l =>
                                        item.spcode === l.spcode
                                    )}
                                    disabled={item.price_per_unit === '-'}
                                    onChange={(e) => handleOnChange(item, e)}
                                />
                            )}
                        </TableCell>
                        <TableCell>

                            {/*<ImagePreview src={spPath + '/' + item.spcode + '.jpg'}/>*/}
                            {/*<ProductImage spcode={item.spcode} spPath={spPath} />*/}

                        </TableCell>
                        <TableCell>{item.spcode}</TableCell>
                        <TableCell>{item.spname}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
