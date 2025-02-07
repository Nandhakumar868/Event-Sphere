export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error("API Request Failed");
  }

  return await response.json();
};
