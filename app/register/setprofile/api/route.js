import executeQuery from '@/lib/db'

export async function POST(req, res) {

    const body = await req.json();

    const response = await executeQuery({
        query: `UPDATE USERS SET FNAME="${body.fname}",LNAME="${body.lname}",GENDER="${body.gender}",BIO="${body.bio}" ${body.dob?(', DOB=' +'"' +body.dob + '"') : ""} WHERE USERNAME="${body.username}"`
    });
    
    if(!response.error){
        response.username = body.username;
        response.password = body.password;
        return Response.json(response);
    }
    console.log(response);

    return Response.json(response)
}