"use client"
import { getUserDetails } from "@/helper/userauth";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ChatLabel from "./ChatLabel";
import { apiUrl } from "@/lib/api";

export default function ChatList() {
    const pathname = usePathname();
    const [users, setUsers] = useState([]);
    useEffect(() => {
        const { username } = getUserDetails();
        if (!username) return;

        axios.get(apiUrl(`/api/chat?username=${username}`))
            .then(function (response) {
                setUsers(response.data?.users || []);
            }).catch(function (error) {
                console.log("Error loading chats:", error);
            });
    }, []);

    return <>
        <ul className="overflow-auto">
            {(users || []).map((elem, key) => {
                return <li key={elem.chat_id || elem.username || key}>
                    <ChatLabel user={elem} active={elem.chat_id == pathname.split('/chat/')[1]} />
                </li>
            })}
        </ul>
    </>
}
