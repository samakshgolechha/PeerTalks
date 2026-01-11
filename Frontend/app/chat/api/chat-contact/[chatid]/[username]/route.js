export async function GET(req, { params }) {
    try {
        const { chatId, username } = params;
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        
        const response = await fetch(`${BACKEND_URL}/api/chat-contact/${chatId}/${username}`);
        const data = await response.json();
        
        return Response.json(data);
    } catch (error) {
        console.error('Error fetching chat contact:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}