import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Landing from "../pages/Landing";
import ExplorePGs from "../pages/ExplorePGs";
import AddPG from "../pages/AddPG";
import PGDetails from "../pages/PGDetails";
import Signup from "../pages/signup";
import Login from "../pages/Login";
import OwnerDashboard from "../pages/OwnerDashboard";
import Admin from "../pages/Admin";
import ScrollToTop from "../pages/ScrollToTop";
import ChatWidget from "../components/ChatWidget";
import "./index.css";

function App() {
  const location = useLocation();
  const hideNavbarExactPaths = ["/signup", "/login", "/add-pg", "/owner-dashboard"];
  const shouldShowNavbar =
    !hideNavbarExactPaths.includes(location.pathname) &&
    !location.pathname.startsWith("/pg/") &&
    !location.pathname.startsWith("/edit-pg/");
  const hideChat = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <ScrollToTop />
      {shouldShowNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<ExplorePGs />} />
          <Route path="/add-pg" element={<AddPG />} />
          <Route path="/edit-pg/:id" element={<AddPG />} />
          <Route path="/pg/:id" element={<PGDetails />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="*"
            element={
              <div className="text-center text-black mt-20 text-xl">
                Page not found
                <img src="/p3.svg" alt="Page not found" />
              </div>
            }
          />
        </Routes>
      </main>
      {!hideChat && <ChatWidget />}
    </div>
  );
}

export default App;