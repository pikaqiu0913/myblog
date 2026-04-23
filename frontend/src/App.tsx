import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Profile from './pages/Profile'
import EducationPage from './pages/Education'
import PhotoAlbums from './pages/PhotoAlbums'
import Family from './pages/Family'
import FamilyDetail from './pages/FamilyDetail'
import Friends from './pages/Friends'
import Guestbook from './pages/Guestbook'
import BlogList from './pages/BlogList'
import BlogDetail from './pages/BlogDetail'
import Login from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProfileEditor from './pages/admin/ProfileEditor'
import AdminEducationManager from './pages/admin/EducationManager'
import AdminFamilyManager from './pages/admin/FamilyManager'
import AdminFriendManager from './pages/admin/FriendManager'
import AdminGuestbookManager from './pages/admin/GuestbookManager'
import AdminBlogEditor from './pages/admin/BlogEditor'
import AdminMediaManager from './pages/admin/MediaManager'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="education" element={<EducationPage />} />
        <Route path="photos" element={<PhotoAlbums />} />
        <Route path="family" element={<Family />} />
        <Route path="family/:id" element={<FamilyDetail />} />
        <Route path="friends" element={<Friends />} />
        <Route path="guestbook" element={<Guestbook />} />
        <Route path="blog" element={<BlogList />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
      </Route>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/profile" element={<AdminProfileEditor />} />
      <Route path="/admin/education" element={<AdminEducationManager />} />
      <Route path="/admin/family" element={<AdminFamilyManager />} />
      <Route path="/admin/friends" element={<AdminFriendManager />} />
      <Route path="/admin/guestbook" element={<AdminGuestbookManager />} />
      <Route path="/admin/blog" element={<AdminBlogEditor />} />
      <Route path="/admin/media" element={<AdminMediaManager />} />
    </Routes>
  )
}

export default App
