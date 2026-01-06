import ChatList from "@/components/main/Chat/ChatList";

export default function Home({ children }) {
  return (
    <>
      <div className="border rounded lg:grid lg:grid-cols-4 min-h-full h-screen">
        <div className="border-r border-gray-200 lg:col-span-1">
            <div className="flex">
          <svg
            className="w-7 h-7 my-4 mx-2 stroke-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
          </svg>
          <h2 className="my-4 mb-2 text-lg font-semibold text-gray-600">
            Chats
          </h2>
              </div>
          <ChatList />
        </div>

        <div
          className=" lg:col-span-3 flex flex-col w-full h-full"
          style={{
            background: `url("/image/chatbg.jpg")`,
            backgroundColor: "hsl(278 100% 95%)",
            backgroundSize: "50%",
            backgroundBlendMode: "screen",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
