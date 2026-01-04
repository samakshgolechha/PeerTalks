"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import Profilepic from "@/components/Profilepic";
import ProfileLink from "@/components/utils/ProfileLink";
import { toast } from "react-toastify";
export default function Notification() {
  useEffect(() => {
    const username = localStorage.getItem("username");
    axios
      .get(`/notification/api?username=${username}`)
      .then(function (response) {
        setNoti(response.data);
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);
  const [noti, setNoti] = useState([]);

  const clearNotifications = () => {
    const username = localStorage.getItem("username");
    axios
      .delete(`/notification/api?username=${username}`)
      .then(function (response) {
        if (!response.error) {
          setNoti([]);
          toast.info("Cleared!",{
            position: "bottom-right",
          });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  return noti.length > 0 ? (
    <div className="bg-gradient-to-b from-primary-100 to-slate-100 h-screen">
      <div className="flex justify-between pl-5 border-b-[1px] border-gray-300">
        <h1 className="text-2xl font-bold font-fancy text-gray-700 mt-4 ml-4 tracking-wide ">
          Notifications
        </h1>
        <div>
          <button
            type="submit"
            className="flex gap-x-2 bg-primary-500 text-white m-2 p-2 rounded-lg hover:bg-primary-600 transition-colors w-fit"
            onClick={clearNotifications}
          >
            {" "}
            Clear <MdDelete className="mt-1 h-4 w-4" />
          </button>
        </div>
      </div>
      <hr />
      <div className="pl-2 ">
        {noti.map((elem, key) => {
          return <NotificationCard noti={elem} key={key} />;
        })}
      </div>
    </div>
  ) : (
    <NoNoti />
  );
}

function NotificationCard({ noti }) {
  return (
    <div className="flex gap-x-12 items-center m-2 border-b-[1px] border-gray-300">
      <Profilepic
        gender={noti.gender}
        className="h-12 w-12 border border-1 border-gray-600  m-3 col-span-1 bg-white"
      />
      <div className="flex items-center gap-x-10">
        <div className="">
        <ProfileLink fname = {noti.fname} lname = {noti.lname} username = {noti.username} className="text-sm font-semibold text-gray-900" />
          <span className="text-sm font-normal"> {noti.message}</span>
        </div>
        <div className=" text-gray-500 py-7 text-xs font-medium text-left bg">
          {new Date(noti.time).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

function NoNoti() {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-b from-primary-100 to-slate-100">
      <div className="text-gray-500 text-2xl">No new notifications</div>
    </div>
  );
}
