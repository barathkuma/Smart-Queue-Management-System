import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  BellRing, 
  BarChart3, 
  Layers,
  Zap,
  Activity
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, getDashboardPath } = useAuth();

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-400/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            Next-Gen Smart Queue Management System
          </div>

          {/* Main Hero Tagline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto font-sans">
            Join the Queue.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">
              Track Your Turn.
            </span>{' '}
            Save Your Time.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate long, frustrating physical queues. Generate virtual tokens, track live counter progress on your device, and get notified exactly when it's your turn.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to={getDashboardPath()} className="btn-primary text-base !px-8 !py-3.5">
                Go to My Portal <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base !px-8 !py-3.5">
                  Get a Virtual Token <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
                <Link to="/login" className="btn-secondary text-base !px-8 !py-3.5">
                  Staff & Admin Login
                </Link>
              </>
            )}
          </div>

          {/* Live Mockup Teaser Widget */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="glass-card p-6 sm:p-8 border-indigo-500/30 text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Queue Simulation
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">General Consultation & Banking</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Avg Wait: <span className="text-emerald-400 font-semibold">4 mins</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                  <p className="text-xs text-slate-400 font-medium">Currently Serving</p>
                  <div className="text-3xl font-extrabold text-indigo-400 mt-1">A-102</div>
                  <p className="text-[11px] text-slate-500 mt-1">Counter 1 • Sarah K.</p>
                </div>

                <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-indigo-300 font-medium">Your Virtual Ticket</p>
                    <span className="badge-user !text-[10px]">3rd in Line</span>
                  </div>
                  <div className="text-3xl font-extrabold text-cyan-300 mt-1">A-105</div>
                  <p className="text-[11px] text-indigo-200/70 mt-1">Estimated Turn: ~6 mins</p>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                  <p className="text-xs text-slate-400 font-medium">Active Counters</p>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">4 / 4</div>
                  <p className="text-[11px] text-slate-500 mt-1">Optimal Throughput</p>
                </div>
              </div>

              {/* Progress Bar Mockup */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Queue Progress</span>
                  <span className="text-indigo-400 font-medium">65% Completed</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Engineered For Efficiency</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Everything You Need to Run Frictionless Queues
            </p>
            <p className="text-slate-400 mt-4 text-base">
              Built for hospitals, banks, DMVs, customer care centers, and university administrative desks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="glass-card glass-card-hover p-7">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Virtual Tickets & QR Entry</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Customers join with one tap or by scanning a kiosk QR code. No physical paper slips or standing in congested waiting lobbies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card glass-card-hover p-7">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Turn Alerts</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automated in-app alerts and audio chimes notify users when their position drops below 3, allowing them to relax nearby.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card glass-card-hover p-7">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Staff Counter Control</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empower counter staff with 1-click controls: Call Next, Start Serving, Complete, Skip, and Recall with live time tracking.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card glass-card-hover p-7">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Queue Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track peak traffic hours, average service times, counter efficiency, and daily customer volume with interactive charts.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card glass-card-hover p-7">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Role-Based Security</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Granular JWT-authenticated portals for Customers, Counter Staff, and Super Administrators with strict endpoint isolation.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card glass-card-hover p-7">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Priority Routing</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Intelligently balances queue loads across active counters to minimize wait times and eliminate bottle-necked departments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Flow */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Seamless Journey</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">How Smart Queue Works</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="glass-card p-6 relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Select Service</h4>
              <p className="text-slate-400 text-sm">Choose the department or service you need directly from the portal or kiosk.</p>
            </div>

            <div className="glass-card p-6 relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Receive Digital Token</h4>
              <p className="text-slate-400 text-sm">Get an instant virtual token with live wait estimations and queue progress.</p>
            </div>

            <div className="glass-card p-6 relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Step Up to Counter</h4>
              <p className="text-slate-400 text-sm">Receive a live prompt with your assigned counter number right as your turn arrives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-900/30 via-slate-900/50 to-purple-900/30 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to upgrade your queue experience?
          </h2>
          <p className="text-slate-300 mt-4 text-base">
            Experience the next standard in patient, customer, and administrative queue management.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register" className="btn-primary !px-8 !py-3">
              Get Started Now <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
