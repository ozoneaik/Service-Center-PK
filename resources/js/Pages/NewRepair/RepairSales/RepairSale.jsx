import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Paper } from "@mui/material";
import { useState } from "react";

// --- Icons Components ---
const SearchIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CalendarIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const PlusIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m-8-8h16" />
    </svg>
);

const PencilIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const TimesIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- Helper Components ---

const Pagination = ({ links }) => {
    if (!links || links.length === 0) return null;

    return (
        <div className="flex flex-wrap justify-center gap-1 mt-6">
            {links.map((link, key) => (
                link.url === null ? (
                    <div
                        key={key}
                        className="px-3 py-1 text-sm text-gray-400 bg-white border border-gray-200 rounded"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        href={link.url}
                        className={`px-3 py-1 text-sm border rounded hover:bg-gray-100 focus:outline-none transition-colors duration-150 ${link.active
                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                            : "bg-white text-gray-700 border-gray-300"
                            }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            ))}
        </div>
    );
};

// [Updated] Component แสดง Badge สถานะ ตาม Requirement
const StatusBadge = ({ status }) => {
    let classes = "bg-gray-100 text-gray-800"; // default
    let label = status || 'Unknown';
    const s = status ? status.toLowerCase() : '';

    switch (s) {
        case 'active':
        case 'pending':
            // Active: สร้างเอกสารแล้ว
            classes = "bg-blue-100 text-blue-800 border border-blue-200";
            label = "Active";
            break;

        case 'wait':
            // Wait: รอกดส่งงาน
            classes = "bg-yellow-100 text-yellow-800 border border-yellow-200";
            label = "Wait";
            break;

        case 'send': // กรณี Database เก็บคำว่า send แทน process
            // Process: รอศูนย์ซ่อมรับงาน / ส่งงานแล้ว
            classes = "bg-purple-100 text-purple-800 border border-purple-200";
            // label = "Process";
            break;
        case 'process':
            classes = "bg-blue-100 text-blue-800 border border-blue-200"
            break;
        case 'complete':
        case 'success':
            // Complete: ศูนย์ซ่อมจบงาน
            classes = "bg-green-100 text-green-800 border border-green-200";
            label = "Complete";
            break;

        case 'cancel':
        case 'void':
            classes = "bg-red-100 text-red-800 border border-red-200";
            label = "Cancel";
            break;

        default:
            break;
    }

    return (
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${classes}`}>
            {label}
        </span>
    );
};

const FilterAndActionHeader = ({ filters }) => {
    const { props } = usePage();
    const user = props.auth?.user;
    const canCreate = user && (user.role === 'admin' || user.role === 'sale');
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');

    const handleSearch = () => {
        router.get(route('repair.sale.index'), { search: search, status: status }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 p-4 bg-white rounded-lg shadow-md mb-6">
            <div className="flex flex-wrap items-center space-x-0 sm:space-x-2 w-full md:w-auto">
                <div className="relative flex items-center mb-2 sm:mb-0 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="เลขที่ JOB, ร้านค้า, ศูนย์บริการ"
                        className="py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-72"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-0 top-0 h-full flex items-center pr-3 text-gray-400 hover:text-blue-600 cursor-pointer"
                    >
                        <SearchIcon />
                    </button>
                </div>

                <div className="relative flex items-center mb-2 sm:mb-0 w-full sm:w-auto">
                    <input
                        type="text"
                        defaultValue="01/10/2025 - 31/10/2025"
                        className="py-2 pl-4 pr-10 border-t border-b border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-48"
                    />
                    <span className="absolute right-0 top-0 h-full flex items-center pr-3">
                        <button className="text-gray-500 hover:text-gray-700">
                            <CalendarIcon />
                        </button>
                    </span>
                </div>

                <div className="relative mb-2 sm:mb-0 w-full sm:w-auto">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="appearance-none py-2 pl-4 pr-8 border border-gray-300 rounded-r-lg sm:rounded-l-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="wait">รอสร้าง</option>
                        <option value="send">ส่งแล้ว</option>
                        <option value="process">กำลังซ่อม</option>
                        <option value="complete">เสร็จสิ้น</option>
                    </select>
                    <span className="absolute right-0 top-0 h-full flex items-center pr-2 pointer-events-none text-gray-400 text-xs">
                        &#9660;
                    </span>
                </div>

                <div className="flex flex-wrap">
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg ml-0 sm:ml-2 w-full sm:w-auto transition duration-150"
                    >
                        ค้นหา
                    </button>

                    {/* {canCreate && (
                    <Link
                        href={route('repair.sale.create')}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center w-full md:w-auto transition duration-150 ease-in-out"
                    >
                        <PlusIcon className="mr-2" />
                        สร้าง
                    </Link>
                )} */}

                    {canCreate && (
                        <button
                            onClick={() => window.location.href = route('repair.sale.create')}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg ml-0 sm:ml-2 w-full sm:w-auto transition duration-150"

                        >
                            {/* <PlusIcon className="mr-2" /> */}
                            สร้าง
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

const DataTable = ({ data, from }) => {
    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-lg shadow-md text-gray-500">
                ไม่พบข้อมูลงานซ่อม
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ MJ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ JOB</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่ JOB</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ร้านค้า</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ศูนย์บริการ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อัพเดตล่าสุด</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {data.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {from + index}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={item.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                {item.date_job}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                                <Link href={route('repair.sale.create', { job_id: item.mj_number })}>
                                    {item.mj_number}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                <div className="max-w-xs truncate" title={item.store}>
                                    {item.store}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                <div className="max-w-xs truncate" title={item.service_center}>
                                    {item.service_center}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                                {item.date_time_update}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex justify-center space-x-2">
                                    <Link href={route('repair.sale.create', { job_id: item.mj_number })}>
                                        <PencilIcon />
                                    </Link>
                                    {/* <button className="text-red-500 hover:text-red-700 p-1 border border-red-300 rounded-md hover:bg-red-50 transition">
                                        <TimesIcon />
                                    </button> */}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default function RepairSale({ jobs, filters }) {
    const { props } = usePage();
    const error = props.flash?.error;

    return (
        <AuthenticatedLayout>
            <Head title="แจ้งซ่อมสำหรับเซลล์" />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-auto max-w-7xl sm:px-6 lg:px-8 mt-4 mb-6 shadow-sm" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <h1 className="text-2xl font-semibold mx-auto max-w-7xl sm:px-6 lg:px-8 mt-8">
                แจ้งซ่อมสำหรับเซลล์
            </h1>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <FilterAndActionHeader filters={filters} />
                    <DataTable
                        data={jobs?.data}
                        from={jobs?.from || 1}
                    />
                    {jobs?.links && <Pagination links={jobs.links} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}