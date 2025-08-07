import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Main } from "./pages/MainPage";
import { MyPageInfo } from "./pages/user_mypage/Info";
import { MyPageAccount } from "./pages/user_mypage/Account";
import { MyPageFavorites } from "./pages/user_mypage/Favorites";
import { Withdrawal } from "./pages/user_mypage/Withdrawal";
import { MyPageMyReview } from "./pages/user_mypage/MyReview";
import Reservation from "./pages/user_mypage/Reservation";
import MyTickets from "./pages/user_mypage/MyTickets";
import ParticipantForm from "./pages/user_mypage/ParticipantForm";
import ParticipantList from "./pages/user_mypage/ParticipantList";
import EventOverview from "./pages/user_event/EventOverview";
import EventDetail from "./pages/user_event/EventDetail";
import { BookingPage } from "./pages/user_event/BookingPage";
import { LoginPage } from "./pages/user_auth/LoginPage";
import { SignUpPage } from "./pages/user_auth/SignUpPage";
import { FindPassword } from "./pages/user_auth/FindPassword";
import { RegisterEvent } from "./pages/RegisterEvent";
import { HostDashboard } from "./pages/HostDashboard";
import { EditEventInfo } from "./pages/host_event/EditEventInfo";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { useScrollToTop } from './hooks/useScrollToTop';
import KakaoCallback from "./pages/user_auth/KakaoCallback";
import ChatFloatingModal from "./components/chat/ChatFloatingModal"; // ← 위치 반드시 확인

function AppContent() {
  useScrollToTop();

  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/eventoverview" element={<EventOverview />} />
        <Route path="/eventdetail/:eventId" element={<EventDetail />} />
        <Route path="/booking/:eventId" element={<BookingPage />} />
        <Route path="/mypage/info" element={<MyPageInfo />} />
        <Route path="/mypage/account" element={<MyPageAccount />} />
        <Route path="/mypage/favorites" element={<MyPageFavorites />} />
        <Route path="/mypage/reservation" element={<Reservation />} />
        <Route path="/mypage/tickets" element={<MyTickets />} />
        <Route path="/mypage/participant-form" element={<ParticipantForm />} />
        <Route path="/mypage/participant-list" element={<ParticipantList />} />
        <Route path="/mypage/write-review" element={<MyPageMyReview />} />
        <Route path="/mypage/my-review" element={<MyPageMyReview />} />
        <Route path="/mypage/withdrawal" element={<Withdrawal />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/find-password" element={<FindPassword />} />
        <Route path="/register" element={<RegisterEvent />} />
        <Route path="/host/dashboard" element={<HostDashboard />} />
        <Route path="/host/edit-event-info" element={<EditEventInfo />} />
        <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <ChatFloatingModal />
    </BrowserRouter>
  );
}

export default App;
