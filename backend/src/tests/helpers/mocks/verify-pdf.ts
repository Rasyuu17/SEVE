// src/tests/helpers/mocks/verify-pdf.ts
const verifyPDF = () => ({ 
    verified: false, 
    authenticity: false, 
    integrity: false, 
    expired: false, 
    signatures: [] 
});

const getCertificatesInfoFromPDF = () => [];

module.exports = { verifyPDF, getCertificatesInfoFromPDF };