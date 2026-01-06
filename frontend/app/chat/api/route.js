import { authenticate, urltoParams } from '@/lib/utils';
import executeQuery from '../../../lib/db'

export async function GET(req, res) {
    const {username, password} = urltoParams(req.url);
    if(!authenticate(username, password)){
        return Response.json({success: false});
    }

    const users = await executeQuery({
        query: `SELECT * FROM USERS U JOIN CONTACT C ON U.USERNAME = C.CONTACTNAME AND C.USERNAME = "${username}"`
    });
    return Response.json({ users })
}