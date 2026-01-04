"use client";

import Profilepic from "@/components/Profilepic";
import ProfileLink from "@/components/utils/ProfileLink";
import axios from "axios";
import { useEffect, useState } from "react";
import { GrClose } from "react-icons/gr";
import { IoCheckmarkSharp } from "react-icons/io5";
import { toast } from "react-toastify";

export default function FriendRequest() {
  const [users, setUsers] = useState([]);
  const filterUser = (user) => {
    setUsers(users.filter((elem) => elem.username != user))
  }
  useEffect(() => {
    const username = localStorage.getItem("username");
    axios
      .get(`/friendrequest/api?username=${username}`)
      .then(function (response) {
        setUsers(response.data)
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [])
  return users.length > 0 ? <div className="min-h-screen bg-gradient-to-b from-primary-100 to-slate-100">
    <div className="mb-4">
      <h1 className="font-semibold text-gray-600 tracking-wide font-fancy text-2xl pt-5 text-center">Friend Requests</h1>
    </div>
    <div className="mx-auto flex flex-col gap-y-3 justify-center items-center max-w-2xl">
      {
        users.map((elem) => {
          return <RequestCard user={elem} key={elem.username} filterUser={filterUser} />
        })
      }
    </div>
  </div>
    : (
      <Noreq />
    );
}

function RequestCard({ user, filterUser }) {
  const submit = (accepted) => {
    const username = localStorage.getItem("username");

    axios
      .post(`/friendrequest/api`, {
        sender: username,
        receiver: user.username,
        accepted: accepted,
      })
      .then(function (response) {
        if (!response.error) {
          filterUser(user.username)
          if(accepted)
            toast.success(`Connected to ${user.username}`);
          else
            toast.error("Declined Request");
        }
        else console.log(response.error)
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  return <div className="w-full grid items-center grid-cols-5 bg-white rounded-lg shadow-lg mx-auto p-4">
    <div>
      <Profilepic gender = {user.gender} className="w-12 h-12 rounded-full border border-gray-100 shadow-sm"  />
   </div>
    <div className="col-span-3">
    <ProfileLink fname = {user.fname} lname = {user.lname} username = {user.username} className="font-semibold text-gray-800" />
        <span className="text-gray-400"> wants to be your friend</span>
    </div>
    <div className="font-semibold flex gap-x-3 mt-3">
        <button onClick={() => submit(true)} className="text-green-500 uppercase border-2 border-solid border-green-600 hover:bg-green-600 hover:text-white transition-colors duration-200 font-medium text-sm rounded-full p-2">
        <IoCheckmarkSharp />
        </button>
        <button onClick={() => submit(false)} className="text-red-500 uppercase border-2 border-solid border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200 font-medium text-sm rounded-full p-2">
          <GrClose/>
        </button>
    </div>
    </div>
}

function Noreq() {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-b from-primary-100 to-slate-100">
      <div className="text-gray-500 text-2xl">No friend requests</div>
    </div>
  );
}
