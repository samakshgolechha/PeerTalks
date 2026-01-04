const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send-message", (data) => {
      // data = { chatId, message, sender }
      io.to(data.chatId).emit("receive-message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  httpServer.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});
