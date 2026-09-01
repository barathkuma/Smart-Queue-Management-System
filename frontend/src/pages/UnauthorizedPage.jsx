import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';

export const UnauthorizedPage = () => {
  const { user, getDashboardPath } = useAuth();

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 text-center">
      <div className="glass-card p-8 sm:p-12 max-w-md w-full border-rose-500/30 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Access Denied</h1>
        <p className="text-sm text-slate-400 mb-6">
          Your current account role (<span className="text-rose-400 font-semibold">{user?.role || 'Guest'}</span>) does not have permission to view this restricted page.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={getDashboardPath()} className="btn-primary w-full sm:w-auto text-xs !py-2.5 !px-4">
            <LayoutDashboard className="w-4 h-4 mr-1.5" /> Back to My Dashboard
          </Link>
          <Link to="/" className="btn-secondary w-full sm:w-auto text-xs !py-2.5 !px-4">
            <Home className="w-4 h-4 mr-1.5" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
