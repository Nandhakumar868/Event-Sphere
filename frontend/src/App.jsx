import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AuthProvider from "./context/AuthProvider";
import { ToastContainer } from "react-toastify";
import EventList from "./pages/EventList";
import { Provider } from "react-redux";
import store from "./redux/store";

// Helper function to check if the user is logged in
const isAuthenticated = () => {
  const user = localStorage.getItem("user");
  return user ? true : false;
};

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Redirect root path to login if not logged in, otherwise to dashboard */}
            <Route
              path="/"
              element={
                <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />
              }
            />

            {/* Redirect logged-in users away from login & register pages */}
            <Route
              path="/login"
              element={
                isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated() ? <Navigate to="/dashboard" /> : <Register />
              }
            />

            {/* Protected dashboard route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/event-list" element={<EventList />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
