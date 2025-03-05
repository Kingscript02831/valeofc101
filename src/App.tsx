import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PostForm from './pages/PostForm';
import StoryCreator from "./pages/StoryCreator";
import StoryViewer from "./pages/StoryViewer";
import StoryManager from "./pages/StoryManager";
import StoryForm from "./pages/StoryForm";
import StoryEdit from "./pages/StoryEdit";
import DropboxAuth from "./pages/DropboxAuth";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/posts/new" element={<PostForm />} />
        <Route path="/story/creator" element={<StoryCreator />} />
        <Route path="/story/view/:id" element={<StoryViewer />} />
        <Route path="/story/manage" element={<StoryManager />} />
        <Route path="/story/new" element={<StoryForm />} />
        <Route path="/story/edit/:id" element={<StoryEdit />} />
        <Route path="/dropbox-auth" element={<DropboxAuth />} />
      </Routes>
    </Router>
  );
}

export default App;
