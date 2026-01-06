import { urltoParams } from '@/lib/utils';
import executeQuery from '../../../lib/db'

export async function GET(req, res) {
    const {username} = urltoParams(req.url);
    const notifications = await executeQuery({
        query: `SELECT * FROM NOTIFICATIONS N join USERS U ON N.SENDERUSER = U.USERNAME WHERE N.USERNAME = "${username}"`
    });

    return Response.json(notifications);
}
export async function DELETE(req, res) {
    const {username} = urltoParams(req.url);
    const notifications = await executeQuery({
        query: `DELETE FROM NOTIFICATIONS WHERE USERNAME = "${username}"`
    });

    return Response.json(notifications);
}