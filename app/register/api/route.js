import executeQuery from '../../../lib/db'

export async function POST(req, res) {

    const body = await req.json();

    const response = await executeQuery({
        query: `INSERT INTO USERS (username, password, regDate ) 
        VALUES(
            "${body.username}",
            "${body.password}",
            curdate()
            )`
    });
    
    if(!response.error){
        response.username = body.username;
        response.password = body.password;
        return Response.json(response);
    }
    console.log(response);

    return Response.json(response)
}