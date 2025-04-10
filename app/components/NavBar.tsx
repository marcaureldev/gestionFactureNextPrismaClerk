"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { Layers } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { checkAndAddUser } from "../actions";

const NavBar = () => {
    const pathname = usePathname();

    const {user} = useUser();

    useEffect(() => {
        if(user?.primaryEmailAddress?.emailAddress && user.fullName) {
            checkAndAddUser(user.primaryEmailAddress.emailAddress, user.fullName)
        }

    }, [user])

    const NavLinks = [
        {
            href: "/",
            label: "Factures",
        },
    ];

    const isActiveLink = (href: string) => {
        return pathname.replace(/\/$/, "") === href.replace(/\/$/, "");
    };

    const renderNavLink = (classNames: string) =>
        NavLinks.map(({ href, label }) => {
            return (
                <Link
                    href={href}
                    key={href}
                    className={`btn btn-sm ${classNames}  ${isActiveLink(href) ? "btn-accent" : ""
                        }`}
                >
                    {label}
                </Link>
            );
        });

    return (
        <div className="border-b border-base-300 px-5 px-[10%] py-4 relative">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-accent-content text-accent rounded-full p-2">
                        <Layers className="size-5" />
                    </div>
                    <span className="font-bold text-2xl items-center">
                        In<span className="text-accent">Voice</span>
                    </span>
                </div>
                <div className="flex space-x-4 items-center">
                    {renderNavLink("btn")}
                    <UserButton />
                </div>
            </div>
            <div></div>
        </div>
    );
};

export default NavBar;
