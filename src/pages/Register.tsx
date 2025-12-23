import { Navigate } from 'react-router-dom';

// Redirect old register page to new auth page
export default function Register() {
  return <Navigate to="/auth" replace />;
}
