import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import Accounts from './pages/Accounts';
import Campaigns from './pages/Campaigns';
import Hashtags from './pages/Hashtags';
import Templates from './pages/Templates';
import AnalyticsPage from './pages/AnalyticsPage';
import Competitors from './pages/Competitors';
import BrandVoice from './pages/BrandVoice';
import AutoReplies from './pages/AutoReplies';
import Team from './pages/Team';
import Reports from './pages/Reports';
import Calendar from './pages/Calendar';
import AIGenerator from './pages/AIGenerator';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<Posts />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="hashtags" element={<Hashtags />} />
        <Route path="templates" element={<Templates />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="brand-voice" element={<BrandVoice />} />
        <Route path="auto-replies" element={<AutoReplies />} />
        <Route path="team" element={<Team />} />
        <Route path="reports" element={<Reports />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="ai-generator" element={<AIGenerator />} />
      </Route>
    </Routes>
  );
}
