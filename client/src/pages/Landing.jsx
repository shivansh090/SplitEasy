import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <h1 className="text-xl font-bold text-primary-700">SplitEasy</h1>
        <div className="flex gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Split expenses with
            <span className="text-primary-600"> just a message</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-lg mx-auto">
            No forms, no dropdowns. Just type "I paid 500 for dinner, split with
            Rahul and Priya" and we handle the rest.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="bg-primary-600 text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-primary-700 transition-colors"
            >
              Start Splitting
            </Link>
          </div>

          <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-md mx-auto text-left">
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-primary-600 text-white px-4 py-2 rounded-2xl rounded-br-md text-sm max-w-[80%]">
                  I paid 2000 for dinner, split between me, Rahul, and Priya
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md text-sm max-w-[80%]">
                  <p className="text-xs font-semibold text-primary-600 mb-1">SplitEasy</p>
                  Got it! You paid &#8377;2,000 for dinner, split equally between you, Rahul, and Priya (&#8377;667 each). Sound right?
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
