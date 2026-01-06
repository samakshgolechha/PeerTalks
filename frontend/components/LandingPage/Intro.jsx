"use client"
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import intro from "public/image/homebg.png";
import logo from "public/image/logo.png";
import { useEffect } from "react";
export default function Intro() {
  const router = useRouter();
  useEffect(() => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    axios
      .get(`/login/api?username=${username}&password=${password}`)
      .then(function (response) {
        if (response.data.success) {
          router.push("/chat");
        }
      })
      .catch(function (error) {
        console.log(error);
      })

  }, [])

  return (
    <>
      <div className="h-screen w-full relative overflow-hidden">
        <div className="bg-gradient-to-b from-primary-50 to-primary-100 h-full w-full scale-[4] -translate-y-[70rem] flex rounded-b-full inset-0 absolute -z-10" />
        <div className="h-full w-full flex">
          <div className="mt-32 ml-32 font-bold text-6xl text-primary-700 w-1/2">
            <Image className="w-96" src={logo} alt="Peer Talks" />
            <p className="flex font-fancy flex-col font-medium gap-y-3 mt-8 text-3xl text-primary-500">
              <span>
                Where minds <span className="uppercase text-primary-900 font-bold">meet</span>,
              </span>
              <span>
                Ideas <span className="uppercase text-primary-900 font-bold">greet</span> and
              </span>
              <span>
                Conversations take the <span className="uppercase text-primary-900 font-bold">lead</span>
              </span>
            </p>
            <div className="my-10 flex gap-x-5 ml-12">
              <button className="text-primary-500 uppercase tracking-wider border-2 border-solid border-primary-600 hover:bg-primary-600 hover:text-white transition-colors duration-200 font-medium text-lg py-2 px-6 rounded-md">
                <Link href="/login">
                  Login
                </Link>
              </button>
              <button className="text-primary-500 uppercase tracking-wider border-2 border-solid border-primary-600 hover:bg-primary-600 hover:text-white transition-colors duration-200 font-medium text-lg py-1 px-4 rounded-md">
                <Link href="/register">
                  Sign Up
                </Link>
              </button>
            </div>
          </div>
          <div className="w-[30rem] relative pr-20">
            <Image src={intro} className="mt-28" />
          </div>
        </div>
      </div>
    </>
  );
}
