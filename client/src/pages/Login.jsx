import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary-700">
            SplitEasy
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <LoginForm onSuccess={() => navigate('/dashboard')} />
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
