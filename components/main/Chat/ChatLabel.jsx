"use client"
import Profilepic from "@/components/Profilepic";
import Link from "next/link";

export default function ChatLabel({user, active}){
    return <Link href={`/chat/${user.chat_id}`} className={`flex items-center px-3 py-2 text-sm transition duration-300 ease-in-out border-b border-gray-300 cursor-pointer ${active ? "bg-gray-100" : ""} hover:bg-gray-100 focus:outline-none`}>
    <Profilepic className="object-cover w-10 h-10 rounded-full" gender={user.gender}/>
    <div className="w-full pb-2">
        <div className="flex justify-between">
            <span className="block ml-2 font-semibold text-gray-600 capitalize truncate">
                {user.fname} {user.lname}
            </span>
        </div>
    </div>
</Link>
}