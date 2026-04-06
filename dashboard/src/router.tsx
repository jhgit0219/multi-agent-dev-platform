import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MissionControl from './pages/MissionControl';
import AuthGuard from './components/AuthGuard';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      { index: true, element: <MissionControl /> },
    ],
  },
]);
