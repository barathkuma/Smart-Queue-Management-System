import React, { useEffect, useState } from 'react';
import api from '../services/api';

const UserDashboard = () => {
  const [services, setServices] = useState([]);
  const [activeToken, setActiveToken] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [servicesRes, tokenRes, statusRes, historyRes] =
        await Promise.allSettled([
          api.get('/services/'),
          api.get('/queue/my-token/'),
          api.get('/queue/status/'),
          api.get('/queue/history/'),
        ]);

      // Services
      if (servicesRes.status === 'fulfilled') {
        const data = servicesRes.value.data;
        if (Array.isArray(data)) {
          setServices(data);
        } else if (data && Array.isArray(data.results)) {
          setServices(data.results);
        } else {
          setServices([]);
        }
      }

      // Active token
      if (tokenRes.status === 'fulfilled') {
        const data = tokenRes.value.data;
        // The API returns { "active_token": { ... } } or { "active_token": null }
        if (data && data.active_token) {
          setActiveToken(data.active_token);
        } else {
          setActiveToken(null);
        }
      }

      // Queue status
      if (statusRes.status === 'fulfilled') {
        setQueueStatus(statusRes.value.data);
      }

      // History
      if (historyRes.status === 'fulfilled') {
        const data = historyRes.value.data;
        // API returns { "count": X, "history": [ ... ] }
        if (data && Array.isArray(data.history)) {
          setHistory(data.history);
        } else if (Array.isArray(data)) {
          setHistory(data);
        } else {
          setHistory([]);
        }
      }
    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      updateLiveStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Specialized function for live updates to avoid reloading everything (like history)
  const updateLiveStatus = async () => {
    try {
      const [tokenRes, statusRes] = await Promise.allSettled([
        api.get('/queue/my-token/'),
        api.get('/queue/status/'),
      ]);

      if (tokenRes.status === 'fulfilled') {
        const data = tokenRes.value.data;
        if (data && data.active_token) {
          setActiveToken(data.active_token);
        } else {
          setActiveToken(null);
        }
      }

      if (statusRes.status === 'fulfilled') {
        setQueueStatus(statusRes.value.data);
      }
    } catch (err) {
      console.error('Live update error:', err);
    }
  };

    const joinQueue = async (serviceId) => {
      try {
        setJoining(true);
        setMessage('');
        setError('');

        const response = await api.post('/queue/join/', {
          service_id: serviceId,
        });

        // Backend returns: { "message": "...", "token": { ... }, "token_number": "...", ... }
        const newToken = response.data.token;
        if (newToken) {
          setActiveToken(newToken);
        }

        setMessage(response.data.message || 'Successfully joined the queue!');

        await loadDashboard();
      } catch (err) {
        console.error('Join queue error:', err);

        const detail =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Unable to join the queue.';

        setError(detail);
      } finally {
        setJoining(false);
      }
    };

  // Cancel queue
  const cancelQueue = async () => {
    try {
      setError('');
      setMessage('');

      await api.post('/queue/cancel/');

      setActiveToken(null);
      setMessage('Your queue token has been cancelled.');

      await loadDashboard();
    } catch (err) {
      console.error('Cancel queue error:', err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Unable to cancel your token.'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900">
            User Dashboard
          </h1>

          <p className="mt-4 text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            User Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your queue and check your waiting status.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Active Token */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            My Active Token
          </h2>

          {activeToken ? (
            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-lg bg-blue-50 p-5">
                <p className="text-sm text-gray-500">
                  Token Number
                </p>

                <p className="mt-2 text-4xl font-bold text-blue-600">
                  {activeToken.token_number ||
                    activeToken.token ||
                    activeToken.number ||
                    '—'}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  People Ahead
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {activeToken.people_ahead ?? 0}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  Estimated Wait
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {activeToken.estimated_wait_time ??
                    activeToken.wait_time ??
                    0}{' '}
                  min
                </p>
              </div>

            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <p className="text-gray-600">
                You don't have an active queue token.
              </p>
            </div>
          )}

          {activeToken && (
            <button
              onClick={cancelQueue}
              className="mt-5 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
            >
              Cancel Token
            </button>
          )}
        </div>

        {/* Queue Status */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Queue Status
          </h2>

          {queueStatus && activeToken ? (
            (() => {
              const myService = queueStatus.services?.find(
                (s) => s.id === activeToken.service_id || s.id === activeToken.service?.id
              );

              if (!myService) return <p className="text-gray-500">Service status unavailable.</p>;

              return (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">
                      Currently Serving
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {myService.currently_serving_token || '—'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">
                      People Waiting
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {myService.waiting_count ?? 0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">
                      Service
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {myService.name || 'Active'}
                    </p>
                  </div>
                </div>
              );
            })()
          ) : activeToken ? (
            <p className="text-gray-500">Loading queue status...</p>
          ) : (
            <p className="text-gray-500">
              Join a queue to see your live status.
            </p>
          )}
        </div>

        {/* Services */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Available Services
          </h2>

          {services.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <p className="text-gray-500">
                No services are currently available.
              </p>

              <p className="mt-2 text-sm text-gray-400">
                An administrator needs to create an active service.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-gray-900">
                    {service.name}
                  </h3>

                  <p className="mt-2 text-gray-600">
                    {service.description ||
                      'Queue service available.'}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <p>
                      <strong>Token Prefix:</strong>{' '}
                      {service.prefix}
                    </p>

                    <p>
                      <strong>Average Time:</strong>{' '}
                      {service.average_service_time} minutes
                    </p>

                    <p>
                      <strong>People in Queue:</strong>{' '}
                      {service.active_tokens_count ?? 0}
                    </p>
                  </div>

                  <button
                    disabled={joining || !!activeToken}
                    onClick={() => joinQueue(service.id)}
                    className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {activeToken
                      ? 'Already in Queue'
                      : joining
                      ? 'Joining...'
                      : 'Join Queue'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Queue History
          </h2>

          {(Array.isArray(history) ? history : []).length === 0 ? (
            <p className="text-gray-500">
              No queue history yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-3">Token</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {(Array.isArray(history) ? history : []).map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="border-b last:border-b-0"
                    >
                      <td className="p-3 font-medium">
                        {item.token_number ||
                          item.token ||
                          '—'}
                      </td>

                      <td className="p-3">
                        {item.service_name ||
                          item.service?.name ||
                          '—'}
                      </td>

                      <td className="p-3">
                        {item.status || '—'}
                      </td>

                      <td className="p-3">
                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;