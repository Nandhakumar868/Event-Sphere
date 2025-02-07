import { useState } from "react";
import { createEvent } from "../api/events";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EventForm = ({ token }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    tags: "",
    image: null, // Image is optional now
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.location) newErrors.location = "Location is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const eventData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "tags") {
        eventData.append(key, formData[key].join(","));
      } else if (key === "image" && formData[key]) {
        eventData.append(key, formData[key]); // Append image only if selected
      } else if (key !== "image") {
        eventData.append(key, formData[key]);
      }
    });

    const result = await createEvent(eventData, token);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Event created successfully!");

      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        tags: "",
        image: null,
      });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg">
      <input
        type="text"
        placeholder="Event Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="border p-2 w-full"
      />
      {errors.title && <p className="text-red-500">{errors.title}</p>}

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        className="border p-2 w-full mt-2"
      />
      {errors.description && (
        <p className="text-red-500">{errors.description}</p>
      )}

      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="border p-2 w-full mt-2"
      />
      {errors.date && <p className="text-red-500">{errors.date}</p>}

      <input
        type="time"
        value={formData.time}
        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
        className="border p-2 w-full mt-2"
      />
      {errors.time && <p className="text-red-500">{errors.time}</p>}

      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="border p-2 w-full mt-2"
      />
      {errors.location && <p className="text-red-500">{errors.location}</p>}

      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={formData.tags}
        onChange={(e) =>
          setFormData({ ...formData, tags: e.target.value.split(",") })
        }
        className="border p-2 w-full mt-2"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
        className="border p-2 w-full mt-2"
      />

      <button type="submit" className="bg-blue-600 text-white p-2 mt-2 w-full">
        Create Event
      </button>
    </form>
  );
};

export default EventForm;
