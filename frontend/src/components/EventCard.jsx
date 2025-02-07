import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backendUrl = "http://localhost:5000"; // Change this to your actual backend URL

const formatDateTime = (dateString, timeString) => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // Format date as DD/MM/YYYY
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

  // Convert time to 12-hour format with AM/PM
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const min = parseInt(minutes, 10);

  if (isNaN(hour) || isNaN(min)) {
    return "Invalid time";
  }

  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format

  const formattedTime = `${formattedHour}:${min.toString().padStart(2, '0')} ${ampm}`;

  return `${formattedDate} at ${formattedTime}`;
};

const EventCard = ({ event, isPast, onClick }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isOwner = user && user._id === event.createdBy;
  const [attendees, setAttendees] = useState(event.attendeesCount);
  const [joined, setJoined] = useState(event.attendees.includes(user?._id));

  const handleJoinEvent = async () => {
    if (!user) return toast.warn("Please log in to join the event");

    setAttendees((prev) => prev + 1);
    setJoined(true);
  };

  return (
    <div
      className={`p-4 border rounded-lg mb-2 cursor-pointer ${
        isPast ? "bg-gray-800 opacity-60 pointer-events-none" : "bg-gray-700"
      }`}
      onClick={() => !isPast && onClick(event)}
    >
      <img
        src={
          event.image
            ? `${backendUrl}/${event.image.replace(/\\/g, "/")}`
            : "/assets/default.png"
        }
        alt={event.title}
        className="w-full h-50 object-cover rounded-lg"
      />
      <h3 className="text-xl font-bold mt-2 break-words overflow-hidden whitespace-normal">{event.title}</h3>
      <p className="text-gray-500">{formatDateTime(event.date, event.time)}</p>
      <p className="text-gray-500">📍 {event.location}</p>
      <p className="text-gray-500">Attendees: {attendees}</p>

      {!isPast && (
        <div className="flex justify-end">
          {isOwner ? (
            <>
              <button className="mt-2 mr-4 p-2 bg-blue-600 rounded text-white">
                Edit
              </button>
              <button className="mt-2 p-2 bg-red-600 rounded text-white">
                Delete
              </button>
            </>
          ) : (
            <button
              className={`mt-2 p-2 rounded text-white ${
                joined ? "bg-gray-600 cursor-not-allowed" : "bg-green-600"
              }`}
              onClick={handleJoinEvent}
              disabled={joined}
            >
              {joined ? "Joined" : "Join"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;
