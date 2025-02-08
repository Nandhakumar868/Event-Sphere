const Event = require("../models/Event");
const multer = require("multer");
const path = require("path");

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be stored in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage });

// Create a new event (requires authentication)
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, tags } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const image = req.file ? req.file.path : null; // Get the file path

    // Ensure tags are stored as an array
    const tagsArray = Array.isArray(tags)
      ? tags
      : tags.split(",").map((tag) => tag.trim());

    // Remove _id from the request body if it exists
    if (req.body._id) {
      delete req.body._id;
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      tags: tagsArray,
      image,
      createdBy: req.user.id,
      attendees: [],
      attendeesCount: 0,
    });

    req.io.emit("new_event", event); // Emit the event to all clients

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Event creation failed",
      error: error.message,
    });
  }
};



// Get all events (Public access)
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single event by ID (Public access)
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the user is already an attendee
    if (event.attendees.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: "You have already joined this event" });
    }

    // Add user to attendees list and increase count
    event.attendees.push(req.user.id);
    event.attendeesCount = event.attendees.length;

    await event.save();

    // Emit to all connected clients (including sender)
    // req.io.emit("attendee_joined", { 
    //   eventId: req.params.id, 
    //   attendeesCount: event.attendeesCount 
    // });

     req.io.to(req.params.id).emit("attendee_joined", { eventId: req.params.id, attendeesCount: event.attendeesCount });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error", result: req.params });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Prepare update object
    const updateData = { ...req.body };

    // Ensure tags are stored as an array
    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags)
        ? updateData.tags
        : updateData.tags.split(",").map(tag => tag.trim());
    }

    // Handle image update
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Find and update event in one step
    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
      new: true, // Returns the updated document
      runValidators: true, // Ensures validation rules are applied
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    req.io.emit("event_updated", updatedEvent); // Emit event update

    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Delete an event (Only event creator can delete)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await event.deleteOne();

    // Emit the "event_deleted" event to all clients
    req.io.emit("event_deleted", req.params.id);

    res.json({ message: "Event removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  upload,
  createEvent,
  getEvents,
  getEvent,
  joinEvent,
  updateEvent,
  deleteEvent,
};
