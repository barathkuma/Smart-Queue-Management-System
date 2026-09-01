import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  Layers, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="badge-admin">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case 'STAFF':
        return (
          <span className="badge-staff">
            <UserCheck className="w-3.5 h-3.5" /> Staff
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="badge-user">
            <Sparkles className="w-3.5 h-3.5" /> Customer
          </span>
        );
    }
  };

  const dashboardUrl = getDashboardPath();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-lg text-white tracking-tight">
                Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Queue</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">AI-Powered Flow</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
            <Link 
              to="/" 
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                location.pathname === '/' ? 'text-white bg-slate-800/60' : 'hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Home
            </Link>
            <a 
              href="/#features" 
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              Features
            </a>
            <a 
              href="/#how-it-works" 
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              How It Works
            </a>
            {isAuthenticated && (
              <Link 
                to={dashboardUrl} 
                className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                  location.pathname.includes('dashboard') ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Portal
              </Link>
            )}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">{user?.name}</p>
                    {getRoleBadge(user?.role)}
                  </div>
                </div>

                <Link
                  to={dashboardUrl}
                  className="btn-primary text-xs !py-2 !px-3.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-secondary text-xs !py-2 !px-4"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs !py-2 !px-4"
                >
                  Join Queue
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 font-medium"
          >
            Home
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 font-medium"
          >
            Features
          </a>
          {isAuthenticated && (
            <Link
              to={dashboardUrl}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-indigo-400 hover:bg-slate-900 font-medium"
            >
              My Dashboard ({user?.role})
            </Link>
          )}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{user?.email}</span>
                  {getRoleBadge(user?.role)}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="btn-secondary !w-full text-red-400 border-red-500/20"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary !w-full"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary !w-full"
                >
                  Join Queue
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
