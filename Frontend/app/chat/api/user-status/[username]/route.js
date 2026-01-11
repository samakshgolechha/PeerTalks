export async function GET(req, { params }) {
    try {
        const { username } = params;
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        
        const response = await fetch(`${BACKEND_URL}/api/user-status/${username}`);
        const data = await response.json();
        
        return Response.json(data);
    } catch (error) {
        console.error('Error fetching user status:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}