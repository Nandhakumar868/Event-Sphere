const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const { authenticateSocket } = require("./middlewares/authMiddleware");
const path = require("path");
const Event = require("./models/Event"); // Import Event model

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use(
  "/api/events",
  (req, res, next) => {
    req.io = io; // Pass io instance to controllers
    next();
  },
  eventRoutes
);

io.use(authenticateSocket);
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}, User: ${socket.user.name}`);

  socket.on("create_event", async (eventData) => {
    try {
      if (eventData._id) {
        delete eventData._id; // Ensure no duplicate key error
      }

      const event = await Event.create(eventData);
      io.emit("new_event", event); // Broadcast to all clients
    } catch (error) {
      console.error("Error creating event:", error);
    }
  });

  socket.on("join_event", (eventId) => {
    if (!eventId) {
      console.log("Invalid event ID");
      return;
    }
    socket.join(eventId);
    console.log(`User joined event room: ${eventId}`);
  });

  // Update an event
  socket.on("update_event", async (eventData, callback) => {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(
        eventData._id,
        eventData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (updatedEvent) {
        console.log("Event updated successfully:");
      } else {
        console.log("Event not found");
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
