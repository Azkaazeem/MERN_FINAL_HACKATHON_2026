import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold tracking-wide">
        HackathonApp
      </Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-slate-300 text-sm">Hi, {user.name}</span>
            <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-medium transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-400">Login</Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm font-medium transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;