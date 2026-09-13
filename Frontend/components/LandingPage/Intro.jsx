// "use client"
// import axios from "axios";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import intro from "public/image/homebg.png";
// import logo from "public/image/logo.png";
// import { useEffect } from "react";
// export default function Intro() {
//   const router = useRouter();
//   useEffect(() => {
//     const username = localStorage.getItem("username");
//     const password = localStorage.getItem("password");
//     axios
//       .get(`/login/api?username=${username}&password=${password}`)
//       .then(function (response) {
//         if (response.data.success) {
//           router.push("/chat");
//         }
//       })
//       .catch(function (error) {
//         console.log(error);
//       })

//   }, [])

//   return (
//     <>
//       <div className="h-screen w-full relative overflow-hidden">
//         <div className="bg-gradient-to-b from-primary-50 to-primary-100 h-full w-full scale-[4] -translate-y-[70rem] flex rounded-b-full inset-0 absolute -z-10" />
//         <div className="h-full w-full flex">
//           <div className="mt-32 ml-32 font-bold text-6xl text-primary-700 w-1/2">
//             <Image className="w-96" src={logo} alt="Peer Talks" />
//             <p className="flex font-fancy flex-col font-medium gap-y-3 mt-8 text-3xl text-primary-500">
//               <span>
//                 Where minds <span className="uppercase text-primary-900 font-bold">meet</span>,
//               </span>
//               <span>
//                 Ideas <span className="uppercase text-primary-900 font-bold">greet</span> and
//               </span>
//               <span>
//                 Conversations take the <span className="uppercase text-primary-900 font-bold">lead</span>
//               </span>
//             </p>
//             <div className="my-10 flex gap-x-5 ml-12">
//               <button className="text-primary-500 uppercase tracking-wider border-2 border-solid border-primary-600 hover:bg-primary-600 hover:text-white transition-colors duration-200 font-medium text-lg py-2 px-6 rounded-md">
//                 <Link href="/login">
//                   Login
//                 </Link>
//               </button>
//               <button className="text-primary-500 uppercase tracking-wider border-2 border-solid border-primary-600 hover:bg-primary-600 hover:text-white transition-colors duration-200 font-medium text-lg py-1 px-4 rounded-md">
//                 <Link href="/register">
//                   Sign Up
//                 </Link>
//               </button>
//             </div>
//           </div>
//           <div className="w-[30rem] relative pr-20">
//             <Image src={intro} className="mt-28" />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import intro from "public/image/homebg.png";
import logo from "public/image/logo.png";
import { useEffect } from "react";

import { apiUrl } from "@/lib/api";

export default function Intro() {
  const router = useRouter();
  useEffect(() => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    axios
      .post(apiUrl("/api/login"), { username, password })
      .then(function (response) {
        if (response.data.success) {
          router.push("/chat");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  return (
    <div className="min-h-screen w-full bg-primary-50 overflow-hidden relative">
      {/* Subtle background accent blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-60 -z-0 pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30 -z-0 pointer-events-none" />

      {/* Asymmetric split: 60% left text, 40% right visual */}
      <div className="relative z-10 h-screen flex flex-col lg:flex-row items-center justify-between px-6 sm:px-10 lg:px-16">
        {/* LEFT: Text content */}
        <div className="w-full lg:w-3/5 flex flex-col justify-center pt-16 lg:pt-0">
          {/* Logo */}
          <div className="mb-8 lg:mb-10">
            <Image
              src={logo}
              alt="Peer Talks"
              className="w-64 sm:w-72 lg:w-80 h-auto"
              priority
            />
          </div>

          {/* Headline */}
          <div className="mb-10 lg:mb-14">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-primary-900">
              <span className="block">
                Where minds{" "}
                <span className="text-primary-600 font-black uppercase">
                  meet
                </span>
                ,
              </span>
              <span className="block">
                Ideas{" "}
                <span className="text-primary-600 font-black uppercase">
                  greet
                </span>{" "}
                and
              </span>
              <span className="block">
                Conversations take the{" "}
                <span className="text-primary-600 font-black uppercase">
                  lead
                </span>
              </span>
            </h1>

            <p className="mt-6 text-lg text-primary-700 max-w-md leading-relaxed">
              Connect with peers, share ideas, and build meaningful
              conversations in one place.
            </p>
          </div>

          {/* CTA: One primary, one text link */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Link href="/register">
              <button className="px-8 py-4 bg-primary-600 text-white font-semibold text-lg rounded-lg hover:bg-primary-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto">
                Get Started
              </button>
            </Link>
            <Link
              href="/login"
              className="text-primary-600 font-semibold text-lg hover:text-primary-800 transition-colors duration-200 border-b-2 border-primary-400 hover:border-primary-700 pb-0.5"
            >
              Already a member? Log in
            </Link>
          </div>
        </div>

        {/* RIGHT: Illustration — desktop only */}
        <div className="hidden lg:flex w-2/5 justify-end items-center pr-4">
          <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-primary-100">
            <Image
              src={intro}
              alt="Peer connection illustration"
              className="w-full h-auto rounded-2xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* Mobile illustration — shown below hero text */}
      <div className="lg:hidden w-full px-6 pb-12">
        <div className="bg-white/70 rounded-2xl shadow-lg overflow-hidden border border-primary-100">
          <Image
            src={intro}
            alt="Peer connection illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
