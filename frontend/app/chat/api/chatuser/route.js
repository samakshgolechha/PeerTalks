import executeQuery from '@/lib/db'
import { urltoParams } from '@/lib/utils';

export async function GET(req, res) {

    const {username,chatid} = urltoParams(req.url);

    const response = await executeQuery({
        query:`SELECT * FROM USERS WHERE USERNAME IN (SELECT CONTACTNAME FROM CONTACT WHERE CHAT_ID=${chatid} AND USERNAME="${username}")`
    })

    if(response.error) {
        return Response.json(response)
    }

    return Response.json(response[0])
}