import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Main } from './pages/MainPage'
import { LoginPage } from './pages/LoginPage'
import { SignUpPage } from './pages/SignUpPage'
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
        </Routes>
      </Router>
      {/* ToastContainer는 무조건 최상단에, 한 번만 */}
      <ToastContainer position="top-center" autoClose={1800} />
    </>
  )
}

export default App
