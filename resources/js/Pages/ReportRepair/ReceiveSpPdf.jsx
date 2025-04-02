import {Head} from '@inertiajs/react';
import {Page, Text, View, Document, StyleSheet, PDFViewer, Font, Image, Svg} from '@react-pdf/renderer';
import bwipjs from 'bwip-js';
import {useEffect, useState} from "react";
// import KanitBold from '../../assets/fonts/Kanit-Bold.ttf'

Font.register({
    family: 'Sarabun',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/sarabun@4.5.0/files/sarabun-all-400-normal.woff',
});

Font.register({
    family: 'SarabunBold',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/sarabun@4.5.0/files/sarabun-all-700-normal.woff',
    // src: 'https://cdn.jsdelivr.net/npm/@fontsource/sarabun@4.5.0/files/sarabun-all-700-normal.woff',
});

Font.register({
    family: 'Kanit',
    src: '/fonts/Kanit-Regular.ttf', // โหลดจาก public/
});

Font.register({
    family: 'KanitBold',
    src: '/fonts/Kanit-Bold.ttf', // โหลดจาก public/
});

const styles = StyleSheet.create({
    page: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        fontSize: 12,
        fontFamily: 'KanitBold',
        backgroundColor: '#FFFFFF'
    },
    container: {
        border: '2px solid #FF6600',
        padding: 10,
        borderRadius: 10,
        height: '100%',  // Full height of the page
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottom: '2px solid #FF6600',
        paddingBottom: 10
    },
    headerLeft: {
        textAlign: 'left',
        fontSize: 24,
        fontFamily: 'KanitBold',
        color: '#FF6600',
    },
    headerRight: {
        alignItems: 'flex-end',
        justifyContent: 'center'
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
        bottom: 40, // ปรับตำแหน่งให้อยู่เหนือวันที่
        marginBottom: 5,
    },
    label: {
        fontSize: 14,
        fontFamily: 'KanitBold',
        color: '#333333',
        width: 75, // ตั้งความกว้างให้เท่ากันทุกหัวข้อ
    },
    fieldRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
        width: '100%'
    },
    fieldRowHalf: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
        width: '60%',
    },
    line: {
        // borderBottom: '1px solid #FF6600',
        flexGrow: 1,
        marginLeft: 5,
        paddingBottom: 2
    },
    jobNumber: {
        fontSize: 16,
        fontFamily: 'KanitBold',
        textAlign: 'right',
        color: '#FF6600',
        marginBottom: 5,
    },
    value: {
        fontSize: 14,
        fontFamily: 'Kanit',
        color: '#000000',
        flexGrow: 1,
        wordWrap: 'break-word'
    },
    date: {
        fontSize: 10,
        textAlign: 'right',
        color: '#666666',
        position: 'absolute',
        bottom: 40,
        right: 20,
        fontFamily : 'Kanit',
    },
    footer: {
        textAlign: 'center',
        fontFamily : 'Kanit',
        fontSize: 10,
        color: '#666666',
        borderTop: '1px solid #FF6600',
        paddingTop: 5,
        paddingBottom: 0,
        position: 'absolute',
        bottom: 10,
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
        // marginBottom: 5,
    },
    qrLabel: {
        color: '#4b4b4b',
        width: '40%',
        fontSize: 8,
        textAlign: 'center',
        marginBottom: 5,
        fontFamily: 'KanitBold',
    },
    contentContainer: {
        flexDirection: 'column',
        height: '80%',
        position: 'relative', // เพิ่มเพื่อให้สามารถกำหนดตำแหน่ง QR Code ได้
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

const DetailText = ({label, value}) => (
    <View style={styles.fieldRow}>
        <Text style={styles.label}>{label}:</Text>
        <View style={styles.line}>
            <Text style={styles.value}>{value}</Text>
        </View>
    </View>
);

const DetailText1 = ({label, value}) => (
    <View style={styles.fieldRow}>
        <Text style={{...styles.label, fontSize: 18}}>{label}:</Text>
        <View style={{...styles.line}}>
            <Text style={{...styles.value, fontSize: 18, fontWeight: 'bold', fontFamily: 'SarabunBold',}}>{value}</Text>
        </View>
    </View>
);

const DetailTextHalf = ({label, value}) => (
    <View style={styles.fieldRowHalf}>
        <Text style={styles.label}>{label}:</Text>
        <View style={styles.line}>
            <Text style={styles.value}>{value}</Text>
        </View>
    </View>
);

const GenPDF = ({job, behaviors, barcode, qrCode}) => (
    <Document>
        <Page size="A5" orientation='landscape' style={styles.page}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    {/*<Text style={styles.headerLeft}>*/}
                    {/*    ศูนย์บริการ Pumpkin Customer Service*/}
                    {/*</Text>*/}
                    <View style={{alignItems: 'flex-start',
                        justifyContent: 'left'}}>
                        <Text style={styles.headerLeft}>
                            ศูนย์บริการ
                        </Text>
                        <Text style={{...styles.headerLeft,fontSize : 12}}>
                            Pumpkin Customer Service
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        {barcode && <Image src={barcode} style={styles.barcodeImage}/>}
                        <Text style={styles.jobNumber}>{job.job_id}</Text>
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
                        {/*{qrCode && <Image src={''} style={styles.qrCodeImage} />}*/}
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
