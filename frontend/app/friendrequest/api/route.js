import { urltoParams } from '@/lib/utils';
import executeQuery from '../../../lib/db'

export async function GET(req, res) {
    const { username } = urltoParams(req.url);
    const users = await executeQuery({
        query: `SELECT * FROM USERS WHERE USERNAME IN (
            SELECT SENDER FROM FRIENDREQUEST WHERE RECEIVER = "${username}"
        )`
    });

    return Response.json(users);
}

//accept invitation handle post req
export async function POST(req, res) {
    const body = await req.json();

    const sender = body.sender;
    const receiver = body.receiver;
    const accepted = body.accepted;
    
    const users = await executeQuery({
        query: `DELETE FROM FRIENDREQUEST WHERE
        (SENDER = "${sender}" AND RECEIVER = "${receiver}") OR
        (SENDER = "${receiver}" AND RECEIVER = "${sender}")
        `
    });

    if(users.error){
        console.log(error);
        return Response.json(users);
    }
    
    let msg = "";
    if (!accepted)
        msg = "declined Your Friend Request"
    else
        msg = "accepted Your Friend Request"

    await executeQuery({
        query: `INSERT INTO NOTIFICATIONS VALUES("${receiver}", "${sender}", "${msg}", now())`
    });

    // creating contact of sender and receiver if accepted
    if(accepted){
        const id = new Date().getTime();
        const chat_id = await executeQuery({
            query: `INSERT INTO CHATS VALUES(${id}, now())`
        });
        if(chat_id.error){
            console.log(chat_id);
            return Response.json(chat_id);
        }

        const chat = await executeQuery({
            query: `INSERT INTO CONTACT VALUES("${receiver}", "${sender}", ${id}),("${sender}", "${receiver}", ${id})`
        });

        if(!chat.error){
            console.log(chat);
        }
        chat.id = chat_id;
        return Response.json(chat);
    }

    return Response.json({success : true});
    
}