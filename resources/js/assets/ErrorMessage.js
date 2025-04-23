export const Error500 = `<span>เกิดข้อผิดพลาด server กรุณาติดต่อผู้ดูแลระบบ <br/> เบอร์ 02-8995928 ต่อ 266</span>`


export const ErrorMessage = ({status = 400, message = ''}) => {
    if (status === 400) {
        return message || 'ตรวจพบข้อผิดพลาดบางอย่าง'
    }else if (status === 401){
        return message || 'คุณไม่ได้รับอนุญาตให้เข้าถึง'
    }else if (status === 403){
        return message || 'คุณไม่มีสิทธิ์ในการเข้าถึงทรัพยากรนี้'
    }else if (status === 404){
        return message || 'ไม่พบข้อมูลที่คุณร้องขอ'
    }else if (status === 422){
        return message || 'ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่สมบูรณ์'
    }else if (status === 429){
        return message || 'คุณทำรายการบ่อยเกินไป โปรดลองใหม่ภายหลัง'
    }else if (status === 408){
        return message || 'การเชื่อมต่อหมดเวลา โปรดลองใหม่'
    }else{
        return `<span>เกิดข้อผิดพลาด server กรุณาติดต่อผู้ดูแลระบบ <br/> เบอร์ 02-8995928 ต่อ 266</span>`
    }

}
