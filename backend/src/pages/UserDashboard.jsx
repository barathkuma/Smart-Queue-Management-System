import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Clock,
  Sparkles,
  Ticket,
  Users,
  Bell,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [myToken, setMyToken] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load all dashboard data
  const loadDashboard = async () => {
    try {
      setError('');

      const [servicesResponse, tokenResponse, statusResponse, historyResponse] =
        await Promise.all([
          api.get('/services/'),
          api.get('/queue/my-token/'),
          api.get('/queue/status/'),
          api.get('/queue/history/')
        ]);

      setServices(servicesResponse.data || []);
      setMyToken(tokenResponse.data || null);
      setQueueStatus(statusResponse.data || null);
      setHistory(historyResponse.data || []);
    } catch (err) {
      console.error('Dashboard loading error:', err);

      // No active token is a normal situation
      if (err.response?.status === 404) {
        setMyToken(null);
      } else {
        setError(
          err.response?.data?.detail ||
          'Unable to load dashboard data.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Refresh queue information every 5 seconds
    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Join a service queue
  const joinQueue = async (serviceId) => {
    try {
      setJoining(true);
      setError('');
      setMessage('');

      const response = await api.post('/queue/join/', {
        service_id: serviceId
      });

      setMessage(
        response.data?.message ||
        'Successfully joined the queue!'
      );

      await loadDashboard();
    } catch (err) {
      console.error('Join queue error:', err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Unable to join the queue.'
      );
    } finally {
      setJoining(false);
    }
  };

  // Cancel current token
  const cancelQueue = async () => {
    if (!myToken) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel token ${myToken.token_number}?`
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      setError('');
      setMessage('');

      const response = await api.post('/queue/cancel/', {
        token_id: myToken.id
      });

      setMessage(
        response.data?.message ||
        'Your queue token has been cancelled.'
      );

      await loadDashboard();
    } catch (err) {
      console.error('Cancel queue error:', err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Unable to cancel the queue.'
      );
    } finally {
      setCancelling(false);
    }
  };

  const activeToken =
    myToken &&
    ['WAITING', 'CALLED', 'SERVING'].includes(myToken.status);

  const peopleAhead = myToken?.people_ahead ?? 0;

  const estimatedWait = myToken?.estimated_wait_time ?? 0;

  const statusText = myToken?.status || 'NO ACTIVE TOKEN';

  const progress =
    activeToken && peopleAhead >= 0
      ? Math.max(5, Math.min(100, 100 - peopleAhead * 15))
      : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="glass-card p-10 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">
            Loading your queue dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="glass-card p-6 sm:p-8 mb-8 border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-user">
                <Sparkles className="w-3 h-3" />
                Customer Portal
              </span>

              <span className="text-xs text-slate-400">
                Live Queue
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hello, {user?.name || 'Customer'}! 👋
            </h1>

            <p className="text-slate-300 text-sm mt-1">
              Join a queue and track your position in real time.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="btn-secondary text-xs !py-2.5 !px-4"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </button>

        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {message}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        {/* Token */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">
              Active Token
            </span>
            <Ticket className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="text-2xl font-extrabold text-white">
            {activeToken ? myToken.token_number : 'None'}
          </div>

          <p className="text-xs text-cyan-300/80 mt-1">
            {activeToken
              ? `${peopleAhead} people ahead`
              : 'No active queue'}
          </p>
        </div>

        {/* Wait */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">
              Est. Wait Time
            </span>

            <Clock className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="text-2xl font-extrabold text-indigo-400">
            {activeToken ? `${estimatedWait} min` : '--'}
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Based on current queue
          </p>
        </div>

        {/* People */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">
              People Ahead
            </span>

            <Users className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="text-2xl font-extrabold text-emerald-400">
            {activeToken ? peopleAhead : 0}
          </div>

          <p className="text-xs text-slate-400 mt-1">
            In your selected queue
          </p>
        </div>

        {/* Status */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">
              Queue Status
            </span>

            <Bell className="w-4 h-4 text-purple-400" />
          </div>

          <div className="text-xl font-extrabold text-purple-400">
            {statusText}
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Live status
          </p>
        </div>

      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Current Ticket */}
        <div className="lg:col-span-2 space-y-6">

          <div className="glass-card p-6 border-indigo-500/30">

            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">

              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Current Ticket
                </span>

                <h3 className="text-lg font-bold text-white mt-1">
                  {activeToken
                    ? myToken.service_name ||
                      myToken.service?.name ||
                      'Selected Service'
                    : 'No Active Queue'}
                </h3>
              </div>

              {activeToken && (
                <span className="badge-user">
                  {myToken.status}
                </span>
              )}

            </div>

            {activeToken ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400">
                      Your Number
                    </p>

                    <p className="text-3xl font-extrabold text-cyan-400 mt-1">
                      {myToken.token_number}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400">
                      People Ahead
                    </p>

                    <p className="text-3xl font-extrabold text-indigo-400 mt-1">
                      {peopleAhead}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400">
                      Counter
                    </p>

                    <p className="text-xl font-extrabold text-emerald-400 mt-3">
                      {myToken.counter_number || 'Not assigned'}
                    </p>
                  </div>

                </div>

                {/* Progress */}
                <div className="space-y-2">

                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span>Progress to Counter</span>

                    <span className="text-indigo-400">
                      {progress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">

                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />

                  </div>

                  <p className="text-xs text-slate-400 pt-2">
                    {myToken.status === 'CALLED'
                      ? 'Your token has been called. Please approach the counter.'
                      : myToken.status === 'SERVING'
                      ? 'Your service is currently being handled.'
                      : `${peopleAhead} people are ahead of you.`}
                  </p>

                </div>

                {/* Cancel */}
                {myToken.status === 'WAITING' && (
                  <button
                    onClick={cancelQueue}
                    disabled={cancelling}
                    className="mt-6 w-full sm:w-auto btn-secondary !border-red-500/30 !text-red-400"
                  >
                    <XCircle className="w-4 h-4 mr-2" />

                    {cancelling
                      ? 'Cancelling...'
                      : 'Cancel Queue'}
                  </button>
                )}

              </>
            ) : (
              <div className="text-center py-10">

                <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />

                <h3 className="text-lg font-bold text-white">
                  You are not currently in a queue
                </h3>

                <p className="text-sm text-slate-400 mt-2">
                  Select a service below to get your token.
                </p>

              </div>
            )}

          </div>

          {/* Services */}
          <div className="glass-card p-6">

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                Available Services
              </h3>

              <span className="text-xs text-slate-400">
                {services.length} services
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {services.map((service) => (

                <div
                  key={service.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {service.name}
                      </h4>

                      <p className="text-xs text-slate-400 mt-1">
                        {service.description ||
                          'Queue service available'}
                      </p>

                      <p className="text-xs text-indigo-400 mt-2">
                        Avg. service time: {
                          service.average_service_time
                        } min
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {service.active_tokens_count || 0} currently waiting
                      </p>
                    </div>

                    <button
                      onClick={() => joinQueue(service.id)}
                      disabled={joining || activeToken}
                      className="btn-secondary !text-xs !py-1.5 !px-3 disabled:opacity-40"
                    >
                      {joining ? 'Joining...' : 'Join'}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* Right Side */}
        <div className="space-y-6">

          {/* Profile */}
          <div className="glass-card p-6">

            <h3 className="text-sm font-bold text-white mb-4">
              Account Profile
            </h3>

            <div className="space-y-3 text-xs">

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">
                  Full Name
                </span>

                <span className="text-slate-200 font-semibold">
                  {user?.name}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">
                  Email
                </span>

                <span className="text-slate-200 font-semibold">
                  {user?.email}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">
                  Phone
                </span>

                <span className="text-slate-200 font-semibold">
                  {user?.phone || 'Not provided'}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-400">
                  Role
                </span>

                <span className="badge-user">
                  {user?.role}
                </span>
              </div>

            </div>

          </div>

          {/* Queue History */}
          <div className="glass-card p-6">

            <h3 className="text-sm font-bold text-white mb-4">
              Recent Queue History
            </h3>

            {history.length === 0 ? (

              <p className="text-xs text-slate-400">
                No queue history yet.
              </p>

            ) : (

              <div className="space-y-3">

                {history.slice(0, 5).map((item, index) => (

                  <div
                    key={item.id || index}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800"
                  >

                    <div className="flex justify-between">

                      <span className="text-sm font-bold text-cyan-400">
                        {item.token_number}
                      </span>

                      <span className="text-xs text-slate-400">
                        {item.status}
                      </span>

                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      {item.service_name ||
                        item.service?.name ||
                        'Service'}
                    </p>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default UserDashboard;