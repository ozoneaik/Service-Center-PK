import Swal from "sweetalert2";

const options = {
    cancelButtonText: 'ยกเลิก',
    confirmButtonText: 'ตกลง',
    allowOutsideClick: false,
    confirmButtonColor: '#f15922',
    allowEscape : false,
}

export function AlertDialog({
                                title,
                                text,
                                icon = 'error',
                                onPassed = () => {},
                                showCancelButton = true,
                            }) {
    Swal.fire({
        icon,
        title,
        html : text,
        showCancelButton,
        ...options
    }).then((result) => {
        onPassed(result.isConfirmed)
    })
}

export function AlertWithFormDialog({title, text, icon = 'error', res}) {
    let value;
    Swal.fire({
        icon,
        text,
        title,
        showCancelButton : true,
        ...options,
        input: "text",
        inputAttributes: {
            autocapitalize: "off"
        },
        showLoaderOnConfirm: true,
        preConfirm: async (v) => {
            value = v;
        },
    }).then((result) => {
        res(result.isConfirmed, value)
    });
}

export function AlertWithFormDialogTextArea({title, text, icon = 'error', res}) {
    let value;
    Swal.fire({
        icon,
        html : text,
        title,
        showCancelButton : true,
        ...options,
        input: "textarea",
        inputAttributes: {
            autocapitalize: "off"
        },
        showLoaderOnConfirm: true,
        preConfirm: async (v) => {
            value = v;
        },
    }).then((result) => {
        res(result.isConfirmed, value)
    });
}

export function AlertDialogQuestion({title='แน่ใจหรือไม่',text, onPassed, showCancelButton = true}) {
    Swal.fire({
        icon: 'question',
        title,
        html : text,
        showCancelButton,
        ...options
    }).then((result) => {
        onPassed(result.isConfirmed)
    })
}

export function AlertDialogQuestionForSearch({showConfirmButton = true,title='แน่ใจหรือไม่',text,cancelButtonText = 'ดูแค่ประวัติการซ่อม', onPassed=()=>{}}) {
    Swal.fire({
        icon: 'question',
        title,
        text,
        showCancelButton : true,
        cancelButtonText,
        showConfirmButton : showConfirmButton,
        confirmButtonText : 'สร้าง job ใหม่',
        allowOutsideClick : false,
    }).then((result) => {
        onPassed(result.isConfirmed)
    })
}

export function AlertForWarranty({text, onPassed, showCancelButton = true}) {
    Swal.fire({
        icon: 'question',
        title: 'บันทึกข้อมูล',
        text,
        showDenyButton: true,
        denyButtonText: 'บันทึก/แจ้งซ่อม',
        denyButtonColor: '#f15922',
        cancelButtonText: 'ยกเลิก',
        confirmButtonText: 'บันทึก',
        showCancelButton,
        allowOutsideClick: false,
        confirmButtonColor: '#f15922',
    }).then((result) => {
        onPassed(result.isConfirmed,result.isDenied)
    })
}
