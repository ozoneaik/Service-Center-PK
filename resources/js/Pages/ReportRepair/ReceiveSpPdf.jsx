import {Head} from '@inertiajs/react';
import {Page, Text, View, Document, StyleSheet, PDFViewer, Font, Image, Svg} from '@react-pdf/renderer';
import bwipjs from 'bwip-js';
import {useEffect, useState} from "react";

Font.register({
    family: 'Kanit',
    src: '/fonts/THSarabunNew.ttf',
});

Font.register({
    family: 'KanitBold',
    src: '/fonts/THSarabunNew_Bold.ttf',

});

Font.register({
    family: 'HeaderBold',
    src: '/fonts/Prompt-Bold.ttf',
});

const styles = StyleSheet.create({
    page: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        fontSize: 16,
        fontFamily: 'Kanit',
        backgroundColor: '#FFFFFF'
    },
    container: {
        border: '2px solid #FF6600',
        padding: 10,
        paddingTop : 5,
        borderRadius: 10,
        height: '100%',
        position: 'relative',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottom: '2px solid #FF6600',
        paddingBottom: 0
    },
    headerLeft: {
        textAlign: 'left',
        fontSize: 20,
        fontFamily: 'HeaderBold',
        fontWeight : 'bold',
        color: '#FF6600',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    barCodeGroup  :{
        margin : 0,
        display : 'flex',
        justifyContent : 'center',
        alignItems : 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexGrow: 1
    },
    leftColumn: {
        width: '100%',
        flexWrap: 'wrap',
    },
    rightQRArea: {
        width: '40%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'absolute',
        right: 0,
        bottom: 40,
        marginBottom: 5,
    },
    label: {
        fontSize: 18,
        fontFamily: 'KanitBold',
        color: '#333333',
        width: 75,
        marginRight: 5,
    },
    fieldRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
        width: '100%',
        flexWrap: 'wrap',  // เพิ่มเพื่อให้ข้อความยาวขึ้นบรรทัดใหม่
    },
    fieldRowHalf: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
        width: '80%',
        flexWrap: 'wrap',  // เพิ่มเพื่อให้ข้อความยาวขึ้นบรรทัดใหม่
    },
    line: {
        flexGrow: 1,
        marginLeft: 5,
        paddingBottom: 2,
        flexWrap: 'wrap',  // เพิ่มเพื่อให้ข้อความยาวขึ้นบรรทัดใหม่
        maxWidth: '85%',   // กำหนดความกว้างสูงสุดเพื่อป้องกันการล้นออกจากกรอบ
    },
    jobNumber: {
        fontSize: 16,
        fontFamily: 'KanitBold',
        textAlign: 'right',
        color: '#FF6600',
        marginBottom: 5,
    },
    value: {
        fontSize: 18,
        fontFamily: 'Kanit',
        color: '#000000',
        flexGrow: 1,
        wordBreak: 'break-word',  // เปลี่ยนจาก wordWrap เป็น wordBreak
        whiteSpace: 'pre-wrap',   // เพิ่มเพื่อให้ขึ้นบรรทัดใหม่ตามการป้อนข้อมูล
        lineHeight: 1.3,          // เพิ่มระยะห่างระหว่างบรรทัด
        width: '90%',            // กำหนดความกว้างให้ใช้พื้นที่เต็มที่
    },
    date: {
        fontSize: 14,
        textAlign: 'right',
        color: '#666666',
        position: 'absolute',
        bottom: 30,               // ปรับตำแหน่งให้อยู่สูงขึ้นเพื่อป้องกันการทับซ้อนกับ footer
        right: 20,
        fontFamily: 'Kanit',
    },
    footer: {
        textAlign: 'center',
        fontFamily: 'Kanit',
        fontSize: 12,
        color: '#666666',
        borderTop: '1px solid #FF6600',
        paddingTop: 5,
        paddingBottom: 0,
        position: 'absolute',
        bottom: 5,
        left: 20,
        right: 20,
    },
    barcodeImage: {
        width: 180,
        height: 30,
        marginTop: 5,
    },
    qrCodeImage: {
        width: 100,
        height: 100,
        marginTop: 10,
    },
    qrLabel: {
        color: '#4b4b4b',
        width: '40%',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 5,
        fontFamily: 'KanitBold',
    },
    contentContainer: {
        flexDirection: 'column',
        height: '75%',            // ลดความสูงลงเล็กน้อยเพื่อให้มีพื้นที่สำหรับ footer และ date
        position: 'relative',
        overflowWrap: 'break-word', // เพิ่มเพื่อป้องกันข้อความล้น
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    }
});

const generateBarcode = async (value) => {
    try {
        const canvas = document.createElement('canvas');
        bwipjs.toCanvas(canvas, {bcid: 'code128', text: value, scale: 3});
        return canvas.toDataURL('image/png');
    } catch (err) {
        console.error('Barcode generation error:', err);
        return null;
    }
};

// แก้ไขคอมโพเนนต์ DetailText ให้รองรับข้อความยาวได้ดีขึ้น
const DetailText = ({label, value}) => (
    <View style={styles.fieldRow}>
        <Text style={styles.label}>{label}:</Text>
        <View style={styles.line}>
            <Text style={styles.value}>{value || '-'}</Text>
        </View>
    </View>
);

