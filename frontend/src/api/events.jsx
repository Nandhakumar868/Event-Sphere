import socket from "../../socket";

const backendUrl = import.meta.env.VITE_API_URL;

// Connect and listen to Socket.IO events
socket.on("connect", () => {
  console.log("Connected to Socket.IO server", socket.id);
});

// Listen for real-time updates
socket.on("new_event", (event) => {
  console.log("New event created:", event);
});

socket.on("event_updated", (event) => {
  console.log("Event updated:", event);
});

socket.on("attendee_joined", (event) => {
  console.log("User joined event:", event);
});

socket.on("event_deleted", (eventId) => {
  console.log(`User deleted event: ${eventId}`);
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

// Fetch all events
export const fetchEvents = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/events/`, {
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
    console.error("Error fetching events:", error);
    return { error: error.message };
  }
};

// Create a new event
export const createEvent = async (eventData, token) => {
  try {
    const response = await fetch(`${backendUrl}/api/events/`, {
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

    return await response.json();
  } catch (error) {
    console.error("Error creating event:", error);
    return { error: error.message };
  }
};

// Join and event
export const joinEvent = async (id, token) => {
  try {
    const response = await fetch(`${backendUrl}/api/events/${id}/join`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Requires authentication
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to join event");
    }

    const joinedEvent = await response.json();

    // Emit the event to notify others
    socket.emit("join_event", id);

    return joinedEvent;
  } catch (error) {
    console.error("Error joining event:", error);
    return { error: error.message };
  }
};

// Update an event
export const updateEvent = async (id, eventData, token) => {
  try {
    const response = await fetch(`${backendUrl}/api/events/${id}`, {
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

    return await response.json();
  } catch (error) {
    console.error("Error updating event:", error);
    return { error: error.message };
  }
};

// Delete an event
export const deleteEvent = async (id, token) => {
  try {
    const response = await fetch(`${backendUrl}/api/events/${id}`, {
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

    return await response.json();
  } catch (error) {
    console.error("Error deleting event:", error);
    return { error: error.message };
  }
};
