export const DateFormat = (date) => {
    const newDate = new Date(date);
    // แปลงวันที่และเวลาให้อยู่ในรูปแบบ 'YYYY-MM-DD HH:mm:ss'
    return newDate.toISOString().replace('T', ' ').split('.')[0];
}


export const DateFormatTh = ({ date }) => {
    if (!date) return 'ไม่มีข้อมูล';
    return new Date(date).toLocaleString('th');
}

export const DateFormatThString = (_date) => {
    // data string
    const date = new Date(_date);

    // แปลงปีเป็น พ.ศ.
    const buddhistYear = date.getFullYear() + 543;

    // เติมเลข 0 หน้าเดือน/วัน ถ้าจำเป็น
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${day}/${month}/${buddhistYear}`;
}

