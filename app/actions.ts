"use server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function checkAndAddUser(email: string, name: string) {
    if (!email) return;

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!existingUser && name) {
            await prisma.user.create({
                data: {
                    email,
                    name,
                },
            });
        }
    } catch (err) {
        console.error(err);
    }
}

const generateUniqueId = async () => {
    let uniqueId;
    let isUnique = false;

    while (!isUnique) {
        uniqueId = randomBytes(3).toString("hex");

        const existingInvoice = await prisma.invoice.findUnique({
            where: {
                id: uniqueId,
            },
        });

        if (!existingInvoice) {
            isUnique = true;
        }
    }
    return uniqueId;
};

export async function createEmptyInvoice(email: string, name: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        const invoiceId = (await generateUniqueId()) as string;

        if (user) {
            const newInvoice = await prisma.invoice.create({
                data: {
                    id: invoiceId,
                    name: name,
                    userId: user?.id,
                    issuerName: "",
                    issuerAddress: "",
                    clientName: "",
                    clientAddress: "",
                    invoiceDate: "",
                    dueDate: "",
                    vatActive: false,
                    vatRate: 20,
                    status: 1,
                },
            });
        }
    } catch (err) {
        console.error(err);
    }
}

export async function getInvoicesByEmail(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
            include: {
                invoices: {
                    include: {
                        lines: true,
                    },
                },
            },
        });

        if (user) {
            const today = new Date();

            const updatedInvoices = await Promise.all(
                user.invoices.map(async (invoice) => {
                    const dueDate = new Date(invoice.dueDate);
                    if (dueDate < today && invoice.status === 2) {
                        const updatedInvoice = await prisma.invoice.update({
                            where: {
                                id: invoice.id,
                            },
                            data: {
                                status: 5,
                            },
                            include: {
                                lines: true,
                            },
                        });
                        return updatedInvoice;
                    }
                    return invoice;
                })
            );

            return updatedInvoices;
        }
    } catch (err) {
        console.error(err);
    }
}
