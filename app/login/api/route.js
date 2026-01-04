import executeQuery from '../../../lib/db'
import { urltoParams } from '../../../lib/utils'

export async function GET(req, res) {

    const {username, password} = urltoParams(req.url)

    const response = await executeQuery({
        query: `SELECT * FROM USERS WHERE username = "${username}"`
    });
    
    if(response && response.length > 0 && response[0].password == password){
        return Response.json({success : true})
    }
    else{
        return Response.json({success : false})
    }
}