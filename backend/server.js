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
app.use("/api/events", (req, res, next) => {
  req.io = io; // Pass io instance to controllers
  next();
}, eventRoutes);

io.use(authenticateSocket);
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("join_event", (eventId) => {
    socket.join(eventId);
    console.log(`User joined event room: ${eventId}`);
  });

//   socket.on("join_event", (eventId) => {
//   // Update the event's attendees count in the database
//   const updatedEvent = updateEventAttendees(eventId);

//   // Broadcast the update to all clients
//   socket.broadcast.emit("attendee_joined", {
//     eventId: updatedEvent._id,
//     attendeesCount: updatedEvent.attendeesCount
//   });
// });


  socket.on("create_event", async (eventData) => {
    try {
      const event = await Event.create(eventData);
      io.emit("new_event", event); // Broadcast new event to all clients
    } catch (error) {
      console.error("Error creating event:", error);
    }
  });

  // Update an event
  socket.on("update_event", async (eventData) => {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(eventData._id, eventData, {
        new: true,
        runValidators: true,
      });

      if (updatedEvent) {
        io.to(updatedEvent._id.toString()).emit("event_updated", updatedEvent);
      } else {
        console.log("Event not found");
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  });

  // Delete an event
  socket.on("delete_event", async (eventId) => {
    try {
      const event = await Event.findById(eventId);

      if (event) {
        await event.deleteOne();
        io.emit("event_deleted", eventId); // Notify all clients that the event is deleted
      } else {
        console.log("Event not found");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
