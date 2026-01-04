"use client"
import Link from "next/link"
import { usePathname } from "next/navigation";
import Image from "next/image";
import { MdNotificationsNone } from "react-icons/md";
import { MdOutlineSearch } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import {BiQuestionMark} from 'react-icons/bi'
import icon from "@/public/image/icon.png"
import { TbMessage2 } from "react-icons/tb";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
const links = [
    {
        name: "Chats",
        icon : <TbMessage2 className="w-7 h-7" />,
        link: "/chat"
    },
    {
        name: "Search",
        icon:<MdOutlineSearch className="w-7 h-7"/>,
        link: "/search"
    },
    {
        name: "Friend Request",
        icon:<AiOutlineUsergroupAdd className="w-7 h-7"/>,
        link: "/friendrequest"
    },
    {
        name: "Notification",
        icon:<MdNotificationsNone className="w-7 h-7" />,
        link: "/notification"
    },
    {
        name: "Profile",
        icon: <FiUser className="w-7 h-7"/>,
        link: "/profile"
    },
    {
        name: "Help",
        icon: <BiQuestionMark className="w-7 h-7" />,
        link: "/help"
    }
]

const excludedPaths = ["/","/register","/login","/register/setprofile"]

export default function NavBar() {
    const pathname = usePathname();
    const logout = ()=>{
        localStorage.removeItem("username");
        localStorage.removeItem("password");

    }
    return <nav className={`${!excludedPaths.includes(pathname) ? "" : "hidden"} border-r border-gray-200 bg-white fixed top-0 w-16 left-0 flex flex-col justify-between h-full py-4`}>
        <div className={`p-2 mx-auto w-fit`}>
         <Image src={icon}></Image>
        </div>
        <div className="flex flex-col items-center justify-center gap-y-7 px-2 py-4">
            {links.map(elem => {
                const active = pathname.startsWith(elem.link);
                return <Link href={elem.link} key={elem.name} className={`p-2 ${!active ? "text-primary-400 bg-primary-50 hover:text-primary-600 hover:bg-primary-100" : "text-white bg-primary-600 hover:bg-primary-700"} transition-colors duration-200 rounded-full focus:outline-none`}>
                    <span className="sr-only">{elem.name}</span>
                    {elem.icon}
                </Link>
            })}

        </div>
        <Link href="/login"
            onClick={logout}
        className={`p-2 text-primary-400 bg-primary-50 hover:text-primary-600 hover:bg-primary-100 transition-colors duration-200 rounded-full focus:outline-none mx-auto w-fit`}>
            <span className="sr-only">logout</span>
            <svg className="w-7 h-7 p-1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" stroke="currentColor" fill="currentColor" version="1.1" id="Capa_1" viewBox="0 0 384.971 384.971" space="preserve">
                <g>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={40} d="M180.455,360.91H24.061V24.061h156.394c6.641,0,12.03-5.39,12.03-12.03s-5.39-12.03-12.03-12.03H12.03    C5.39,0.001,0,5.39,0,12.031V372.94c0,6.641,5.39,12.03,12.03,12.03h168.424c6.641,0,12.03-5.39,12.03-12.03    C192.485,366.299,187.095,360.91,180.455,360.91z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={20} d="M381.481,184.088l-83.009-84.2c-4.704-4.752-12.319-4.74-17.011,0c-4.704,4.74-4.704,12.439,0,17.179l62.558,63.46H96.279    c-6.641,0-12.03,5.438-12.03,12.151c0,6.713,5.39,12.151,12.03,12.151h247.74l-62.558,63.46c-4.704,4.752-4.704,12.439,0,17.179    c4.704,4.752,12.319,4.752,17.011,0l82.997-84.2C386.113,196.588,386.161,188.756,381.481,184.088z" />
                </g>
            </svg>
        </Link>
    </nav>

}