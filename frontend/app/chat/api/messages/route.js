import executeQuery from '@/lib/db'
import { urltoParams } from '@/lib/utils';

export async function GET(req, res) {

    const {chatid, sender} = urltoParams(req.url);

    const response = await executeQuery({
        query:`SELECT *, IF(SENDER = "${sender}",true, false) as is_sender FROM MESSAGE WHERE CHAT_ID = ${chatid}`
    })

    if(response.error) {
        return Response.json(response)
    }

    return Response.json({ messages : response})
}


// to save sent message in database
export async function POST(req, res) {
    
    const body = await req.json();
    const message = body.message;
    const chatid = body.chatid;
    const sender = body.sender;

    const response = await executeQuery({
        query : `INSERT INTO MESSAGE VALUES(${chatid}, "${sender}","${message}",now(), false)`
    })

    if(response.error){
        return Response.json(res);
    }

    return Response.json(
        {
            is_sender: true,
            content: message
        }
    )
}