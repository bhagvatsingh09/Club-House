import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './pages/user/UserLayout';
import StudentDashboard from './pages/user/StudentDashboard';
import Landingpage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ExploreClub from './pages/user/ExploreClub'
import MyEvents from './pages/user/MyEvents';
import Profile from './pages/user/Profile';
import CoordLayout from './pages/coordinator/CoordLayout';
import AnnounceEvent from './pages/coordinator/Announce';
import EventApprovals from './pages/coordinator/EventApprovals';
import MemberManagement from './pages/coordinator/MemberManagement';
import CoordDashboard from './pages/coordinator/CoordDashboard';
import GalleryManagement from './pages/coordinator/GalleryManagement';
import AdminLayout from './pages/admin/AdminLayout';
import ManageClubs from './pages/admin/ManageClub';
import AssignTasks from './pages/admin/AssignTasks';
import AdminDashboard from './pages/admin/AdminDashboard';
import GlobalGalleries from './pages/admin/GlobalGalleries';
import UserLogs from './pages/admin/UserLogs';
import StudentApprovals from "./pages/admin/StudentApprovals";
import AdminStudents from "./pages/admin/AdminStudents";


// Import other pages...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User / Student Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="/user/dashboard" />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="clubs" element={<ExploreClub />} />
          <Route path="events" element={<MyEvents />} />
          <Route path='profile' element={<Profile />} />
        </Route>

        {/* Coordinator Routes */}
        <Route path="/coord" element={<CoordLayout />}>
          <Route index element={<Navigate to="/coord/dashboard" />} />
          <Route path='dashboard' element={<CoordDashboard />} />
          <Route path="dashboard/student-approvals" element={<StudentApprovals />} />
          <Route path="announce" element={<AnnounceEvent />} />
          <Route path="approvals" element={<EventApprovals />} />
          <Route path="members" element={<MemberManagement />} />
          <Route path="gallery" element={<GalleryManagement />} />
          {/* Add other pages like Dashboard or Gallery here */}
        </Route>

        {/* Admin Routes */}
<Route path="/admin" element={<AdminLayout />}>

  <Route index element={<Navigate to="/admin/dashboard" />} />

  <Route path="dashboard" element={<AdminDashboard />} />

  {/* Approved Students Page */}
  <Route path="approved-students" element={<StudentApprovals />} />

  <Route path="clubs" element={<ManageClubs />} />

  <Route path="tasks" element={<AssignTasks />} />

  <Route path="galleries" element={<GlobalGalleries />} />

  <Route path="logs" element={<UserLogs />} />

  <Route path="/admin/students" element={<AdminStudents />} />

</Route>
      </Routes>
    </Router>
  );
}
export default App;