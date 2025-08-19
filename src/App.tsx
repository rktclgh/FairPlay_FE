import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
// import axios from "axios";
// import authManager from "./utils/auth";
import tokenValidator from "./utils/tokenValidator";
import presenceManager from "./utils/presenceManager";
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
import { TicketReservation } from "./pages/user_event/TicketReservation";
import { LoginPage } from "./pages/user_auth/LoginPage";
import { SignUpPage } from "./pages/user_auth/SignUpPage";
import { FindPassword } from "./pages/user_auth/FindPassword";
import { RegisterEvent } from "./pages/RegisterEvent";
import { EventRegistrationIntro } from "./pages/EventRegistrationIntro";
import { HostDashboard } from "./pages/HostDashboard";
import { EditEventInfo } from "./pages/host_event/EditEventInfo";
import { EventStatusBanner } from "./pages/host_event/EventStatusBanner";
import TicketManagement from "./pages/host_event/TicketManagement";
import ScheduleManagement from "./pages/host_event/ScheduleManagement";
import EventVersionManagement from "./pages/host_event/EventVersionManagement";
import { EventVersionDetail } from "./pages/host_event/EventVersionDetail";
import { EventVersionComparison } from "./pages/host_event/EventVersionComparison";
import AdvertisementApplication from "./pages/host_event/AdvertisementApplication";
import { ReservationList } from "./pages/host_reservation/ReservationList";
import { ReservationStats } from "./pages/host_reservation/ReservationStats";
import { BoothTypeManagement } from "./pages/host_booth/BoothTypeManagement";
import { BoothApplicationList } from "./pages/host_booth/BoothApplicationList";
import { BoothApplicationDetail } from "./pages/host_booth/BoothApplicationDetail";
import { BookingAnalysis } from "./pages/host_analytics/BookingAnalysis";
import { RevenueSummary } from "./pages/host_analytics/RevenueSummary";
import { TimeAnalysis } from "./pages/host_analytics/TimeAnalysis";
import QRScanPage from "./pages/QRScanPage";
import { HostRouteGuard } from "./components/HostRouteGuard";
import { AdminRouteGuard } from "./components/AdminRouteGuard";
import BoothParticipants from "./pages/host_booth/BoothParticipants";
import BoothParticipantDetail from "./pages/host_booth/BoothParticipantDetail";
import AdminDashboard from "./pages/admin_dashboard/AdminDashboard";
import EventComparison from "./pages/admin_dashboard/EventComparison";
import EventList from "./pages/admin_event/EventList";
// Lazy-load some heavy admin pages
const EventApproval = lazy(() => import("./pages/admin_event/EventApproval"));
import EventApprovalDetail from "./pages/admin_event/EventApprovalDetail";
import EventEditRequests from "./pages/admin_event/EventEditRequests";
import EventEditRequestDetail from "./pages/admin_event/EventEditRequestDetail";
import AccountRoles from "./pages/admin_account/AccountRoles";
import VipBannerManagement from "./pages/admin_vip_banner/VipBannerManagement";
import AdvertisementApplicationList from "./pages/admin_vip_banner/AdvertisementApplicationList";
import SettlementManagement from "./pages/admin_settlement/SettlementManagement";
import RemittanceHistory from "./pages/admin_settlement/RemittanceHistory";
import ReservationStatistics from "./pages/admin_statistics/ReservationStatistics";
import PopularEvents from "./pages/admin_statistics/PopularEvents";
import IntegrationSettings from "./pages/admin_settings/IntegrationSettings";
import MessageTemplates from "./pages/admin_settings/MessageTemplates";
import AccessLogs from "./pages/admin_security/AccessLogs";
import ChangeLogs from "./pages/admin_security/ChangeLogs";
import { AdminProfile } from "./pages/admin_account/AdminProfile";
import { HostProfile } from "./pages/host_account/HostProfile";
import { BoothAdminProfile } from "./pages/booth_admin/BoothAdminProfile";
import { BoothAdminRouteGuard } from "./components/BoothAdminRouteGuard";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import { useScrollToTop } from './hooks/useScrollToTop';
import KakaoCallback from "./pages/user_auth/KakaoCallback";
import ChatFloatingModal from "./components/chat/ChatFloatingModal";
import { RefundList } from "./pages/user_refund/RefundList";
import RefundManagement from "./pages/admin_refund/RefundManagement";
import PaymentManagement from "./pages/admin_payment/PaymentManagement";
import HostPaymentManagement from "./pages/host_event/host_payment/HostPaymentManagement";
import BoothExperienceList from "./pages/user_booth/BoothExperienceList";
import MyBoothExperienceReservations from "./pages/user_booth/MyBoothExperienceReservations";
import BoothExperienceManagement from "./pages/host_booth/BoothExperienceManagement";
import BoothExperienceReserverManagement from "./pages/host_booth/BoothExperienceReserverManagement";
import { OnlyQrTicketPage } from './pages/OnlyQrTicketPage';
import { OnlyQrTicketErrorPage } from './pages/OnlyQrTicketErrorPage';
import { Footer } from "./components/Footer";
import AppLayout from "./components/AppLayout";
import Notices from "./pages/footer/Notices";
import FAQ from "./pages/footer/FAQ";
import PrivacyPolicy from "./pages/footer/PrivacyPolicy";
import TermsOfUse from "./pages/footer/TermsOfUse";
import Policy from "./pages/footer/Policy";
import BoothPaymentPage from "./pages/booth/BoothPaymentPage";
import BoothCancelPage from "./pages/booth/BoothCancelPage";
import HostRefundManagement from "./pages/host_refund/HostRefundManagement";

