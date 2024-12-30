import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfMake as any).addVirtualFileSystem(pdfFonts);

export function downloadCandidatePDF(id: number, description: string) {
  const pdf = pdfMake.createPdf({
    content: [
      {
        stack: [`CAND${id}`],
        style: "header",
      },
      {
        text: [description],
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 20],
      },
    },
  });
  pdf.download(`CAND${id}.pdf`);
}
