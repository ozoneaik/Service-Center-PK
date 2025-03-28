export default function Unauthorized() {
    return (
        <>
            <center className="mt-24 m-auto">
                <img src="https://images.dcpumpkin.com/images/product/500/default.jpg" alt=""/>
                <div className=" tracking-widest">
                    <span className="text-gray-500 text-6xl block"><span>4  0  4</span></span>
                    <span className="text-gray-500 text-xl">ขออภัย เราไม่พบสิ่งที่คุณกำลังมองหา!</span>
                </div>
            </center>
            <center className="mt-6">
                <a href="/" className="text-gray-500 font-mono text-xl bg-gray-200 p-3 rounded-md hover:shadow-md">
                    กลับไปยังหน้าหลัก
                </a>
            </center>
        </>
    )
}
