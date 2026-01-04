import ChatBox from "@/components/main/Chat/ChatBox";
import TopHeader from "@/components/main/Chat/TopHeader";

export default async function Messages({params}) {
    const {chatid} = params;

    return <>
        <TopHeader chatid = {chatid}/>
        <ChatBox chatid = {chatid}/>
    </>
       
}

