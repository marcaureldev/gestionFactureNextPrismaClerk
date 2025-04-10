"use client";
import Image from "next/image";
import Wrapper from "./components/Wrapper";
import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { createEmptyInvoice, getInvoicesByEmail } from "./actions";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { Invoice } from "@/type";
import InvoiceComponent from "./components/InvoiceComponent";

export default function Home() {
  const [invoiceName, setInvoiceName] = useState("");
  const [isNameValid, setIsNameValid] = useState(false);
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const fetchInvoices = async () => {
    try {
      const data = await getInvoicesByEmail(email);
      if (data) {
        setInvoices(data)
      }

    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchInvoices();
  }, [email])

  useEffect(() => {
    setIsNameValid(invoiceName.length <= 60);
  }, [invoiceName]);

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

  const handleCreateInvoice = async () => {
    try {
      if (email) {
        await createEmptyInvoice(email, invoiceName);
      }
      setInvoiceName("");
      fetchInvoices();
      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      handleClick();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Wrapper>
      {/* You can open the modal using document.getElementById('ID').showModal() method */}

      <div className=" flex flex-col space-y-4">
        <h1 className="font-bold text-lg">Mes Factures</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="cursor-pointer border border-accent rounded-xl flex justify-center items-center"
            onClick={() =>
              (
                document.getElementById("my_modal_3") as HTMLDialogElement
              ).showModal()
            }
          >
            <div className="font-bold text-accent flex flex-col justify-center items-center p-5">
              Créer une facture
              <div className="!bg-accent-content !text-accent rounded-full p-2">
                <Layers className="size-5" />
              </div>
            </div>
          </div>

          {
            invoices.length > 0 && (
              (invoices.map((invoice, index) => (
                <div key={index}>
                  <InvoiceComponent invoice={invoice} index={index} />

                </div>
              )))
            )
          }
        </div>

        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Nouvelle Facture</h3>
            <input
              type="text"
              placeholder="Nom de la facture(max 60 caractères)"
              className="input input-bordered w-full my-4"
              value={invoiceName}
              onChange={(e) => {
                setInvoiceName(e.target.value);
              }}
            />

            {!isNameValid && (
              <p className="text-red-500 mb-4 text-xs">
                Le nom de la facture doit contenir moins de 60 caractères
              </p>
            )}

            <button
              className="btn btn-accent"
              disabled={!isNameValid || !invoiceName}
              onClick={handleCreateInvoice}
            >
              Créer
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}
