export const DateFormat = (date) => {
    const newDate = new Date(date);
    // แปลงวันที่และเวลาให้อยู่ในรูปแบบ 'YYYY-MM-DD HH:mm:ss'
    return newDate.toISOString().replace('T', ' ').split('.')[0];
}


export const DateFormatTh = ({date}) => {
    if (!date) return 'ไม่มีข้อมูล';
    return  new Date(date).toLocaleString('th');
}

