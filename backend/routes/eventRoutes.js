const express = require("express");
const {
  upload,
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  joinEvent, // Added joinEvent controller function
} = require("../controllers/eventController");
const { protect } = require("../middlewares/authMiddleware"); // Ensure authentication middleware

const router = express.Router();

// Route to create an event with image upload (Only authenticated users)
router.post("/", protect, upload.single("image"), createEvent);

// Get all events (Public access)
router.get("/", getEvents);

// Get a single event by ID (Public access)
router.get("/:id", getEvent);

// Route for a user to join an event (Any authenticated user can join)
router.put("/:id/join", protect, joinEvent);

// Update event (Only the creator can update event details)
router.put("/:id", protect, upload.single("image"), updateEvent);

// Delete event (Only the creator can delete)
router.delete("/:id", protect, deleteEvent);

module.exports = router;
