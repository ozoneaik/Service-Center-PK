import Swal from "sweetalert2";

const options = {
    showCancelButton: true,
    cancelButtonText: 'ยกเลิก',
    confirmButtonText: 'ตกลง',
    allowOutsideClick : false,
    confirmButtonColor: '#f15922',
}

export function AlertDialog({title, text, icon = 'error', onPassed}) {
    Swal.fire({
        icon,
        title,
        text,
        ...options
    }).then((result) => {
        onPassed(result.isConfirmed)
    })
}

export function AlertWithFormDialog({title, text, icon = 'error',res}) {
    let value;
    Swal.fire({
        icon,
        text,
        title,
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
        res(result.isConfirmed,value)
    });
}