function AppContent() {
  useScrollToTop();
  const [isTokenValidated, setIsTokenValidated] = useState(false);
  const location = useLocation();

  // 앱 시작 시 토큰 유효성 검증
  useEffect(() => {
    const validateTokens = async () => {
      await tokenValidator.validateTokensOnStartup();
      setIsTokenValidated(true);
    };

    validateTokens();

    // 주기적 토큰 검증 시작
    tokenValidator.startPeriodicValidation();
  }, []);

  // 사용자 온라인 상태 관리 (PresenceManager 사용)
  useEffect(() => {
    if (!isTokenValidated) return;

    // PresenceManager 초기화
    presenceManager.initialize();

    // 정리
    return () => {
      presenceManager.cleanup();
    };
  }, [isTokenValidated]);

  const pathname = location.pathname || "";
  const hideFooter = (
    pathname.startsWith("/host/") ||
    pathname === "/host" ||
    pathname.startsWith("/admin_dashboard") ||
    pathname.startsWith("/admin_event") ||
    pathname.startsWith("/admin_security") ||
    pathname.startsWith("/admin_settings") ||
    pathname.startsWith("/admin_settlement") ||
    pathname.startsWith("/admin_statistics") ||
    pathname.startsWith("/admin_vip_banner")
    pathname === "/register" ||
    pathname === "/event-registration-intro" ||
    pathname.startsWith("/mypage")
  );

  // 마이페이지 경로에 대해 더 큰 여백 적용
  const isMyPage = pathname.startsWith("/mypage");
  const isAuthPage = pathname === "/signup" || pathname === "/login";
  const bottomPadding = isMyPage ? "pb-48 md:pb-56" : isAuthPage ? "" : "pb-20 md:pb-28";

  return (
    <div className="min-h-screen flex flex-col">
      <main className={`flex-1 ${bottomPadding}`}>
        <Suspense fallback={<div />}>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/participant-form" element={<ParticipantForm />} />
            <Route path="/qr-ticket/participant" element={<OnlyQrTicketPage />} />
            <Route path="/qr-ticket/participant/error" element={<OnlyQrTicketErrorPage />} />
            <Route path="/eventoverview" element={<EventOverview />} />
            <Route path="/eventdetail/:eventId" element={<EventDetail />} />
            <Route path="/ticket-reservation/:eventId" element={<TicketReservation />} />
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
            <Route path="/mypage/refund" element={<RefundList />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/find-password" element={<FindPassword />} />
            <Route path="/event-registration-intro" element={<EventRegistrationIntro />} />
            <Route path="/register" element={<RegisterEvent />} />
            <Route path="/host/dashboard" element={<HostRouteGuard><HostDashboard /></HostRouteGuard>} />
            <Route path="/host/edit-event-info" element={<HostRouteGuard><EditEventInfo /></HostRouteGuard>} />
            <Route path="/host/ticket-management" element={<HostRouteGuard><TicketManagement /></HostRouteGuard>} />
            <Route path="/host/round-management" element={<HostRouteGuard><ScheduleManagement /></HostRouteGuard>} />
            <Route path="/host/status-management" element={<HostRouteGuard><EventStatusBanner /></HostRouteGuard>} />
            <Route path="/host/event-version" element={<HostRouteGuard><EventVersionManagement /></HostRouteGuard>} />
            <Route path="/host/event-version/:versionNumber" element={<HostRouteGuard><EventVersionDetail /></HostRouteGuard>} />
            <Route path="/host/event-version/comparison" element={<HostRouteGuard><EventVersionComparison /></HostRouteGuard>} />
            <Route path="/host/advertisement-application" element={<HostRouteGuard><AdvertisementApplication /></HostRouteGuard>} />
            <Route path="/host/reservation-list/:eventId" element={<HostRouteGuard><ReservationList /></HostRouteGuard>} />
            <Route path="/host/reservation-stats" element={<HostRouteGuard><ReservationStats /></HostRouteGuard>} />
            <Route path="/host/payment-management" element={<HostRouteGuard><HostPaymentManagement /></HostRouteGuard>} />
            <Route path="/host/refund-management" element={<HostRouteGuard><HostRefundManagement /></HostRouteGuard>} />
            <Route path="/host/booth-type" element={<HostRouteGuard><BoothTypeManagement /></HostRouteGuard>} />
            <Route path="/host/booth-applications" element={<HostRouteGuard><BoothApplicationList /></HostRouteGuard>} />
            <Route path="/host/booth-participants" element={<HostRouteGuard><BoothParticipants /></HostRouteGuard>} />
            <Route path="/host/booth-participants/:id" element={<HostRouteGuard><BoothParticipantDetail /></HostRouteGuard>} />
            <Route path="/host/booth-applications/:id" element={<HostRouteGuard><BoothApplicationDetail /></HostRouteGuard>} />
            <Route path="/host/booking-analysis" element={<HostRouteGuard><BookingAnalysis /></HostRouteGuard>} />
            <Route path="/host/revenue-summary" element={<HostRouteGuard><RevenueSummary /></HostRouteGuard>} />
            <Route path="/host/time-analysis" element={<HostRouteGuard><TimeAnalysis /></HostRouteGuard>} />
            <Route path="/host/qr-scan" element={<HostRouteGuard><QRScanPage /></HostRouteGuard>} />
            <Route path="/host/profile" element={<HostRouteGuard><HostProfile /></HostRouteGuard>} />
            <Route path="/admin_dashboard" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
            <Route path="/admin_dashboard/event-comparison" element={<AdminRouteGuard><EventComparison /></AdminRouteGuard>} />

            {/* 행사 관리 */}
            <Route path="/admin_dashboard/events" element={<AdminRouteGuard><EventList /></AdminRouteGuard>} />
            <Route path="/admin_dashboard/event-approvals" element={<AdminRouteGuard><EventApproval /></AdminRouteGuard>} />
            <Route path="/admin_dashboard/event-approvals/:id" element={<AdminRouteGuard><EventApprovalDetail /></AdminRouteGuard>} />
            <Route path="/admin_dashboard/event-edit-requests" element={<AdminRouteGuard><EventEditRequests /></AdminRouteGuard>} />
            <Route path="/admin_dashboard/event-edit-requests/:id" element={<AdminRouteGuard><EventEditRequestDetail /></AdminRouteGuard>} />

            {/* 계정 관리 */}
            <Route path="/admin_dashboard/accounts/roles" element={<AdminRouteGuard><AccountRoles /></AdminRouteGuard>} />

            {/* VIP 배너 광고 */}
            <Route path="/admin_dashboard/vip-banners" element={<AdminRouteGuard><VipBannerManagement /></AdminRouteGuard>} />
            <Route path="/admin_dashboard/advertisement-applications" element={<AdminRouteGuard><AdvertisementApplicationList /></AdminRouteGuard>} />

            {/* 정산 관리 */}
            <Route path="/admin_dashboard/settlements" element={<AdminRouteGuard><SettlementManagement /></AdminRouteGuard>} />
            <Route path="/admin_dashboard/remittances" element={<AdminRouteGuard><RemittanceHistory /></AdminRouteGuard>} />

            {/* 환불 관리 */}
            <Route path="/admin_dashboard/refunds" element={<AdminRouteGuard><RefundManagement /></AdminRouteGuard>} />

            {/* 결제 관리 */}
            <Route path="/admin_dashboard/payments" element={<AdminRouteGuard><PaymentManagement /></AdminRouteGuard>} />

            {/* 통합 통계 */}
            <Route path="/admin_dashboard/analytics/reservations" element={<AdminRouteGuard><ReservationStatistics /></AdminRouteGuard>} />
            <Route path="/admin_dashboard/analytics/popular" element={<AdminRouteGuard><PopularEvents /></AdminRouteGuard>} />

            {/* 시스템 설정 */}
            <Route path="/admin_dashboard/settings/integrations" element={<AdminRouteGuard><IntegrationSettings /></AdminRouteGuard>} />
            <Route path="/admin_dashboard/settings/message-templates" element={<AdminRouteGuard><MessageTemplates /></AdminRouteGuard>} />

            {/* 로그/보안 */}
            <Route path="/admin_dashboard/logs/access" element={<AdminRouteGuard><AccessLogs /></AdminRouteGuard>} />
            <Route path="/admin_dashboard/logs/changes" element={<AdminRouteGuard><ChangeLogs /></AdminRouteGuard>} />

            {/* 내 정보 관리 */}
            <Route path="/admin_dashboard/profile" element={<AdminRouteGuard><AdminProfile /></AdminRouteGuard>} />


            {/* 부스 관리자 전용 페이지 */}
            <Route path="/booth-admin/profile" element={<BoothAdminRouteGuard><BoothAdminProfile /></BoothAdminRouteGuard>} />
            <Route path="/host/dashboard" element={<HostDashboard />} />
            <Route path="/host/edit-event-info" element={<EditEventInfo />} />
            <Route path="/host/ticket-management" element={<TicketManagement />} />
            <Route path="/host/status-management" element={<EventStatusBanner />} />
            <Route path="/host/reservation-list" element={<ReservationList />} />
            <Route path="/host/reservation-stats" element={<ReservationStats />} />
            <Route path="/host/booth-type" element={<BoothTypeManagement />} />
            <Route path="/host/booth-applications" element={<BoothApplicationList />} />
            <Route path="/host/booth-participants" element={<BoothParticipants />} />
            <Route path="/host/booth-participants/:id" element={<BoothParticipantDetail />} />
            <Route path="/host/booth-applications/:id" element={<BoothApplicationDetail />} />
            <Route path="/host/booking-analysis" element={<BookingAnalysis />} />
            <Route path="/host/revenue-summary" element={<RevenueSummary />} />
            <Route path="/host/time-analysis" element={<TimeAnalysis />} />
            <Route path="/host/qr-scan" element={<QRScanPage />} />
            <Route path="/auth/kakao/callback" element={<KakaoCallback />} />

            {/* 부스 관련 공개 페이지 (이메일에서 접근) */}
            <Route path="/booth/payment" element={<BoothPaymentPage />} />
            <Route path="/booth/cancel" element={<BoothCancelPage />} />

            {/* 부스 체험 */}
            <Route path="/host/booth-experience-reserver-management" element={<HostRouteGuard><BoothExperienceReserverManagement /></HostRouteGuard>} />
            <Route path="/host/booth-experience-management" element={<HostRouteGuard><BoothExperienceManagement /></HostRouteGuard>} />
            <Route path="/mypage/booth-experiences" element={<BoothExperienceList />} />
            <Route path="/mypage/booth-experiences-reservation" element={<MyBoothExperienceReservations />} />
            {/* Footer pages */}
            <Route path="/support/notices" element={<Notices />} />
            <Route path="/support/faq" element={<FAQ />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/terms" element={<TermsOfUse />} />
            <Route path="/legal/policy" element={<Policy />} />
          </Routes>
        </Suspense>
      </main>
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
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppLayout>
          <AppContent />
        </AppLayout>
        {/* 채팅 플로팅 버튼은 항상 표시하되, 클릭 시 인증 확인 */}
        <ChatFloatingModal />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;