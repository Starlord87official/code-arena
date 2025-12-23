import { Navigate } from 'react-router-dom';

// Redirect old login page to new auth page
export default function Login() {
  return <Navigate to="/auth" replace />;
}
