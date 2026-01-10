"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";

export default function Register() {
  const [errorClient, setErrorClient] = useState(false);
  const [errorServer, setErrorServer] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = (event) => {
    setLoading(true);
    event.preventDefault();
    const formData = new FormData(event.target);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    if (formObject.password != formObject.cpassword) {
      setErrorClient(true);
      setLoading(false);
      return;
    }

    axios
      .post("register/api", formObject)
      .then(function (response) {
        console.log(response.data.error)
        if (response.data.error) 
        {
          setErrorServer(true);
        } else {
          localStorage.setItem("username", response.data.username);
          localStorage.setItem("password", response.data.password);
          setLoading(true);
          router.push("register/setprofile");
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(function () {
        setLoading(false);
      });
  };

  let inputClass =
    "bg-white mt-1 p-2 w-full border border-gray-200 rounded-md focus:outline-none text-[0.95rem] focus:border-gray-400 transition-colors py-3 px-4";

  return (
    <>
      <div className="from-primary-50 to-primary-300 bg-gradient-to-br flex items-center justify-center h-screen">
        <div className="flex shadow-md sm:w-full md:w-96 lg:w-7/12 rounded-lg min-h-[70vh]">
          <div className="bg-gradient-to-b from-primary-700/80  to-primary-300/80 w-4/12 rounded-l-lg flex flex-col justify-center items-center">
            <div className=" w-full h-32 flex flex-col justify-center items-center">
              <h3 className=" text-white text-xl">Welcome to</h3>
              <h2 className="text-white text-4xl font-bold">PEER TALKS</h2>
            </div>
          </div>
          <div className="bg-gray-50 p-8 rounded-r-lg w-2/3">
            <div className="ml-2 flex flex-col gap-y-1 items-center">
              <h2 className="text-2xl font-bold pr-2 text-gray-700">Sign Up</h2>
              <h3 className="text-gray-500 text-sm mb-5">
                Create an account to start chatting with peers
              </h3>
            </div>
            <form
              className="flex flex-col gap-y-4 items-center"
              onSubmit={submit}
            >
              <div className="w-1/2">
                <input
                  type="text"
                  id="username"
                  name="username"
                  style={{ borderColor: errorServer ? "red" : "" }}
                  onChange={() => setErrorServer(false)}
                  className={inputClass}
                  required
                  placeholder="Username"
                />
              </div>

              <div className="w-1/2">
                <input
                  type="password"
                  id="password"
                  name="password"
                  onChange={() => setErrorClient(false)}
                  required
                  placeholder="Password"
                  className={
                    inputClass + (errorClient ? " animate-wiggle" : "")
                  }
                  style={{ borderColor: errorClient ? "red" : "" }}
                />
              </div>
              <div className="w-1/2">
                <input
                  type="password"
                  id="confirmPassword"
                  name="cpassword"
                  onChange={() => setErrorClient(false)}
                  className={
                    inputClass + (errorClient ? " animate-wiggle" : "")
                  }
                  style={{ borderColor: errorClient ? "red" : "" }}
                  required
                  placeholder="Confirm Password"
                />
              </div>

              <div className="w-1/2 relative">
                <div
                  className="absolute -bottom-7 w-full text-center text-xs text-red-500 font-medium transition-opacity duration-200"
                  style={{ opacity: errorServer ? 1 : 0 }}
                >
                  Username already exists!
                </div>
                <div
                  className="absolute -bottom-7 w-full text-center text-xs text-red-500 font-medium transition-opacity duration-200"
                  style={{ opacity: errorClient ? 1 : 0 }}
                >
                  Password doesn't match!
                </div>
              </div>

              <button
                type="submit"
                className="font-semibold tracking-wider mt-8 bg-primary-500 text-white px-4 py-3 rounded-md mx-auto hover:bg-primary-600 transition-colors w-1/2"
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
                {!loading && <span className="uppercase">sign up</span>}
              </button>

              <div className="mx-auto text-sm text-gray-900">
                Already have an account ?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-gray-950 hover:text-black"
                >
                  Log In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
