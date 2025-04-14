import { Invoice as PrismaInvoice } from "@/generated/prisma";
import { InvoiceLine } from "@/generated/prisma";

export interface Invoice extends PrismaInvoice {
    lines: InvoiceLine[];
}

export interface Totals {
    totalHT: number,
    totalVAT: number,
    totalTTC: number,
}

