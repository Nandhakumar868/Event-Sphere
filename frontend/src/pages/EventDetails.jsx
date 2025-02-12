import { useState, useEffect } from "react";
import { joinEvent, deleteEvent, updateEvent } from "../api/events";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "../../socket";

const backendUrl = import.meta.env.VITE_API_URL;

const formatDateTime = (dateString, timeString) => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // Format date as DD/MM/YYYY
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;

  // Convert time to 12-hour format with AM/PM
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const min = parseInt(minutes, 10);

  if (isNaN(hour) || isNaN(min)) {
    return "Invalid time";
  }

  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format

  const formattedTime = `${formattedHour}:${min
    .toString()
    .padStart(2, "0")} ${ampm}`;

  return `${formattedDate} at ${formattedTime}`;
};

const EventDetails = ({ event, onDelete, onUpdate }) => {
  if (!event) return null;

  const user = JSON.parse(localStorage.getItem("user"));
  const isOwner = user && user._id === event.createdBy;
  const [attendees, setAttendees] = useState(event.attendeesCount);
  const [joined, setJoined] = useState(event.attendees.includes(user?._id));
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  useEffect(() => {
    if (!event || !event._id) return;

    const handleAttendeeJoined = ({ eventId, attendeesCount }) => {
      if (eventId === event._id) {
        setAttendees(attendeesCount);
      }
    };

    const handleEventUpdated = (updatedEvent) => {
      if (updatedEvent._id === event._id) {
        setEditedEvent(updatedEvent);
        setAttendees(updatedEvent.attendeesCount);
        onUpdate(updatedEvent);
      }
    };

    const handleEventDeleted = (deletedEventId) => {
      if (deletedEventId === event._id) {
        onDelete(deletedEventId);
      }
    };

    socket.on("attendee_joined", handleAttendeeJoined);
    socket.on("event_updated", handleEventUpdated);
    socket.on("event_deleted", handleEventDeleted);

    return () => {
      socket.off("attendee_joined", handleAttendeeJoined);
      socket.off("event_updated", handleEventUpdated);
      socket.off("event_deleted", handleEventDeleted);
    };
  }, [event, onUpdate, onDelete]);

  const handleJoinEvent = async () => {
    if (joined) return;

    const response = await joinEvent(event._id, user.token);
    if (!response.error) {
      setJoined(true);

      toast.success("You joined the event!");
    }
  };

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    const response = await deleteEvent(event._id, user.token);
    if (!response.error) {
      onDelete(event._id);
      //socket.emit("delete_event", event._id); // Notify backend
      toast.success("Event deleted successfully!");
    }
    setIsDeleting(false);
    setShowModal(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent({ ...editedEvent, [name]: value });
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    const response = await updateEvent(
      editedEvent._id,
      editedEvent,
      user.token
    );
    if (!response.error) {
      onUpdate(editedEvent);
      setIsEditing(false);
      toast.success("Event updated successfully!");
    }
  };

  const getRandomColor = (tag) => {
    const colors = [
      "#F87171", // Red
      "#FBBF24", // Yellow
      "#34D399", // Green
      "#60A5FA", // Blue
      "#A78BFA", // Purple
      "#F472B6", // Pink
      "#FACC15", // Amber
    ];
    const index = Math.abs(tag.charCodeAt(0) % colors.length); // Pick color based on the tag
    return colors[index];
  };

  return (
    <div className="text-white">
      {isEditing ? (
        <form onSubmit={handleUpdateEvent} className="bg-gray-800 p-4 rounded">
          <label className="text-gray-400">Title</label>
          <input
            type="text"
            name="title"
            value={editedEvent.title}
            onChange={handleEditChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <label className="text-gray-400 mt-2">Description</label>
          <textarea
            name="description"
            value={editedEvent.description}
            onChange={handleEditChange}
            className="w-full p-2 rounded bg-gray-700 text-white mt-2"
          />
          <label className="text-gray-400 mt-2">Location</label>
          <input
            type="text"
            name="location"
            value={editedEvent.location}
            onChange={handleEditChange}
            className="w-full p-2 rounded bg-gray-700 text-white mt-2"
          />
          <label className="text-gray-400 mt-2">Date</label>
          <input
            type="date"
            name="date"
            value={editedEvent.date}
            onChange={handleEditChange}
            className="w-full p-2 rounded bg-gray-700 text-white mt-2"
          />
          <label className="text-gray-400 mt-2">Time</label>
          <input
            type="time"
            name="time"
            value={editedEvent.time}
            onChange={handleEditChange}
            className="w-full p-2 rounded bg-gray-700 text-white mt-2"
          />
          <label className="text-gray-400 mt-2">Tags</label>
          <input
            type="text"
            name="tags"
            value={editedEvent.tags}
            onChange={handleEditChange}
            className="w-full p-2 rounded bg-gray-700 text-white mt-2"
            placeholder="Comma-separated tags"
          />
          <label className="text-gray-400 mt-2">Image</label>
          <input
            type="file"
            name="image"
            onChange={(e) =>
              setEditedEvent({ ...editedEvent, image: e.target.files[0] })
            }
            className="w-full p-2 rounded bg-gray-700 text-white mt-2"
          />
          <button type="submit" className="mt-2 p-2 bg-green-600 rounded cursor-pointer">
            Save Changes
          </button>
          <button
            type="button"
            className="mt-2 p-2 bg-gray-600 rounded ml-2 cursor-pointer"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          {event.image && (
            <img
              src={`${backendUrl}/${event.image.replace(/\\/g, "/")}`}
              alt={event.title}
              className="w-full h-60 object-cover rounded-lg"
            />
          )}
          <h2 className="text-xl font-bold mt-2 break-words overflow-hidden whitespace-normal">
            {event.title}
          </h2>
          <p className="text-gray-600 break-words overflow-hidden whitespace-normal my-2">
            {event.description}
          </p>
          <p className="text-gray-500">📍 {event.location}</p>
          <p className="text-gray-500 my-2">
            {formatDateTime(event.date, event.time)}
          </p>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-white text-sm font-medium`}
                style={{
                  backgroundColor: getRandomColor(tag), // Function to assign a random color
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-gray-500 mt-2">Attendees: {attendees}</p>
          {isOwner ? (
            <div className="mt-4 space-x-2">
              <button
                className="p-2 bg-blue-600 rounded text-white cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="p-2 bg-red-600 rounded text-white cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                Delete
              </button>
            </div>
          ) : (
            <button
              className={`mt-4 p-2 rounded text-white ${
                joined ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 cursor-pointer"
              }`}
              onClick={handleJoinEvent}
              disabled={joined}
            >
              {joined ? "Joined" : "Join"}
            </button>
          )}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-md">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-lg font-bold text-white">
                  Confirm Deletion
                </h3>
                <p className="text-gray-300 mt-2">
                  Are you sure you want to delete this event?
                </p>
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded"
                    onClick={handleDeleteEvent}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventDetails;
