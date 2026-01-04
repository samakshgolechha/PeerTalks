"use client"
import Profilepic from "@/components/Profilepic";
import ProfileLink from "@/components/utils/ProfileLink";
import axios from "axios";
import { useEffect, useState } from "react";

export default function TopHeader({chatid}) {
  const [user,setUser]=useState({})
  useEffect(() => {
      const username = localStorage.getItem("username");
      axios
        .get(`/chat/api/chatuser?username=${username}&chatid=${chatid}`)
        .then(function (response) {
          setUser(response.data)
          console.log(response.data)
        })
        .catch(function (error) {
          console.log(error);
        });
    }, [])
    
    return <div className="relative flex items-center p-3 border-b border-gray-300 bg-white w-full">
        <Profilepic gender = {user.gender} className="object-cover w-10 h-10 rounded-full" />
        <ProfileLink fname = {user.fname} lname = {user.lname} username = {user.username} className="block ml-2 font-bold text-gray-600 capitalize" />
    </div>
}