const DetailText1 = ({label, value}) => (
    <View style={styles.fieldRow}>
        <Text style={{...styles.label, fontSize: 18}}>{label}:</Text>
        <View style={{...styles.line}}>
            <Text style={{
                ...styles.value,
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'KanitBold',
                lineHeight: 1.4, // เพิ่มระยะห่างระหว่างบรรทัดสำหรับข้อความที่เป็นหัวข้อใหญ่
            }}>{value || '-'}</Text>
        </View>
    </View>
);

const DetailTextHalf = ({label, value}) => (
    <View style={styles.fieldRowHalf}>
        <Text style={styles.label}>{label}:</Text>
        <View style={styles.line}>
            <Text style={styles.value}>{value || '-'}</Text>
        </View>
    </View>
);

const GenPDF = ({job, behaviors, barcode, qrCode}) => (
    <Document>
        <Page size="A5" orientation='landscape' style={styles.page}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <View style={{
                        alignItems: 'flex-start',
                        justifyContent: 'left'
                    }}>
                        <Text style={styles.headerLeft}>
                            ศูนย์บริการ
                        </Text>
                        <Text style={{...styles.headerLeft,fontSize : 12}}>
                            Pumpkin Customer Service
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.barCodeGroup}>
                            <View>
                                {barcode && <Image src={barcode} style={styles.barcodeImage}/>}
                            </View>
                            <View>
                                <Text style={styles.jobNumber}>{job.job_id}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    <DetailText1 label="ชื่อร้าน" value={job.shop_name} shop_name={true}/>
                    <DetailText label="ที่อยู่" value={job.address}/>
                    <DetailText label="เบอร์ติดต่อ" value={job.phone}/>
                    <DetailText label="ซีเรียล" value={job.serial_id}/>
                    <DetailText label="ส่งซ่อม" value={job.p_name}/>
                    <DetailTextHalf label="อาการ" value={job.symptom}/>
                    <DetailTextHalf label="ผู้รับ" value={job.username}/>

                    <View style={styles.rightQRArea}>
                        <Image
                            src={'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAFoAWgDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAsK/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAOC/wAAgDi/wAgDi/wAgDr/AAgDr/AIA6/wgDgC/wACAOAAAv8AAgDgAAL/AAAIA6/wgDgC/wACAOAv8IA4C/wCAOC/wIA6/wAAgDgv8AgDi/wAgDi/wAgDr/CAOv8AAAAAAAAAAIA6/wAIA6/wCAOAAv8ACAOv8AgDr/CAOv8AAIA6/wACAOC/wgDgAv8ACAOAC/wgDgAv8AgDr/CAOAAAv8CAOv8AACAOv8AIA4v8IA4C/wAACAOv8IA6/wAAgDgAL/CAOv8AAIA6/wAIA6/wAAAAAAAACAOv8IA6/wAAgDi/wAgDr/AAgDr/AAgDr/ACAOL/AAAgDi/wAgDr/AAACAOv8IA4C/wgDgAC/wAAIA6/wgDgv8IA4AL/AAgDr/AAgDr/AACAOv8ACAOv8AgDi/wAgDr/AAAIA6/wgDr/AAAAAAAAAACAOL/ACAOL/ACAOL/ACAOv8ACAOv8ACAOv8AgDr/CAOAL/AAgDr/AIA6/wIA4C/wAIA6/wCAOv8IA6/wAAgDr/AAIA4C/wAIA6/wAIA4Av8ACAOv8AAAgDi/wAgDi/wAgDi/wAgDr/AAAAAAAAAAAAAIA4AC/wgDgC/wAACAOv8CAOAv8ACAOv8AAgDgL/AAIA4L/CAOAC/wACAOC/wgDr/ACAOC/wAACAOL/CAOAL/ACAOAC/wIA6/wAAgDi/wgDgL/AAAAAAAAAAgDr/AAgDgL/CAOL/AAAgDr/ACAOv8CAOC/wgDgAv8ACAOv8ACAOv8AgDi/wgDgv8CAOv8AgDgv8AAIA6/wAIA6/wAgDr/CAOAAC/wgDr/CAOAL/CAOAv8CAOAv8ACAOv8AgDi/wAAAAAAAAAAAgDr/AgDgL/AAAIA6/wAIA6/wAACAOv8CAOC/wIA4C/wgDgAv8AAAgDgAL/AAgDr/ACAOAC/wACAOAL/ACAOAAL/ACAOAC/wCAOAv8AAgDgL/CAOv8AAAAAAAAAAIA6/wAIA4C/wgDi/wAAIA6/wgDgL/AgDgv8CAOAv8CAOv8AAAgDr/AIA4v8IA4Av8AIA6/wgDgL/AgDgL/AgDgL/CAOAL/CAOv8AIA4v8AIA6/wAIA4v8IA4C/wAAAAAAAAAAAIA6/wIA4L/AIA4L/CAOL/AACAOL/ACAOC/wAAgDr/AAgDgL/CAOAAL/AIA6/wAIA4L/ACAOv8AAgDr/ACAOv8AIA4L/AIA4AL/AgDgAL/AACAOL/ACAOv8IA6/wAAAAAAAAAAgDi/wAAgDgL/AAAIA4v8AAgDr/ACAOL/AACAOC/wACAOC/wAAAAIA6/wAgDi/wAAgDi/wACAOv8AAAIA4C/wAIA4v8AIA4AC/wAIA6/wAAAAAAAAAgDr/ACAOC/wAgDr/ACAOv8AAgDgAv8AACAOv8ACAOv8AIA4L/AIA4L/AAACAOAC/wAAgDr/AAgDgC/wgDr/AACAOC/wCAOL/ACAOv8ACAOAv8IA6/wAgDr/AAAIA6/wAAAAAAAAAIA4L/AIA6/wIA4L/AIA4Av8IA4L/CAOv8IA4C/wgDr/AACAOL/CAOC/wgDr/ACAOv8AAgDgv8IA6/wgDgL/AAIA4Av8IA4L/AACAOL/AACAOv8ACAOAAAL/AAIA4Av8IA4C/wAAAAAAAAAACAOAAv8AAAgDgv8AAIA6/wAACAOv8IA6/wAACAOv8AgDr/AAgDgAv8IA4v8AAAIA4L/CAOAC/wAAAIA6/wAAIA4Av8CAOAL/AAgDr/ACAOv8ACAOv8IA4C/wgDr/AAAAAAAAAACAOv8ACAOv8AgDgv8AAIA6/wACAOAv8AAgDgC/wIA6/wAAgDr/AAgDr/ACAOAL/CAOAL/AgDr/AACAOL/ACAOv8IA6/wAAIA4Av8AAIA4AL/AAAAgDr/AAAAAAAAAAAAgDr/AAIA6/wAAAgDi/wACAOAL/AAgDgL/AgDr/AAAAAIA4C/wgDr/AAIA4C/wCAOAC/wAAgDr/AAgDgAL/AACAOL/ACAOv8IA6/wAAIA6/wAgDr/CAOv8AAAAAAAAAAIA4L/AIA4v8AIA4v8AIA6/wgDr/AAACAOC/wgDgAv8ACAOAL/AAgDr/AAgDgAAL/CAOAL/AIA4Av8AIA4AC/wAIA6/wCAOv8ACAOAAC/wAAAAAAAAAAAAgDr/CAOv8AAIA4AC/wgDr/AACAOv8ACAOv8AgDgv8AAIA6/wACAOC/wIA4Av8ACAOv8AgDi/wAgDi/wAgDgv8AAAgDr/AIA6/wAIA4v8AIA4L/AACAOAAC/wAAIA6/wAgDr/CAOv8AAAAAAAAAAIA6/wAIA6/wCAOL/ACAOv8AAAgDr/CAOv8AAIA4v8IA4L/AAIA6/wAAAgDgC/wIA4C/wgDr/CAOAv8AAgDgAAC/wgDgC/wAAgDgAv8AAIA4L/AIA6/wIA4C/wAAAAAAAAAACAOL/ACAOL/ACAOL/ACAOv8AAAAAIA6/wAgDr/AAgDi/wAAAgDr/AAAIA6/wACAOv8AAAIA6/wAAAAAAAAAgDr/ACAOv8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/2Q=='}
                            style={styles.qrCodeImage}/>
                        <Text style={styles.qrLabel}>@ศูนย์ซ่อม pumpkin</Text>
                    </View>
                </View>

                <Text style={styles.date}>
                    วันที่ {new Date().toLocaleString('th-TH', {timeZone: 'Asia/Bangkok'})}
                </Text>

                <View style={styles.footer}>
                    <Text>เอกสารนี้เป็นหลักฐานการรับสินค้าเพื่อส่งซ่อม กรุณาเก็บไว้เพื่อยืนยันตัวตน</Text>
                </View>
            </View>
        </Page>
    </Document>
);

export default function ReceiveSpPdf({job, behaviors}) {
    const [barcode, setBarcode] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);

    const fetchImageAsBase64 = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log('QR Code loaded successfully');
                    resolve(reader.result);
                };
                reader.onerror = (error) => {
                    console.error('Error reading QR Code:', error);
                    reject(error);
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error fetching QR Code:', error);
            return null;
        }
    };

    useEffect(() => {
        // สร้าง barcode
        generateBarcode(job.job_id).then(setBarcode);

        // ถ้ามี URL สำหรับ QR Code ให้โหลดมาแสดง
        // ตัวอย่าง: อาจใช้ URL จาก job ที่ได้รับ
        // if (job.qr_code_url) {
        //     fetchImageAsBase64(job.qr_code_url).then(setImageBase64);
        // }
    }, [job.job_id]);

    return (
        <>
            <Head title="ใบรับสินค้า"/>
            <PDFViewer style={{width: '95vw', height: '95vh'}}>
                <GenPDF job={job} behaviors={behaviors} barcode={barcode} qrCode={imageBase64}/>
            </PDFViewer>
        </>
    );
}
