import Header from "../../src/components/Header.tsx";
import type {LayoutProps} from "@/type/layout.ts";

const Layout = ({children}: LayoutProps) => {
    return (
        <div className="w-full min-h-screen bg-[#f6f6f6] px-5 py-5 flex justify-center">
            <div className="max-w-422 w-full flex flex-col gap-5">
                <Header/>
                {children}
            </div>
        </div>
    );
}

export default Layout;
