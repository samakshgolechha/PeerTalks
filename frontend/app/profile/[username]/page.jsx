"use client"
import Profilepic from "@/components/Profilepic";
import axios from "axios";
import { useState } from "react";

export default function Profile({ params }) {
  const { username } = params;
  const [user, setUser] = useState({});
  axios
    .get(`/profile/api?username=${username}`)
    .then(function (response) {
      if (setUser)
        setUser(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
  const fields = [
    {field : "bio", text : "Bio"}, 
    {field : "gender", text : "Gender"}, 
    {field : "DOB", text : "Date of Birth"},
  ];
  return (
    <>
      <div className="w-full bg-gradient-to-b from-primary-100 to-slate-100 h-72 flex justify-center items-center pb-5">
        <div className="flex items-center w-6/12">
          <Profilepic gender={user.gender} className="h-24 w-24 border border-3 border-gray-600 bg-white shadow-lg" />
          <div className="ml-8 space-y-1">
            <h1 className="text-xl font-semibold">@{user.username}</h1>
            <h2 className="text-lg font-medium text-gray-700">{user.fname} {user.lname}</h2>
          </div>
        </div>
      </div>

      <div className="mx-auto px-8 py-5 bg-white shadow-profilepage transition-shadow rounded-md w-6/12 max-h-screen -translate-y-12">
        <div className="text-gray-600 text-lg font-semibold mb-4">
          Basic Info
        </div>
        {fields.map(elem => {
          return user[elem.field] && (
          <div key={elem.field} className="flex flex-col my-3">
            <span
              className="text-gray-600 text-sm block mb-0.5">
              {elem.text}
            </span>
            <div >{user[elem.field]}</div>
          </div>)
        })}
      </div>
    </>
  );
}
