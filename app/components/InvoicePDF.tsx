import React, { useRef } from "react";
import { Invoice, Totals } from "@/type";
import { ArrowDownFromLine, Layers } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import confetti from "canvas-confetti";

interface FacturePDFProps {
  invoice: Invoice;
  totals: Totals;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };
  return date.toLocaleDateString("fr-FR", options);
}

const InvoicePDF: React.FC<FacturePDFProps> = ({ invoice, totals }) => {
  const factureRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    const end = Date.now() + 1.5 * 1000; // 1.5 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  const handleDownloadPDF = async () => {
    const element = factureRef.current;

    if (element) {
      try {
        const canvas = await html2canvas(element, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "A4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Facture-${invoice.id}.pdf`);
        handleClick();
      } catch (err) {
        console.error("Erreur lors de la génération du PDF: ", err);
      }
    }
  };

  return (
    <div className="mt-4 hidden lg:block">
      <div className="border-base-300 border-2 border-dashed rounded-xl p-5">
        <div>
          <button
            className="btn btn-sm btn-accent mb-4"
            onClick={handleDownloadPDF}
          >
            Facture PDF
            <ArrowDownFromLine className="size-4 ml-2" />
          </button>

          <div className="p-8" ref={factureRef}>
            <div className="flex justify-between items-center text-sm">
              <div className="flex flex-col">
                <div>
                  <div className="flex items-center">
                    <div className="bg-accent-content text-accent rounded-full p-2">
                      <Layers className="size-6" />
                    </div>
                    <span className="font-bold text-2xl items-center">
                      In<span className="text-accent">Voice</span>
                    </span>
                  </div>
                </div>
                <h1 className="text-6xl font-bold uppercase">Facture</h1>
              </div>
              <div className="text-right uppercase">
                <p className="badge badge-ghost">Facture n° {invoice.id}</p>

                <p className="my-2">
                  <strong>Date </strong>
                  {formatDate(invoice.invoiceDate)}
                </p>

                <p>
                  <strong>Date d'échéance </strong>
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>

            <div className="my-6 flex justify-between">
              <div>
                <p className="badge badge-ghost mb-2">Emetteur</p>
                <p className="text-sm font-bold italic">{invoice.issuerName}</p>
                <p className="text-sm text-gray-500 w-52 break-word">
                  {invoice.issuerAddress}
                </p>
              </div>

              <div className="text-right">
                <p className="badge badge-ghost mb-2">Client</p>
                <p className="text-sm font-bold italic">{invoice.clientName}</p>
                <p className="text-sm text-gray-500 w-52 break-word">
                  {invoice.clientAddress}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th></th>
                    <th>Description</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line, index) => (
                    <tr key={index + 1}>
                      <td>{index + 1}</td>
                      <td>{line.description}</td>
                      <td>{line.quantity}</td>
                      <td>{line.unitPrice.toFixed(2)}€</td>
                      <td>{(line.quantity * line.unitPrice).toFixed(2)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-2 text-md">
              <div className="flex justify-between">
                <div className="font-bold">Total Hors Taxes</div>
                <div>{totals.totalHT.toFixed(2)}€</div>
              </div>

              {invoice.vatActive && (
                <div className="flex justify-between">
                  <div className="font-bold">TVA {invoice.vatRate}%</div>
                  <div>{totals.totalVAT.toFixed(2)}€</div>
                </div>
              )}

              <div className="flex justify-between">
                <div className="font-bold">Total Toutes Taxes Comprises</div>
                <div className="badge badge-accent">
                  {totals.totalTTC.toFixed(2)}€
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePDF;
