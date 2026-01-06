"use client"
import axios from "axios";
import { useState } from "react"
import Profilepic from "@/components/Profilepic";
import ProfileLink from "@/components/utils/ProfileLink";
import { toast } from "react-toastify";
export default function Search() {

    const filterUser = (username) => {
        console.log("connected to ", username);
        setUsers(users.filter((elem) => elem.username != username));
    }
    const [users, setUsers] = useState([]);
    const [found, setFound] = useState(false)
    const submit = (event) => {
        event.preventDefault();
        const search = event.target.search.value;
        axios.get(`search/api?search=${search}&username=${localStorage.getItem("username")}`)
            .then(function (response) {
                if (response.data.users.length == 0) {
                    setFound(true);
                }
                setUsers(response.data.users)
            }).catch(function (error) {
                console.log(error);
            })
    }
    return <div >
        <div className="mx-3 my-3">
            <div className=" text-gray-600">
                <form onSubmit={submit} onChange={() => setFound(false)} className="flex relative w-1/2 mx-auto">
                    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6 text-gray-300 absolute left-3 top-2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="search" name="search" className="block w-full py-2 pl-12 pr-3 bg-gray-100 focus:bg-slate-100 transition-colors rounded-full outline-none mx-auto" placeholder="Search" required />
                </form>
            </div>
        </div>

        {users.length > 0 ?
            <div className="p-4 w-full grid grid-cols-5 gap-x-5 gap-y-5">
                {
                    users.map((elem) => {
                        return <UserCard user={elem} key={elem.username} filterUser={filterUser} />
                    })
                }
            </div> :
            found ? <NotFound /> : <NoPeers />
        }

    </div>
}

function UserCard({ user, filterUser }) {

    const connect = (username) => {
        axios.post("/search/api", { contactuser: username, username: localStorage.getItem("username") })
            .then(function (response) {
                if (!response.error) {
                    toast.success("Request Sent!");
                    filterUser(username);
                }
            }).catch(
                function (error) {
                    console.log(error)
                }
            );
    }
    return <>
        <div className="min-w-[15rem] p-6 bg-white border border-gray-200 rounded-lg shadow">
            <div className="flex flex-col gap-y-3 items-center">
                <Profilepic gender={user.gender} className="h-20 w-20" />
                <h5 className="text-lg font-light text-gray-600 font-fancy">{"@" + user.username}</h5>
                <ProfileLink fname={user.fname} lname={user.lname} username={user.username} className="text-lg font-light text-gray-600 font-fancy" />
                <button onClick={() => connect(user.username)} className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 ">Connect</button>
            </div>
        </div>
    </>
}

function NoPeers() {
    return <div className="flex justify-center">
        <div className="text-gray-400">Looking for new Peers? Try searching by typing their usernames</div>
    </div>
}

function NotFound() {
    return <div className="flex justify-center">
        <div className="text-gray-400">No such new users exist. Try a different username</div>
    </div>
}