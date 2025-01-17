import Swal from "sweetalert2";

export function AlertDialog ({icon = 'error',text,title, onPassed}) {
    Swal.fire({
        icon,
        text,
        title,
        showConfirmButton : true,
        confirmButtonText : 'ตกลง',
        showCancelButton : true,
        cancelButtonText : 'ยกเลิก',
        allowOutsideClick : false,
    }).then((result) => onPassed(result.isConfirmed ? true : false))
}