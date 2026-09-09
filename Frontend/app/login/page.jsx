// "use client"

// import axios from "axios";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { ThreeDots } from "react-loader-spinner";
// import { apiUrl } from "@/lib/api";
// export default function Login() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(false);
//   const login = (event) => {
//     event.preventDefault();
//     setLoading(true);
//     const formData = new FormData(event.target);
//     const formObject = {};
//     formData.forEach((value, key) => {
//       formObject[key] = value;
//     });

//     axios
//       .get(apiUrl(`/api/login?username=${formObject.username}&password=${formObject.password}`))
//       .then(function (response) {
//         if (response.data.success) {
//           localStorage.setItem("username", formObject.username);
//           localStorage.setItem("password", formObject.password);
//           router.push("/chat");
//         }
//         else {
//           setError(true);
//         }
//       })
//       .catch(function (error) {
//         console.log(error);
//       })
//       .finally(function () {
//         setLoading(false);
//       });
//   };
//   let inputClass = `bg-white mt-1 p-2 w-full border ${error ? "animate-wiggle border-red-500 focus:border-red-500" : "border-gray-200 focus:border-gray-400"}  rounded-md focus:outline-none text-[0.95rem] transition-colors py-3 px-4`;

//   return <>
//     <div className="from-primary-50 to-primary-300 bg-gradient-to-br flex items-center justify-center h-screen">
//       <div className="flex shadow-md sm:w-full md:w-96 lg:w-7/12 rounded-lg min-h-[70vh]">
//         <div className="bg-gradient-to-b from-primary-700/80  to-primary-300/80 w-4/12 rounded-l-lg flex flex-col justify-center items-center">
//           <div className=" w-full h-32 flex flex-col justify-center items-center">
//             <h3 className=" text-white text-xl">Step into</h3>
//             <h2 className="text-white text-4xl font-bold">PEER TALKS</h2>
//           </div>
//         </div>
//         <div className="bg-gray-50 p-8 rounded-r-lg w-2/3 flex flex-col justify-center">
//           <div className="ml-2 flex flex-col gap-y-1 items-center">
//             <h2 className="text-2xl font-bold pr-2 text-gray-700">Welcome Back !</h2>
//             <h3 className="text-gray-500 text-sm mb-5">Log In to continue</h3>
//           </div>
//           <form className="flex flex-col gap-y-3" onSubmit={login}>

//             <div className="relative flex flex-col gap-y-5 items-center">
//               <div className="w-7/12">
//                 <input type="text" id="username" name="username" className={inputClass} required placeholder="Username" onChange={() => setError(false)} />
//               </div>
//               <div className="w-7/12">
//                 <input type="password" id="password" name="password" className={inputClass} required placeholder="Password" onChange={() => setError(false)} />
//               </div>
//               <div className="absolute -bottom-7 mx-auto text-xs text-red-500 font-medium transition-opacity duration-200" style={{ opacity: error ? 1 : 0 }}>
//                 Username or Password is Incorrect!
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="font-semibold tracking-wider mt-8 bg-primary-500 text-white px-4 py-3 rounded-md mx-auto hover:bg-primary-600 transition-colors w-1/2"
//             >
//               <div className="w-full flex justify-center">

//                 <ThreeDots
//                   height={24}
//                   width={24}
//                   radius="2"
//                   color="hsl(278 100% 90%)"
//                   visible={loading}
//                 />
//               </div>
//               {!loading && <span className="uppercase">
//                 log in
//               </span>}
//             </button>

//             <div className="mx-auto text-sm text-gray-900">
//               New here ? <Link href="/register" className="font-semibold text-gray-950 hover:text-black">Sign Up</Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   </>
// }

"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { apiUrl } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const login = (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.target);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    axios
      .get(
        apiUrl(
          `/api/login?username=${formObject.username}&password=${formObject.password}`,
        ),
      )
      .then(function (response) {
        if (response.data.success) {
          localStorage.setItem("username", formObject.username);
          localStorage.setItem("password", formObject.password);
          router.push("/chat");
        } else {
          setError(true);
        }
      })
      .catch(function (error) {
        console.log(error);
        setError(true);
      })
      .finally(function () {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-300 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
          {/* LEFT: Brand panel */}
          <div className="hidden lg:flex flex-col justify-center items-center p-10 lg:p-14 bg-gradient-to-b from-primary-700 to-primary-500">
            <div className="text-center space-y-5">
              <p className="text-primary-200 text-xl font-medium tracking-wide">
                Step into
              </p>
              <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                PEER TALKS
              </h1>
              <div className="w-12 h-1 bg-white/40 rounded-full mx-auto" />
              <p className="text-primary-200 text-base max-w-xs leading-relaxed">
                Where meaningful conversations happen and real connections
                thrive
              </p>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            {/* Mobile brand header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-black text-primary-600">
                PEER TALKS
              </h1>
              <p className="text-primary-400 text-sm mt-1">
                Step into the conversation
              </p>
            </div>

            {/* Form header */}
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                Welcome Back
              </h2>
              <p className="text-gray-500 text-base">
                Log in to continue your conversations
              </p>
            </div>

            <form className="space-y-5" onSubmit={login}>
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  placeholder="Enter your username"
                  onChange={() => setError(false)}
                  className={`w-full px-4 py-3 rounded-lg text-base bg-gray-50 border-2 text-gray-800 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                    error
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  }`}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  onChange={() => setError(false)}
                  className={`w-full px-4 py-3 rounded-lg text-base bg-gray-50 border-2 text-gray-800 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                    error
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  }`}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    Username or password is incorrect. Please try again.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-base text-white transition-all duration-200 flex items-center justify-center min-h-12 mt-2 ${
                  loading
                    ? "bg-primary-300 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700 active:scale-98 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? (
                  <ThreeDots
                    height={20}
                    width={20}
                    radius="2"
                    color="#ffffff"
                    visible={true}
                  />
                ) : (
                  <span className="uppercase tracking-wider">Log In</span>
                )}
              </button>

              {/* Sign up link */}
              <p className="text-center text-sm text-gray-500 pt-1">
                New here?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary-600 hover:text-primary-800 transition-colors duration-200"
                >
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
