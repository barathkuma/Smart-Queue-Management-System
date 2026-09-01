import React from 'react';
import { Clock, Shield, Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Pitch */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Smart<span className="text-indigo-400">Queue</span></span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              "Join the Queue. Track Your Turn. Save Your Time."
              Eliminating physical waiting lines with intelligent virtual tokens, live SMS alerts, and AI-assisted counter routing.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 w-fit px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              All Queue Engines Operational (99.99% Uptime)
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">System Portals</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/login" className="hover:text-indigo-400 transition-colors">Customer Waitlist</a></li>
              <li><a href="/login" className="hover:text-indigo-400 transition-colors">Staff Counter Station</a></li>
              <li><a href="/login" className="hover:text-indigo-400 transition-colors">Administrator Console</a></li>
              <li><a href="/register" className="hover:text-indigo-400 transition-colors">Create Free Account</a></li>
            </ul>
          </div>

          {/* Technology Highlights */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Enterprise Stack</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-indigo-400" /> Django REST + SimpleJWT</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-cyan-400" /> React 18 + Tailwind CSS</li>
              <li className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-400" /> Real-time Queue Engine</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Smart Queue Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for friction-free queueing.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
