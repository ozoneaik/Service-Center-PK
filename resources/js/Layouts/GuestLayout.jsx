import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { Stack, Typography } from '@mui/material';
import Logo from '../assets/images/horizontalLogo.png'

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            {/* <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div> */}

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                <Stack direction='column' alignItems='center' spacing={2}>
                    <img src={Logo || ''} alt=""  width='100%'/>
                    <Typography variant='h5' sx={{color : '#f05423'}} fontWeight='bold'>SERVICE CENTER</Typography>
                </Stack>
                {children}
            </div>
        </div>
    );
}
