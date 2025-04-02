import { Head } from '@inertiajs/react';
import {Page, Text, View, Document, StyleSheet, PDFViewer, Font, Image, Svg} from '@react-pdf/renderer';
import bwipjs from 'bwip-js';
import {useEffect, useState} from "react";
Font.register({
    family: 'Sarabun',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/sarabun@4.5.0/files/sarabun-all-400-normal.woff',
});

Font.register({
    family: 'SarabunBold',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/sarabun@4.5.0/files/sarabun-all-700-normal.woff',
    // src: 'https://cdn.jsdelivr.net/npm/@fontsource/sarabun@4.5.0/files/sarabun-all-700-normal.woff',
});

const styles = StyleSheet.create({
    page: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        fontSize: 12,
        fontFamily: 'Sarabun',
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
        fontFamily: 'SarabunBold',
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
        justifyContent: 'flex-end',
        position: 'absolute',
        right: 0,
        bottom: 60, // ปรับตำแหน่งให้อยู่เหนือวันที่
    },
    label: {
        fontSize: 14,
        fontFamily: 'SarabunBold',
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
        width: '60%'
    },
    line: {
        borderBottom: '1px solid #FF6600',
        flexGrow: 1,
        marginLeft: 5,
        paddingBottom: 2
    },
    jobNumber: {
        fontSize: 16,
        fontFamily: 'SarabunBold',
        textAlign: 'right',
        color: '#FF6600',
        marginBottom: 5,
    },
    value: {
        fontSize: 14,
        fontFamily: 'Sarabun',
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
    },
    footer: {
        textAlign: 'center',
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
        marginBottom: 5,
    },
    qrLabel: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 5,
        fontFamily: 'SarabunBold',
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

const DetailTextHalf = ({ label, value }) => (
    <View style={styles.fieldRowHalf}>
        <Text style={styles.label}>{label}:</Text>
        <View style={styles.line}>
            <Text style={styles.value}>{value}</Text>
        </View>
    </View>
);

const GenPDF = ({ job, behaviors, barcode, qrCode }) => (
    <Document>
        <Page size="A5" orientation='landscape' style={styles.page}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerLeft}>
                        ศูนย์บริการ
                    </Text>
                    <View style={styles.headerRight}>
                        {barcode && <Image src={barcode} style={styles.barcodeImage} />}
                        <Text style={styles.jobNumber}>{job.job_id}</Text>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    <DetailText label="ชื่อร้าน" value={job.shop_name} />
                    <DetailText label="ที่อยู่" value={job.address} />
                    <DetailText label="เบอร์ติดต่อ" value={job.phone} />
                    <DetailText label="ซีเรียล" value={job.serial_id} />
                    <DetailText label="ส่งซ่อม" value={job.p_name} />
                    <DetailTextHalf label="อาการ" value={job.symptom} />
                    <DetailTextHalf label="ผู้รับ" value={job.username} />

                    <View style={styles.rightQRArea}>
                        <Text style={styles.qrLabel}>LINE Official</Text>
                        {qrCode && <Image src={qrCode} style={styles.qrCodeImage} />}
                    </View>
                </View>

                <Text style={styles.date}>
                    วันที่ {new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                </Text>

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

        // ดึง QR Code
        fetchImageAsBase64('https://qr-official.line.me/sid/L/155cjomg.png')
            .then(result => {
                console.log("QR Code fetched:", result ? "success" : "failed");
                setImageBase64(result);
            })
            .catch(err => {
                console.error("Error setting QR code:", err);
            });
    }, [job.job_id]);

    return (
        <>
            <Head title="ใบรับสินค้า" />
            <PDFViewer style={{ width: '95vw', height: '95vh' }}>
                <GenPDF job={job} behaviors={behaviors} barcode={barcode} qrCode={imageBase64} />
            </PDFViewer>
        </>
    );
}
