import { usePage } from "@inertiajs/react";
import { CircularProgress, Dialog, DialogContent } from "@mui/material";
import { useEffect, useState } from "react";

export default function StockSpDetail({ open, setOpen,sp_code = null }) {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchData().finally(() => setLoading(false));
    }, []);
    const fetchData = async () => {
        try {
            setLoading(true);
            const { data, status } = await axios.get(route('stockSp.detail', {
                sp_code: 'joker', is_code_cust_id: auth.user.is_code_cust_id
            }));
            console.log(data, status);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogContent>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <></>
                )}

            </DialogContent>
        </Dialog>
    )
}