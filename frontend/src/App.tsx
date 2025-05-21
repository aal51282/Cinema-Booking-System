import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register'
import Movies from './pages/Movies'
import MoviePage from './pages/MoviePage'
import Login from './pages/Login'
import Header from './components/custom/Header'
import AccountPage from './pages/AccountPage'
import OrderHistory from './pages/OrderHistory'
import { AuthProvider } from './components/custom/AuthContext';
import { CartProvider } from './components/custom/CartContext';
import PurchaseTickets from './pages/PurchaseTickets';
import CartPage from './pages/CartPage';
import AdminPanel from './pages/AdminPanel';
import ConfirmationPage from './pages/ConfirmationPage';
import ForgotPassword from './pages/ForgotPassword';
import RefundPage from './pages/RefundPage';
import RefundConfirmationPage from './pages/RefundConfirmationPage';
import RegistrationVerification from './pages/RegistrationVerification';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className='h-full dark'>
            <Header />
            <Routes>
              <Route path="*" element={<Movies />} />
              <Route path="/" element={<Movies/>} />
              <Route path="/login" element={<Login/>} />
              <Route path="/register" element={<Register/>} />
              <Route path='/movies/:stringId' element={<MoviePage/>} />
              <Route path='/shows/:showId' element={<PurchaseTickets/>} />
              <Route path='/account' element={<AccountPage/>} />
              <Route path='/purchases' element={<OrderHistory/>} />
              <Route path='/cart' element={<CartPage/>} />
              <Route path='/panel' element={<AdminPanel />} />
              <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/refund" element={<RefundPage />} />
              <Route path="/refund-confirmation" element={<RefundConfirmationPage />} />
              <Route path="/verification" element={<RegistrationVerification />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}