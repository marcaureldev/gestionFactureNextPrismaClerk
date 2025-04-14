import React from 'react'
import { Invoice, Totals } from '@/type'
import { ArrowDownFromLine } from 'lucide-react'

interface FacturePDFProps {
    invoice: Invoice,
    totals: Totals
}

const InvoicePDF: React.FC<FacturePDFProps> = ({invoice, totals}) => {
  return (
    <div className="mt-4 hidden lg:block">
      <div className="border-base-300 border-2 border-dashed rounded-xl p-5">
        <div>
          <button className="btn btn-sm btn-accent mb-4">
            Facture PDF
            <ArrowDownFromLine className="size-4 ml-2" />
          </button>
        </div>

      </div>

    </div>
  )
}

export default InvoicePDF