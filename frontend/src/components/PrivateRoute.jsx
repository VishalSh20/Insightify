import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute() {
  const { isLoggedIn } = useSelector((state) => state.user);
  return isLoggedIn ? <Outlet /> : <Navigate to='/login' />;
}