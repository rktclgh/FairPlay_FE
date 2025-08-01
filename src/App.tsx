import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Main } from "./pages/MainPage";
import { MyPageInfo } from "./pages/mypage/Info";
import { MyPageAccount } from "./pages/mypage/Account";
import { MyPageFavorites } from "./pages/mypage/Favorites";
import EventOverview from "./pages/EventOverview";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignUpPage } from "./pages/auth/SignUpPage";
import { FindPassword } from "./pages/auth/FindPassword";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/eventoverview" element={<EventOverview />} />
        <Route path="/mypage/info" element={<MyPageInfo />} />
        <Route path="/mypage/account" element={<MyPageAccount />} />
        <Route path="/mypage/favorites" element={<MyPageFavorites />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/find-password" element={<FindPassword />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={1800} />
    </BrowserRouter>
  );
}

export default App;
