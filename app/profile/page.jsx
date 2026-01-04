"use client"
import Profilepic from "@/components/Profilepic";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
export default function Home() {
  const [user, setUser] = useState({});
  const change = (e) => {
    e.preventDefault();

    const fieldname = e.target.name;
    const fieldValue = e.target.value;
    setUser({ ...user, [fieldname]: fieldValue })
  }
  useEffect(() => {
    const username = localStorage.getItem("username")
    axios
      .get(`profile/api?username=${username}`)
      .then(function (response) {
        setUser(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [])

  const saveUser = (e) => {
    e.preventDefault();
    axios.post("/register/setprofile/api", {
      fname : user.fname,
      lname : user.lname,
      username : user.username,
      gender : user.gender && "Other",
      bio : user.bio
    })
      .then(function (response) {
        if (response.data.error) {
          console.log(response.data.error);
        } else {
          toast.success("Profile Updated!")
        }
      })
      .catch(function (error) {
        console.log(error);
      })
  }
  
  const inputClass = "w-full border rounded-md py-2 px-3 focus:outline-gray-300";
  return (
    <>
      <div className="w-full bg-gradient-to-b from-primary-100 to-slate-100 h-72 flex justify-center items-center pb-5">
        <div className="flex items-center w-6/12">
          <Profilepic gender={user.gender} className="h-24 w-24 border border-3 border-gray-600 bg-white shadow-lg" />
          <div className="ml-8 space-y-1">
            <h1 className="text-xl font-semibold text-gray-600">@{user.username}</h1>
          </div>
        </div>
      </div>

      <form onSubmit={saveUser} className="mx-auto px-8 py-5 pb-12 flex flex-col gap-y-5 bg-white shadow-profilepage transition-shadow rounded-md w-6/12 max-h-screen -translate-y-12">
        <div className="text-gray-600 text-lg font-semibold mb-4">Basic Info</div>
        <div>
          <label htmlFor="bio" className="text-gray-600 text-sm block mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={user.bio}
            className={inputClass}
            rows="2"
            onChange={change}
          ></textarea>
        </div>

        <div>
          <label htmlFor="fname" className="text-gray-600 text-sm block mb-1">
            First Name
          </label>
          <input
            value={user.fname}
            id="fname"
            name="fname"
            className={inputClass}
            onChange={change}
          />
        </div>

        <div>
          <label htmlFor="lName" className="text-gray-600 text-sm block mb-1">
            Last Name
          </label>
          <input
            value={user.lname}
            id="lName"
            name="lname"
            onChange={change}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="gender" className="text-gray-600 text-sm block mb-1">
            Gender
          </label>
          <select className="w-full border rounded-md py-2 px-3" name="gender" value={user.gender} id="gender" onChange={change}>
            <option
              name="gender" selected={"Male" == user.gender}>
              Male
            </option>
            <option name="gender" selected={"Female" == user.gender}>
              Female
            </option>
            <option name="gender" selected={"Other" == user.gender}>
              Other
            </option>
          </select>
        </div>

        {user.DOB && <div>
          <label htmlFor="dob" className="text-gray-600 text-sm block mb-1">
            Date of Birth
          </label>
          <input
            readOnly
            type="text"
            format="dd-mm-yyyy"
            value={user.DOB}
            id="dob"
            name="dob"
            className={inputClass}
          />
        </div>}
        <button
          type="submit"
          className="w-24 font-semibold my-4 bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors "
        >Update</button>
      </form>
    </>
  );
}
