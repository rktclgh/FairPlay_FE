import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Main } from './pages/MainPage'
import { LoginPage } from './pages/LoginPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App
