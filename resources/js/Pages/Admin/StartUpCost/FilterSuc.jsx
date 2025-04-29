import { Button, Grid2, InputAdornment, TextField } from "@mui/material";
import { PrecisionManufacturing, DriveFileRenameOutline, Search } from '@mui/icons-material';
import {useState } from "react";

export default function FilterSuc({onPassed}) {
    
    const [skuCode, setSkuCode] = useState('');
    const [skuName, setSkuName] = useState('');
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            onPassed({sku_code : skuCode,sku_name : skuName});
        }}
        >
            <Grid2 container spacing={2}>
                <Grid2 size={5}>
                    <TextField fullWidth size="small" label='รหัสสินค้า' value={skuCode || ''}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PrecisionManufacturing />
                                    </InputAdornment>
                                )
                            }
                        }}
                        onChange={(e) => setSkuCode(e.target.value)}
                    />
                </Grid2>
                <Grid2 size={5}>
                    <TextField fullWidth size="small" label='ชื่อสินค้า' value={skuName || ''}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <DriveFileRenameOutline />
                                    </InputAdornment>
                                )
                            }
                        }}
                        onChange={(e) => setSkuName(e.target.value)}
                    />
                </Grid2>
                <Grid2 size={2}>
                    <Button type="submit" variant="contained" fullWidth startIcon={<Search />}>
                        ค้นหา
                    </Button>
                </Grid2>
            </Grid2>
        </form>

    )
}