import { useContext, useEffect, useState } from "react";
import { fetchEvents } from "../api/events";
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";
import EventDetails from "./EventDetails";
import { AuthContext } from "../context/AuthProvider";
import socket from "../../socket";

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const getEvents = async () => {
      const data = await fetchEvents();
      setEvents(Array.isArray(data) ? data : []);
      filterEvents(data, "", "", "", "", []);
    };

    getEvents();

    socket.on("new_event", (newEvent) => {
      console.log("New event received:", newEvent);
      setEvents((prevEvents) => {
        const eventExists = prevEvents.find(
          (event) => event._id === newEvent._id
        );
        if (eventExists) return prevEvents;
        const updatedEvents = [...prevEvents, newEvent];
        return updatedEvents;
      });
    });

    socket.on("attendee_joined", ({ eventId, attendeesCount }) => {
      console.log(
        `Event ${eventId} updated with new attendee count: ${attendeesCount}`
      );

      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((event) => {
          if (event._id === eventId) {
            // Ensure a new object is created to trigger a state update
            return { ...event, attendeesCount: attendeesCount };
          }
          return event;
        });

        return [...updatedEvents]; // Return a fresh array reference
      });
    });

    socket.on("event_updated", (updatedEvent) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === updatedEvent._id ? updatedEvent : event
        )
      );
    });

    socket.on("event_deleted", (deletedEventId) => {
      console.log(`Event deleted: ${deletedEventId}`);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== deletedEventId)
      );
    });

    return () => {
      console.log("Removing socket listeners for Dashboard");
      socket.off("new_event");
      socket.off("attendee_joined");
      socket.off("event_updated");
      socket.off("event_deleted");
    };
  }, []); // Empty dependency array ensures it's only set once.

  useEffect(() => {
    filterEvents(events, startDate, startTime, endDate, endTime, selectedTags);
  }, [events, startDate, startTime, endDate, endTime, selectedTags]);

  const filterEvents = (
    eventList,
    sDate,
    sTime,
    eDate,
    eTime,
    selectedTags = []
  ) => {
    const currentDateTime = new Date();
    let filteredEvents = eventList;

    const startDateTime = sDate
      ? new Date(`${sDate}T${sTime || "00:00"}:00`)
      : null;
    const endDateTime = eDate
      ? new Date(`${eDate}T${eTime || "23:59"}:00`)
      : null;

    filteredEvents = filteredEvents.filter((event) => {
      const eventDateTime = new Date(event.date);

      // Normalize tags for comparison
      const eventTags = (Array.isArray(event.tags) ? event.tags : []).map(
        (tag) => tag.toLowerCase()
      );
      const normalizedSelectedTags = selectedTags.map((tag) =>
        tag.toLowerCase()
      );

      // Check date range
      const isWithinDateRange =
        (!startDateTime || eventDateTime >= startDateTime) &&
        (!endDateTime || eventDateTime <= endDateTime);

      // Check if event has at least one matching tag
      const hasMatchingTag =
        normalizedSelectedTags.length === 0 ||
        eventTags.some((tag) => normalizedSelectedTags.includes(tag));

      return isWithinDateRange && hasMatchingTag;
    });

    setUpcomingEvents(
      filteredEvents.filter((event) => new Date(event.date) > currentDateTime)
    );
    setPastEvents(
      filteredEvents.filter((event) => new Date(event.date) <= currentDateTime)
    );
  };

  const handleFilterChange = () => {
    filterEvents(events, startDate, startTime, endDate, endTime, selectedTags);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setSelectedTags([]);
  };

  const toggleTag = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const availableTags = ["Startups", "Networking", "Art", "Technology"];

  return (
    <div className="p-4 bg-gray-800 bg-opacity-30 text-white min-h-screen">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowEventForm(true)}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md font-semibold cursor-pointer"
        >
          Create Event
        </button>
        <button
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer ml-6"
          onClick={() => setShowFilter(true)}
        >
          Filter
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
      {upcomingEvents.length === 0 ? (
        <p>No upcoming events</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isPast={false}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mt-8 mb-4">Past Events</h2>
      {pastEvents.length === 0 ? (
        <p>No past events</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pastEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isPast={true}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      )}

      {showFilter && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg w-11/12 md:w-2/3 lg:w-1/3">
            <h2 className="text-xl font-bold mb-4">Filter Events</h2>
            <input
              type="date"
              className="w-full p-2 text-black rounded-md mb-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="w-full p-2 text-black rounded-md mb-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <input
              type="time"
              className="w-full p-2 text-black rounded-md mb-2"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <input
              type="time"
              className="w-full p-2 text-black rounded-md mb-4"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />

            <h3 className="text-lg font-bold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  className={`px-3 py-1 rounded-md border ${
                    selectedTags.includes(tag) ? "bg-blue-500" : "bg-gray-600"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <button
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded w-full mb-2"
              onClick={handleFilterChange}
            >
              Apply Filters
            </button>
            <button
              className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded w-full mb-2"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
            <button
              className="mt-4 p-2 bg-red-600 hover:bg-red-700 text-white rounded w-full"
              onClick={() => setShowFilter(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showEventForm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create Event</h2>
            <EventForm token={token} />
            <button
              onClick={() => setShowEventForm(false)}
              className="bg-red-500 hover:bg-red-600 text-white p-2 w-full mt-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-lg w-11/12 md:w-2/3 lg:w-1/2">
            <button
              className="absolute top-4 right-4 text-xl cursor-pointer"
              onClick={() => setSelectedEvent(null)}
            >
              ✖
            </button>
            <EventDetails
              event={events.find((e) => e._id === selectedEvent?._id)}
              onDelete={(eventId) => {
                setUpcomingEvents((prev) =>
                  prev.filter((event) => event._id !== eventId)
                );
                setPastEvents((prev) =>
                  prev.filter((event) => event._id !== eventId)
                );
                setSelectedEvent(null);
              }}
              onUpdate={(updatedEvent) => {
                setUpcomingEvents((prev) =>
                  prev.map((event) =>
                    event._id === updatedEvent._id ? updatedEvent : event
                  )
                );
                setPastEvents((prev) =>
                  prev.map((event) =>
                    event._id === updatedEvent._id ? updatedEvent : event
                  )
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
