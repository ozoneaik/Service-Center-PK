import { Head } from '@inertiajs/react';
import { Page, Text, View, Document, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';

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
        padding: 20,
        fontSize: 12,
        fontFamily: 'Sarabun'
    },
    container: {
        overflow: 'auto',
        border: '1px solid black',
        padding: 0,
        height: '100%',
        borderRadius: 3,
    },
    header: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottom: '2px solid black',
        paddingBottom: 8,
        fontFamily: 'SarabunBold'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingRight: 8,
        paddingLeft: 8
    },
    leftColumn: {
        width: '65%'
    },
    rightColumn: {
        width: '35%',
        alignItems: 'flex-end',
        paddingRight: 10,
    },
    label: {
        fontSize: 14,
        marginRight: 5,
        fontFamily: 'SarabunBold'
    },
    value: {
        maxWidth: 300,
        fontSize: 10,
        fontFamily: 'Sarabun',
        paddingLeft: 5,
        paddingBottom: 2,
        paddingTop: 2,
        // สำคัญ: ทำให้ข้อความขึ้นบรรทัดใหม่เมื่อล้น
        flexWrap: 'wrap',
    },
    fieldRow: {
        flexDirection: 'row',
        marginBottom: 18,
        alignItems: 'flex-start'  // เปลี่ยนจาก center เป็น flex-start เพื่อให้อยู่ชิดบนเมื่อมีหลายบรรทัด
    },
    line: {
        borderBottom: '1px solid black',
        flexGrow: 1,
        marginLeft: 5,
        minHeight: 20, // เพิ่มความสูงขั้นต่ำเพื่อรองรับข้อความหลายบรรทัด
    },
    jobNumber: {
        fontWeight: 'bold',
        fontSize: 18,
        fontFamily: 'SarabunBold',
        // borderBottom: '1px solid black',
        paddingBottom: 1,
    },
    date: {
        marginTop: 3,
        fontSize: 10,
        fontFamily: 'Sarabun',
    },
    footer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 10,
        borderTop: '1px solid black',
        paddingTop: 5,
    }
});

const DetailText = ({ label, value }) => (
    <View style={styles.fieldRow}>
        <Text style={styles.label}>
            {label} :
        </Text>
        <View style={styles.line}>
            <Text style={styles.value}>
                {value}
            </Text>
        </View>
    </View>
);

const GenPDF = ({ job, behaviors }) => (
    <Document>
        <Page size="A5" orientation="landscape" style={styles.page}>
            <View style={styles.container}>
                <Text style={styles.header}>ศูนย์บริการ</Text>
                <View style={styles.row}>
                    <View style={styles.leftColumn}>
                        <DetailText label={'ชื่อร้าน'} value={job.shop_name} />
                        <DetailText label={'ที่อยู่'} value={job.address} />
                        <DetailText label={'เบอร์โทรศัพท์'} value={job.phone} />
                        <DetailText label={'ซีเรียลนัมเบอร์'} value={job.serial_id} />
                        <DetailText label={'ส่งซ่อม'} value={job.p_name} />
                        <DetailText label={'อาการ'} value={behaviors} />
                        <DetailText label={'ผู้รับ'} value={job.username} />
                    </View>
                    <View style={styles.rightColumn}>
                        <Text style={styles.jobNumber}>
                            {job.job_id}
                        </Text>
                        <Text style={styles.date}>
                            วันที่ {new Date(job.created_at).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>
                        เอกสารนี้เป็นหลักฐานการรับสินค้าเพื่อส่งซ่อม กรุณาเก็บไว้เพื่อยืนยันตัวตน
                    </Text>
                </View>
            </View>
        </Page>
    </Document>
);

export default function ReceiveSpPdf({ job, behaviors }) {
    return (
        <>
        <Head title='ใบรับสินค้า'/>
        <PDFViewer style={{ width: '100vw', height: '100vh' }}>
            <GenPDF job={job} behaviors={behaviors} />
        </PDFViewer>
        </>
        
    );
}