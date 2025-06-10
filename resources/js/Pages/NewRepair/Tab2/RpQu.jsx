export default function RpQu(){
    const url = 'http://qupumpkin.dyndns.org:8130/QU-1749110120CIS-C_SC20250610162805.pdf'
    return (
        <div style={{
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
        }}>
            <iframe
                src={url}
                style={{
                    width: '100%',
                    height: '500px',
                    // border: 'none',
                    // margin: 0,
                    // padding: 0
                }}
                title="PDF Viewer"
            >
                RpQu
            </iframe>
        </div>
    )
}
