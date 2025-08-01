import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Main } from './pages/MainPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignUpPage } from './pages/auth/SignUpPage'
import { FindPassword } from './pages/auth/FindPassword'
import { MyPageInfo } from './pages/mypage/Info'
import { Withdrawal } from './pages/mypage/Withdrawal'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/find-password" element={<FindPassword />} />
          <Route path="/mypage/info" element={<MyPageInfo />} />
          <Route path="/mypage/withdrawal" element={<Withdrawal />} />
        </Routes>
      </Router>

      <ToastContainer position="top-center" autoClose={1800} />
    </>
  )
}

export default App
