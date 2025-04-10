import React from "react";
import NavBar from "./NavBar";

type WrapperProps = {
    children: React.ReactNode;
};

const Wrapper = ({ children }: WrapperProps) => {
    return (
        <div>
            <NavBar />
            <div className="px-5 md:px-[10%] mt-8 mb-10">
                {children}
            </div>
        </div>
    )
};

export default Wrapper;
