import EventCard from "../components/EventCard";
import { useState, useEffect } from "react";
import { fetchEvents } from "../api/events";

const EventList = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);

  useEffect(() => {
    const getEvents = async () => {
      const data = await fetchEvents();
      const currentDateTime = new Date();
      setUpcomingEvents(data.filter((event) => new Date(event.date) > currentDateTime));
      setPastEvents(data.filter((event) => new Date(event.date) < currentDateTime));
    };
    getEvents();
  }, []);

  return (
    <div className="p-4 bg-gray-800 bg-opacity-30 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
      {upcomingEvents.length === 0 ? (
        <p>No upcoming events</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {upcomingEvents.map((event) => (
            <EventCard key={event._id} event={event} isPast={false} />
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mt-8 mb-4">Past Events</h2>
      {pastEvents.length === 0 ? (
        <p>No past events</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pastEvents.map((event) => (
            <EventCard key={event._id} event={event} isPast={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
