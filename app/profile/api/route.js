import executeQuery from '../../../lib/db'
import { urltoParams } from '../../../lib/utils'

export async function GET(req, res) {
    const {username} = urltoParams(req.url)
    const users = await executeQuery({
        query: `SELECT * FROM USERS WHERE USERNAME ="${username}" LIMIT 1`
    });

    if(users.length == 0){
        return Response.json({});
    }

    return Response.json(users[0])
}