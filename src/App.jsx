import React from 'react';
import './App.css';
import './styles/Auth.css';

import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Hero from './components/Hero';
import HomePage from './pages/HomePage';
import Dashboard from './Admin/Dashboard';
import AllUsers from './Admin/AllUsers';
import AddPost from './Admin/AddPost';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-post" element={<AddPost />} />
        <Route path="/all-users" element={<AllUsers />} />
      </Routes>
    </>
  );
};

export default App;
