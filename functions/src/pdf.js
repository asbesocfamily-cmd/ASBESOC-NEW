import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export async function certificatePdf(certificate) {
  const url = `https://asbesoc.org/verify-certificate/${encodeURIComponent(certificate.id)}`;
  const qr = await QRCode.toBuffer(url, { width: 240, margin: 2, errorCorrectionLevel: 'M' });
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 44, info: { Title: 'ASBESOC Annual Membership Certificate' } });
  const chunks = [];
  const finished = new Promise((resolve, reject) => {
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  doc.rect(22, 22, 798, 551).lineWidth(3).stroke('#174b36');
  doc.fillColor('#174b36').font('Helvetica-Bold').fontSize(26).text('ASBESOC NIGERIA', 44, 58, { align: 'center' });
  doc.fontSize(20).text('ANNUAL MEMBERSHIP CERTIFICATE', 44, 105, { align: 'center' });
  doc.font('Helvetica').fontSize(14).fillColor('#334155').text('This certifies that', 44, 158, { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(24).fillColor('#174b36').text(certificate.fullName, 80, 192, { width: 682, height: 85, align: 'center', ellipsis: true });
  doc.font('Helvetica').fontSize(14).fillColor('#334155').text('has an approved, paid annual membership of ASBESOC Nigeria.', 44, 287, { align: 'center' });
  const date = value => value.toDate().toISOString().slice(0, 10);
  doc.fontSize(12).text(`Valid from ${date(certificate.startsAt)} until ${date(certificate.expiresAt)} (UTC)`, 44, 322, { align: 'center' });
  doc.fontSize(10).text(`Certificate ID: ${certificate.id}`, 65, 376, { width: 555 });
  doc.text(`Issued: ${date(certificate.issuedAt)}`, 65, 400);
  doc.text('Verify current validity by scanning the QR code.', 65, 428);
  doc.fontSize(9).text('This certificate records membership, not a professional licence.', 65, 452);
  doc.image(qr, 652, 365, { width: 120 });
  doc.fontSize(9).text(url, 65, 510, { width: 710, link: url, align: 'center' });
  doc.end();
  return finished;
}
