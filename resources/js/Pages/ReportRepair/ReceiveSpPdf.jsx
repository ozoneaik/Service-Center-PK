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
});

const styles = StyleSheet.create({
    page: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 12,
        fontFamily: 'Sarabun',
        backgroundColor: '#FFFFFF'
    },
    container: {
        border: '2px solid #FF6600',
        padding: 20,
        borderRadius: 10,
        height: '100%',  // Full height of the page
    },
    header: {
        textAlign: 'center',
        fontSize: 24,
        fontFamily: 'SarabunBold',
        marginBottom: 15,
        color: '#FF6600',
        borderBottom: '2px solid #FF6600',
        paddingBottom: 10
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexGrow: 1
    },
    leftColumn: {
        // backgroundColor : 'red',
        width: '65%',
        flexWrap: 'wrap',
        // paddingRight: 10
    },
    rightColumn: {
        width: '35%',
        alignItems: 'flex-end',
        // paddingLeft: 10
    },
    label: {
        fontSize: 14,
        fontFamily: 'SarabunBold',
        color: '#333333',
        marginRight: 5
    },
    value: {
        fontSize: 14,
        fontFamily: 'Sarabun',
        color: '#000000',
        flexGrow: 1,
        wordWrap: 'break-word'
    },
    fieldRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start'
    },
    line: {
        borderBottom: '1px solid #FF6600',
        flexGrow: 1,
        marginLeft: 5,
        paddingBottom: 2
    },
    jobNumber: {
        fontSize: 20,
        fontFamily: 'SarabunBold',
        textAlign: 'right',
        color: '#FF6600'
    },
    date: {
        fontSize: 10,
        marginTop: 5,
        textAlign: 'right',
        color: '#666666'
    },
    footer: {
        textAlign: 'center',
        fontSize: 10,
        color: '#666666',
        borderTop: '1px solid #FF6600',
        paddingTop: 10,
        // marginTop: 15
    },
    barcodeImage: {
        width: '100%',
        height: 40,
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    qrCodeImage: {
        width: 120,
        height: 120,
        marginTop: 10,
        alignSelf: 'flex-end',
    },image : {
        width: 100,
        height: 100

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

const GenPDF = ({ job, behaviors, barcode, qrCode }) => (
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
                        <Text style={styles.jobNumber}>{job.job_id}</Text>

                        {barcode && <Image src={barcode} style={styles.barcodeImage} />}
                        <Text style={styles.date}>
                            วันที่ {new Date(job.created_at).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                        </Text>
                        {/*{qrCode && <Image src={qrCode} style={styles.qrCodeImage} />}*/}
                    </View>
                </View>
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
        generateBarcode(job.job_id).then(setBarcode);
        // fetchImageAsBase64('https://qr-official.line.me/sid/L/155cjomg.png').then(setImageBase64);
    }, [job.job_id]);

    return (
        <>
            <Head title="ใบรับสินค้า" />
            <PDFViewer style={{ width: '95vw', height: '95vh' }}>
                <GenPDF job={job} behaviors={behaviors} barcode={barcode} />
            </PDFViewer>
        </>
    );
}
