"use client";

import axios from "axios";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import { ThreeDots } from "react-loader-spinner";
export default function UserProfile() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const router = useRouter();

  const submit = (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.target);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    formObject.username=localStorage.getItem("username");
    axios.post("/register/setprofile/api", formObject)
      .then(function (response) {
        if (response.data.error) {
          console.log(response.data.error);
        } else {
          router.push("/chat");
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(function () {
        setLoading(false);
      });
  };

  return (
    <div className="from-primary-50 to-primary-300 bg-gradient-to-br flex items-center justify-center h-screen">
      <div className="flex shadow-md sm:w-full md:w-96 lg:w-7/12 rounded-lg min-h-[80vh]">
        <div className="bg-gradient-to-b from-primary-700/80  to-primary-300/80 w-5/12 rounded-l-lg flex flex-col justify-center items-center">
          <div className=" w-full h-32 flex flex-col justify-center items-center">
            <h3 className=" text-white text-xl">Set up</h3>
            <h2 className="text-white text-4xl font-bold"> your profile</h2>
          </div>
        </div>
        <div className="bg-gray-50 p-8 rounded-r-lg w-7/12 flex flex-col justify-center">
          <form id="profile-form" onSubmit={submit}>
            <div className="flex gap-x-4">
              <div className="w-1/2">
                <input
                  type="text"
                  id="firstName"
                  name="fname"
                  required
                  placeholder="First Name"
                  className="w-full border rounded-md py-2 px-3 focus:outline-gray-300"
                />
              </div>

              <div className="w-1/2">
                <input
                  type="text"
                  id="lastName"
                  name="lname"
                  required
                  placeholder="Last Name"
                  className="w-full border rounded-md py-2 px-3 focus:outline-gray-300"
                />
              </div>
            </div>
            <div className="w-full mt-4 flex gap-x-4">
              <div className="w-1/2">
                <select
                  id="gender"
                  name="gender"
                  required
                  className="w-full h-12 border rounded-md p-2 focus:outline-gray-300"
                >
                  <option value="Other" disable="true" hidden={true}>
                    Gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="w-1/2">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                placeholderText="Date of Birth"
                dateFormat="dd-MM-yyyy"
                className="w-full border rounded-md p-3 focus:outline-gray-300"
                name="dob"
              />
            </div>
            </div>
            

            <div className="my-4">
              <textarea
                id="bio"
                name="bio"
                className="w-full border rounded-md py-3 px-3 focus:outline-gray-300"
                placeholder="Bio"
                rows="2"
              ></textarea>
            </div>
            <button
              type="submit"
              className="font-semibold tracking-wider mt-8 bg-primary-500 text-white px-4 py-3 rounded-md hover:bg-primary-600 transition-colors w-full"
            >
              <div className="w-full flex justify-center">
                  <ThreeDots
                    height={24}
                    width={24}
                    radius="2"
                    color="hsl(278 100% 90%)"
                    visible={loading}
                  />
                </div>
                {!loading && <span className="uppercase">save profile</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
