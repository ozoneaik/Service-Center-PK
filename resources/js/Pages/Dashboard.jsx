import {useEffect} from "react";
import {router} from "@inertiajs/react";

export default function Dashboard(){
    useEffect(() => {
        redirectToRepair();
    }, []);

    const redirectToRepair = async () => {
        // await router.get(route('repair.index'));
    }
    return (
        <>Dashboard</>
    )
}
