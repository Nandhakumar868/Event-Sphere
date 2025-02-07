import { useState, useContext } from "react";
import { login } from "../api/auth";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await login(formData);
    if (result.error) {
      setError(result.error);
    } else {
      loginUser(result);
      navigate("/dashboard");
    }
  };

  const handleGuestLogin = () => {
    navigate("/event-list");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 shadow-lg rounded-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="border border-gray-600 bg-gray-700 text-white rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="border border-gray-600 bg-gray-700 text-white rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <button
          onClick={handleGuestLogin}
          className="w-full mt-3 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
        >
          Continue as Guest
        </button>

        <p className="text-gray-400 text-center mt-4">
          Don't have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer hover:text-blue-500"
            onClick={() => navigate("/register")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
