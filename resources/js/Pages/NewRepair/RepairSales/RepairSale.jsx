import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

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

const sampleData = [
    {
        id: 1,
        status: "active",
        date_job: "11/10/2025",
        mj_number: "MJ-251000001",
        store: "โฮมเมด ฮาร์ดแวร์",
        service_center: "สุวรรณ ฮาร์ดแวร์",
        date_time_update: "11/10/2025 13:00:00",
    },
    {
        id: 2,
        status: "complete",
        date_job: "11/10/2025",
        mj_number: "MJ-251000002",
        store: "ร้านเคตุ วัสถุดิบ",
        service_center: "เลี้ยงยาว.บอท",
        date_time_update: "11/10/2025 13:00:00",
    },
];

// Component สำหรับแสดง Badge สถานะ
const StatusBadge = ({ status }) => {
    const is_active = status === "active";
    const statusText = is_active ? "active" : "Complete";
    const classes = is_active
        ? "bg-blue-100 text-blue-800"
        : "bg-green-100 text-green-800";
    return (
        <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${classes} capitalize`}
        >
            {statusText}
        </span>
    );
};

// Component สำหรับกลุ่มฟิลเตอร์และปุ่มสร้าง
const FilterAndActionHeader = () => {
    const { props } = usePage();
    const user = props.auth?.user;
    const canCreate = user && (user.role === 'admin' || user.role === 'sale');
    return (
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 p-4 bg-white rounded-lg shadow-md mb-6">
            {/* Input และ Filter Groups */}
            <div className="flex flex-wrap items-center space-x-0 sm:space-x-2 w-full md:w-auto">
                {/* ช่องค้นหา */}
                <div className="relative flex items-center mb-2 sm:mb-0 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="เลขที่ JOB, ร้านค้า, ศูนย์บริการ"
                        className="py-2 pl-4 pr-10 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-72"
                    />
                    <span className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none">
                        <SearchIcon className="text-gray-400" />
                    </span>
                </div>

                {/* วันที่ */}
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

                {/* Dropdown "ทั้งหมด" */}
                <div className="relative mb-2 sm:mb-0 w-full sm:w-auto">
                    <select
                        className="appearance-none py-2 pl-4 pr-8 border border-gray-300 rounded-r-lg sm:rounded-l-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
                    >
                        <option>ทั้งหมด</option>
                        <option>รอดำเนินการ</option>
                        <option>เสร็จสมบูรณ์</option>
                    </select>
                    {/* ใช้ Unicode character (▼) สำหรับ Dropdown Arrow แทน Icon */}
                    <span className="absolute right-0 top-0 h-full flex items-center pr-2 pointer-events-none text-gray-400 text-xs">
                        &#9660;
                    </span>
                </div>

                {/* ปุ่ม "ค้นหา" */}
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg ml-0 sm:ml-2 w-full sm:w-auto">
                    ค้นหา
                </button>
            </div>

            {/* ปุ่ม "สร้าง" - แสดงเฉพาะผู้ที่มีสิทธิ์ (Admin หรือ Sale) */}
            {canCreate && (
                <Link
                    href={route('repair.sale.create')}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center w-full md:w-auto transition duration-150 ease-in-out"
                >
                    <PlusIcon className="mr-2" />
                    สร้าง
                </Link>
            )}
        </div>
    );
};

// Component สำหรับตารางแสดงข้อมูล
const DataTable = ({ data }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            สถานะ MJ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            วันที่ JOB
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            เลขที่ MJ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ร้านค้า
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ศูนย์บริการ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            วันที่-เวลา อัพเดต
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {data.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={item.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {item.date_job}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                                {item.mj_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {item.store}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {item.service_center}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {item.date_time_update}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                {/* กลุ่มปุ่ม Actions (แก้ไขและลบ) */}
                                <div className="flex justify-center space-x-2">
                                    <button className="text-orange-500 hover:text-orange-700 p-1 border border-orange-300 rounded-md">
                                        <PencilIcon />
                                    </button>
                                    <button className="text-red-500 hover:text-red-700 p-1 border border-red-300 rounded-md">
                                        <TimesIcon />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default function RepairSale() {
    const { props } = usePage();
    const error = props.flash?.error;

    return (
        <AuthenticatedLayout>
            <Head title="แจ้งซ่อมสำหรับเซลล์" />
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-auto max-w-7xl sm:px-6 lg:px-8 mt-4 mb-6" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <FilterAndActionHeader />
                    {/* ส่วนตารางแสดงข้อมูล */}
                    {/* ในการใช้งานจริง ให้เปลี่ยน data={sampleData} เป็น data={props.DATA} หรือตามชื่อ prop ที่คุณส่งมา */}
                    <DataTable data={sampleData} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}