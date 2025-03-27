import { Head } from '@inertiajs/react';
import { Page, Text, View, Document, StyleSheet, PDFViewer, Font, Image } from '@react-pdf/renderer';
import bwipjs from 'bwip-js';
import {useEffect, useState} from "react";

Font.register({
    family: 'Sarabun',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/sarabun@4.5.0/files/sarabun-all-400-normal.woff',
});

Font.register({
    family: 'SarabunBold',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/sarabun@4.5.0/files/sarabun-all-700-normal.woff',
});

const styles = StyleSheet.create({
    page: {
        padding: 5,  // เพิ่มการเว้นขอบมากขึ้น
        fontSize: 12,
        fontFamily: 'Sarabun',
        backgroundColor: '#F5F5F5'  // สีพื้นหลังนุ่มตา
    },
    container: {
        border: '1px solid #A0A0A0',
        padding: 10,
        borderRadius: 10,  // เพิ่มความโค้งของมุม
        backgroundColor: 'white',
        boxShadow: '2 2 5 rgba(0,0,0,0.1)'  // เงาอ่อนๆ
    },
    header: {
        textAlign: 'center',
        fontSize: 26,
        fontFamily: 'SarabunBold',
        marginBottom: 15,
        color: '#2C3E50',  // สีน้ำเงินเข้ม
        borderBottom: '2px solid #3498DB',  // เส้นขีดใต้สวยๆ
        paddingBottom: 5
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    leftColumn: {
        width: '65%',
        paddingRight: 10  // เพิ่มช่องว่างระหว่างคอลัมน์
    },
    rightColumn: {
        width: '35%',
        alignItems: 'flex-end',
        paddingLeft: 10
    },
    label: {
        fontSize: 14,
        fontFamily: 'SarabunBold',
        color: '#34495E'  // สีเทาน้ำเงิน
    },
    value: {
        fontSize: 14,
        fontFamily: 'Sarabun',
        color: '#2C3E50'  // สีน้ำเงินเข้ม
    },
    fieldRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center'  // จัดกึ่งกลาง
    },
    line: {
        borderBottom: '1px solid #BDC3C7',
        flexGrow: 1,
        marginLeft: 10,
        paddingBottom: 3
    },
    jobNumber: {
        fontSize: 22,
        fontFamily: 'SarabunBold',
        textAlign: 'right',
        color: '#E74C3C'  // สีแดงสดใส
    },
    date: {
        fontSize: 12,
        marginTop: 5,
        textAlign: 'right',
        color: '#7F8C8D'  // สีเทาอ่อน
    },
    footer: {
        textAlign: 'center',
        fontSize: 10,
        color: '#95A5A6',
        borderTop: '1px solid #BDC3C7',
        paddingTop: 10,
        marginTop: 15
    },
    barcodeImage: {
        width: 200,
        height: 70,
        marginTop: 15,
        alignSelf: 'flex-end',
    }
});

const generateBarcode = async (value) => {
    try {
        const canvas = document.createElement('canvas');
        bwipjs.toCanvas(canvas, { bcid: 'code128', text: value, scale: 3 });
        return canvas.toDataURL('image/png');
    } catch (err) {
        console.error('Barcode generation error:', err);
        return null;
    }
};

const DetailText = ({ label, value }) => (
    <View style={styles.fieldRow}>
        <Text style={styles.label}>{label}:</Text>
        <View style={styles.line}>
            <Text style={styles.value}>{value}</Text>
        </View>
    </View>
);

const GenPDF = ({ job, behaviors, barcode,qrCode }) => (
    <Document>
        <Page size="A5" orientation='landscape' style={styles.page}>
            <View style={styles.container}>
                <Text style={styles.header}>ศูนย์บริการ</Text>
                <View style={styles.row}>
                    <View style={styles.leftColumn}>
                        <DetailText label="ชื่อร้าน" value={job.shop_name} />
                        <DetailText label="ที่อยู่" value={job.address} />
                        <DetailText label="เบอร์โทรศัพท์" value={job.phone} />
                        <DetailText label="ซีเรียลนัมเบอร์" value={job.serial_id} />
                        <DetailText label="ส่งซ่อม" value={job.p_name} />
                        <DetailText label="อาการ" value={behaviors} />
                        <DetailText label="ผู้รับ" value={job.username} />
                    </View>
                    <View style={styles.rightColumn}>
                        <Text style={styles.jobNumber} >{job.job_id}</Text>
                        <Text style={styles.date}>
                            วันที่ {new Date(job.created_at).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                        </Text>
                        {barcode && <Image src={barcode} style={styles.barcodeImage} />}
                        <Image src={qrCode} style={styles.barcodeImage}/>
                    </View>
                </View>
ฺศ๊/ถจๅ/-จจ-/
                BLU2501230032
                3901156426

                <View style={styles.footer}>
                    <Text>เอกสารนี้เป็นหลักฐานการรับสินค้าเพื่อส่งซ่อม กรุณาเก็บไว้เพื่อยืนยันตัวตน</Text>
                </View>
            </View>
        </Page>
    </Document>
);

export default function ReceiveSpPdf({ job, behaviors }) {
    const [barcode, setBarcode] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);

    const fetchImageAsBase64 = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error fetching image:', error);
            return null;
        }
    };

    useEffect(() => {
        generateBarcode(job.job_id).then(setBarcode);
        fetchImageAsBase64('https://qr-official.line.me/sid/L/155cjomg.png').then(setImageBase64);
    }, [job.job_id]);

    return (
        <>
            <Head title="ใบรับสินค้า" />
            <PDFViewer style={{ width: '100vw', height: '100vh' }}>
                <GenPDF job={job} behaviors={behaviors} barcode={barcode} qrCode={imageBase64} />
            </PDFViewer>
        </>
    );
}
