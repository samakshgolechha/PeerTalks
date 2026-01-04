import Image from "next/image";
import nextImage from "public/image/second.jpg";
export default function Desc(){
    return (
        <>
        <div className="my-20 flex flex-row">
            {/* <div className="w-[30rem] relative ml-12 p-10"> */}
            <div className="w-1/2 relative ml-12 p-10">
            <Image src={nextImage} className="rounded-md" />
            </div>
            <div className="w-1/2 flex items-center pr-10">
                <h1 className="font-fancy tracking-wide py-16 font-semibold text-2xl text-primary-500 text-left">
                "Welcome to Peer Talks, where vibrant connections happen in an instant! Join our diverse community to share thoughts, collaborate on projects, and build lasting relationships. With an intuitive interface and a host of features, Peer Talks is your go-to platform for fostering meaningful conversations. Join us on this journey of discovery and elevate your connection experience with Peer Talks."
                </h1>
            </div>
        </div>
        </>
    );
    
}