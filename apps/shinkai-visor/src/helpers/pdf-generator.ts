import { jsPDF } from 'jspdf';

const IGNORED_ELEMENTS = ['img', 'svg'];

export const generatePdfFromCurrentPage = async (fileName: string): Promise<File | undefined> => {
  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const getPdfFromHtml = async (html: HTMLElement | string): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        pdf.html(html, {
          html2canvas: {
            windowWidth: 1920,
            windowHeight: 1080,
            scale: 0.1675,
            ignoreElements(element) {
              return IGNORED_ELEMENTS.includes(element.tagName);
            },
          },
          margin: 2,
          autoPaging: 'text',
          image: { type: 'jpeg', quality: 0.1 },
          callback: (doc) => {
            const output = doc.output('blob');
            resolve(output);
          },
        });
      });
    };
    const siteAsPdfBlob = await getPdfFromHtml(document.body);
    const siteAsPdfFile = new File([siteAsPdfBlob], fileName, { type: siteAsPdfBlob.type });
    return siteAsPdfFile;
  } catch (e) {
    console.log('errror generating pdf', e);
    return undefined;
  }
};
