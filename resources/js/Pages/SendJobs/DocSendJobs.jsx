import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";

export default function DocSendJobs({jobs}){
    return (
        <AuthenticatedLayout>
            <Head title={'ทำใบ'}/>
            ทำใบ
        </AuthenticatedLayout>
    )
}
