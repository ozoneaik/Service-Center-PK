import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Container} from "@mui/material";

export default function AdminMainPage(){
    return (
        <AuthenticatedLayout>
            <aside style={{backgroundColor : 'white',width : 300,height: `calc(100vh - 4rem)`,padding : 10}}>
                <ul>
                    <li>joker</li>
                </ul>
            </aside>
        </AuthenticatedLayout>
    )
}
