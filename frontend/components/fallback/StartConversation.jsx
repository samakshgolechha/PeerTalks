import { TbMessage2Search } from "react-icons/tb";
import { GrSearch } from "react-icons/gr";
import Link from "next/link";

export default function StartConversation() {
    return <div className="flex flex-col justify-center items-center gap-y-4">
        <TbMessage2Search className="text-slate-400 text-[10rem] mt-40" />
        <div className="text-gray-600 text-4xl font-fancy">Talk with Peers</div>
        <div className="text-gray-400">Start a conversation with peers you are connected with or search new peers</div>
        <button className="text-slate-500 flex gap-x-2 uppercase tracking-wider border-2 border-solid border-slate-600 hover:bg-slate-600 hover:text-white transition-colors duration-200 font-medium text-lg py-2 px-6 rounded-md">
            <Link href="/search">
                Search
            </Link>
            <GrSearch className="mt-[0.3rem]" />
        </button>
    </div>
}