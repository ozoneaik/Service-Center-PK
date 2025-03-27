import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer, Font, Image } from '@react-pdf/renderer';
import {usePage} from "@inertiajs/react";

// ลงทะเบียน Font ภาษาไทย
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
        padding: 30,
        fontFamily: 'Sarabun',
        fontSize: 12,
        backgroundColor: '#f5f5f5',
        flexDirection: 'row', // Change to row to accommodate side border
    },
    blueBorder: {
        // width: 10, // Border width
        backgroundColor: '#3498db', // Blue color
        height: '100%', // Full page height
    },
    contentContainer: {
        flex: 1, // Take remaining space
        border: '1px solid #3498db',
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        boxShadow: '2 2 5 rgba(0,0,0,0.1)'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderBottom: '2px solid #3498db',
        paddingBottom: 10
    },
    header1: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        // borderBottom: '2px solid #3498db',
        paddingBottom: 10
    },
    headerText: {
        fontFamily: 'SarabunBold',
        fontSize: 18,
        color: '#2c3e50',
        textAlign: 'center'
    },
    shopText : {
        fontFamily: 'SarabunBold',
        fontSize: 14,
        color: '#2c3e50',
        textAlign: 'center'
    },
    groupInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 10
    },
    groupInfoText: {
        fontSize: 12,
        color: '#7f8c8d'
    },
    listContainer: {
        marginTop: 20,
        marginBottom: 20,
        flex: 1 // Allow list to expand
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingLeft: 20,
        borderBottom: '1px solid #ecf0f1',
        paddingBottom: 10
    },
    listItemDetails: {
        flex: 1,
        marginLeft: 10
    },
    listItemText: {
        fontSize: 12,
        marginBottom: 5
    },
    listItemSubText: {
        fontSize: 10,
        color: '#7f8c8d'
    },
    signatureArea: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        marginTop: 'auto', // Push to bottom
        paddingRight: 20,
        paddingBottom: 30
    },
    signatureLine: {
        width: 250,
        borderBottom: '1px solid #7f8c8d',
        marginBottom: 5
    },
    signatureText: {
        color: '#7f8c8d',
        fontSize: 10,
        textAlign: 'right'
    }
});

export default function PrintSendJob({ group, job_group }) {
    // หากไม่มี jobs ให้ส่งค่าเป็นอาร์เรย์เปล่า
    const safeGroup = group || [];
    const user = usePage().props.auth.user;
    console.log(group)
    const GenPDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Blue border */}
                <View style={styles.blueBorder} />

                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>
                            รายงานส่งซ่อมสินค้ามายังศูนย์ Pumpkin
                        </Text>
                    </View>
                    <View style={styles.header1}>
                        <Text style={styles.shopText}>
                            ศูนย์บริการ {user.store_info.shop_name}
                        </Text>
                    </View>

                    <View style={styles.groupInfo}>
                        <Text style={styles.groupInfoText}>กลุ่มงาน: {job_group}</Text>
                        <Text style={styles.groupInfoText}>
                            วันที่: {new Date().toLocaleDateString('th-TH')}
                        </Text>
                    </View>

                    <View style={styles.listContainer}>
                        {safeGroup.map((job, index) => (
                            <View key={job.id} style={styles.listItem}>
                                <View style={styles.listItemDetails}>
                                    <Text style={styles.listItemText}>
                                        {job.p_name}
                                    </Text>
                                    <Text style={styles.listItemSubText}>
                                        รหัสสินค้า: {job.pid} |
                                        ซีเรียล: {job.serial_id} |
                                        Job ID: {job.job_id}
                                    </Text>
                                    <Text style={styles.listItemSubText}>
                                        ประเภท: {job.p_cat_name} |
                                        ประเภทย่อย: {job.p_sub_cat_name}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.signatureArea}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>
                            ลายเซ็นผู้รับสินค้า
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );

    return (
        <PDFViewer style={{ width: '100vw', height: '100vh' }}>
            <GenPDF />
        </PDFViewer>
    );
}
