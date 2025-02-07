import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

// Connect and listen to Socket.IO events
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

// Listen for real-time updates
socket.on("eventCreated", (event) => {
  console.log("New event created:", event);
});

socket.on("eventUpdated", (event) => {
  console.log("Event updated:", event);
});

socket.on("eventJoined", (eventId) => {
  console.log(`User joined event: ${eventId}`);
});

socket.on("eventDeleted", (eventId) => {
  console.log(`User deleted event: ${eventId}`);
});

export const fetchEvents = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/events/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch events");
    }

    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
};

export const createEvent = async (eventData, token) => {
  try {
    const response = await fetch("http://localhost:5000/api/events/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Requires authentication
      },
      body: eventData, // Send FormData directly
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create event");
    }

    const newEvent = await response.json()

    // Emit the event to notify others
    socket.emit("createEvent", newEvent);

    return newEvent
  } catch (error) {
    return { error: error.message };
  }
};

export const joinEvent = async (id, token) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/events/${id}/join`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Requires authentication
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to join event");
    }

    const joinedEvent = await response.json();

    // Emit the event to notify others
    socket.emit("joinEvent", id);

    return joinedEvent
  } catch (error) {
    return { error: error.message };
  }
};

export const updateEvent = async (id, eventData, token) => {
  try {
    const response = await fetch(`http://localhost:5000/api/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Requires authentication
      },
      body: JSON.stringify(eventData),
    });


    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update event");
    }

    const updatedEvent = await response.json();

    // Emit the event to notify others
    socket.emit("updateEvent", updatedEvent);

    return updatedEvent
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteEvent = async (id, token) => {
  try {
    const response = await fetch(`http://localhost:5000/api/events/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Requires authentication
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete event");
    }

    const deletedEvent = await response.json();

    //Optionally, you could emit a "deleteEvent" message if needed.
    socket.emit("deleteEvent", id);

    return deletedEvent
  } catch (error) {
    return { error: error.message };
  }
};
