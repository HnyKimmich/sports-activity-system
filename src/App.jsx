import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Nav from "./pages/Nav";
import ActivityApply from './pages/ActivityApply';
import Profile from './pages/Profile';
import ActivityDetail from './pages/ActivityDetail';
import MyActivities from './pages/MyActivities';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/nav" element={<Nav />} />
        <Route path="/apply" element={<ActivityApply />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/my-activities" element={<MyActivities />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;