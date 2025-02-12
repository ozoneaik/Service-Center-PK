export const DateFormat = (date) => {
    const newDate = new Date(date);
    // แปลงวันที่และเวลาให้อยู่ในรูปแบบ 'YYYY-MM-DD HH:mm:ss'
    return newDate.toISOString().replace('T', ' ').split('.')[0];
}
