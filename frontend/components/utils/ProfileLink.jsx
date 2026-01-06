import { useRouter } from "next/navigation"


export default function ProfileLink({ fname, lname, username, className }) {
    const router = useRouter();
    return <span className={className + " cursor-pointer hover:underline"}
        onClick={() => router.push(`/profile/${username}`)}
    >
        <span>
            {fname}
        </span>
        {" "}
        <span>
            {lname}
        </span>
    </span>
}