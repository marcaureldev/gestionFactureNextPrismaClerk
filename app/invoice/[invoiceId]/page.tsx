"use client";

import { deleteInvoice, getInvoiceById, updateInvoice } from "@/app/actions";
import InvoiceInfo from "@/app/components/InvoiceInfo";
import InvoiceLine from "@/app/components/InvoiceLine";
import InvoicePDF from "@/app/components/InvoicePDF";
import VATControl from "@/app/components/VATControl";
import Wrapper from "@/app/components/Wrapper";
import { Invoice, Totals } from "@/type";
import { Save, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const page = ({ params }: { params: Promise<{ invoiceId: string }> }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()

  const fetchInvoice = async () => {
    try {
      const { invoiceId } = await params;

      const fetchedInvoice = await getInvoiceById(invoiceId);
      if (fetchedInvoice) {
        setInvoice(fetchedInvoice);
        setInitialInvoice(fetchedInvoice);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, []);

  useEffect(() => {
    if (!invoice) return;

    const ht = invoice.lines.reduce(
      (acc, { quantity, unitPrice }) => acc + quantity * unitPrice,
      0
    );

    const vat = invoice.vatActive ? ht * (invoice.vatRate / 100) : 0;

    const ttc = ht + vat;

    setTotals({
      totalHT: ht,
      totalVAT: vat,
      totalTTC: ttc,
    });
  }, [invoice]);

  useEffect(() => {
    setIsSaveDisabled(
      JSON.stringify(invoice) === JSON.stringify(initialInvoice)
    );
  }, [invoice, initialInvoice]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = parseInt(e.target.value);
    if (invoice) {
      const updatedInvoice = { ...invoice, status: newStatus };
      setInvoice(updatedInvoice);
    }
  };

  const handleSave = async () => {
    if (!invoice) return;
    setIsLoading(true);
    try {
      await updateInvoice(invoice);
      const updatedInvoice = await getInvoiceById(invoice.id);
      if (updatedInvoice) {
        setInvoice(updatedInvoice);
        setInitialInvoice(updatedInvoice);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la facture: ", err);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes vous sûr de vouloir supprimer cette facture?")

    if(confirmed) {
        try {
            await deleteInvoice(invoice?.id as string)
            router.push("/")
        } catch (err) {
            console.error("Erreur lors de la suppression de la facture: ", err)
        }
    }
  };


  if (!invoice || !totals)
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <span className="text-2xl font-bold">Facture Non Trouvée</span>
      </div>
    );

  return (
    <Wrapper>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <p className="badge badge-ghost badge-lg uppercase">
          <span>Facture-</span> {invoice?.id}
        </p>
        <div className="flex md:mt-0 mt-4">
          <select
            className="select select-sm select-bordered w-full"
            value={invoice?.status}
            onChange={handleStatusChange}
          >
            <option value={1}>Brouillon</option>
            <option value={2}>En attente</option>
            <option value={3}>Payée</option>
            <option value={4}>Annulée</option>
            <option value={5}>Impayée</option>
          </select>
          <button
            className="btn btn-sm btn-accent ml-4"
            disabled={isSaveDisabled || isLoading}
            onClick={handleSave}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-spinner-sm"></span>
            ) : (
              <>
                Sauvegarder
                <Save className="size-4 ml-2" />
              </>
            )}
          </button>
          <button className="btn btn-sm btn-accent ml-4"onClick={handleDelete}>
            <Trash className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full md:gap-4">
        <div className="flex flex-col w-full md:w-1/3">
          <div className="mb-4 bg-base-200 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="badge badge-accent">Résumé des Totaux</div>
              <VATControl invoice={invoice} setInvoice={setInvoice} />
            </div>

            <div className="flex justify-between items-center mb-4">
              <span>Total HT</span>
              <span>{totals.totalHT.toFixed(2)}€</span>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span>TVA({invoice.vatActive ? invoice.vatRate : 0}%)</span>
              <span>{totals.totalVAT.toFixed(2)}€</span>
            </div>

            <div className="flex justify-between items-center mb-4 font-bold">
              <span>Total TTC</span>
              <span>{totals.totalTTC.toFixed(2)}€</span>
            </div>
          </div>
          <InvoiceInfo invoice={invoice} setInvoice={setInvoice} />
        </div>

        <div className="flex flex-col w-full md:w-2/3">
          <InvoiceLine invoice={invoice} setInvoice={setInvoice} />
          <InvoicePDF invoice={invoice} totals={totals}/>
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
