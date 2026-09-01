
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  UserCheck,
  PhoneCall,
  Play,
  CheckCircle,
  SkipForward,
  RotateCcw,
  Users,
  Clock,
  Activity,
  AlertCircle,
} from "lucide-react";

const StaffDashboard = () => {
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [currentToken, setCurrentToken] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load services
  const loadServices = async () => {
    try {
      const response = await api.get("/services/");
      setServices(response.data);

      if (!selectedService && response.data.length > 0) {
        setSelectedService(String(response.data[0].id));
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load services.");
    }
  };

  // Load queue status
  const loadQueueStatus = async () => {
    try {
      const response = await api.get("/queue/status/");
      setQueueStatus(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load current token
  const loadCurrentToken = async () => {
    try {
      const response = await api.get("/queue/my-token/");
      setCurrentToken(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setCurrentToken(null);
      } else {
        console.error(err);
      }
    }
  };

  const loadDashboard = async () => {
    setLoading(true);

    await Promise.all([
      loadServices(),
      loadQueueStatus(),
      loadCurrentToken(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadQueueStatus();
      loadCurrentToken();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Call next customer
  const callNext = async () => {
    if (!selectedService) {
      setError("Please select a service first.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await api.post("/queue/call-next/", {
        service_id: Number(selectedService),
      });

      setCurrentToken(response.data);
      setMessage(
        `Next customer called: ${
          response.data.token_number ||
          response.data.token?.token_number ||
          "Token"
        }`
      );

      await loadQueueStatus();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to call next customer."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Start service
  const startService = async () => {
    if (!currentToken) {
      setError("There is no active token.");
      return;
    }

    const tokenId =
      currentToken.id || currentToken.token?.id;

    try {
      setActionLoading(true);
      setError("");

      const response = await api.post("/queue/start/", {
        token_id: tokenId,
      });

      setCurrentToken(response.data);
      setMessage("Service started successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to start service."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Complete service
  const completeService = async () => {
    if (!currentToken) {
      setError("There is no active token.");
      return;
    }

    const tokenId =
      currentToken.id || currentToken.token?.id;

    try {
      setActionLoading(true);
      setError("");

      const response = await api.post("/queue/complete/", {
        token_id: tokenId,
      });

      setCurrentToken(null);
      setMessage("Customer service completed successfully.");

      await loadQueueStatus();
      await loadCurrentToken();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to complete service."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Skip customer
  const skipCustomer = async () => {
    if (!currentToken) {
      setError("There is no active token.");
      return;
    }

    const tokenId =
      currentToken.id || currentToken.token?.id;

    try {
      setActionLoading(true);
      setError("");

      await api.post("/queue/skip/", {
        token_id: tokenId,
      });

      setCurrentToken(null);
      setMessage("Customer skipped.");

      await loadQueueStatus();
      await loadCurrentToken();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to skip customer."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Recall customer
  const recallCustomer = async () => {
    if (!currentToken) {
      setError("There is no active token.");
      return;
    }

    const tokenId =
      currentToken.id || currentToken.token?.id;

    try {
      setActionLoading(true);
      setError("");

      await api.post("/queue/recall/", {
        token_id: tokenId,
      });

      setMessage("Customer recalled successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to recall customer."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getTokenData = () => {
    if (!currentToken) return null;

    return currentToken.token || currentToken;
  };

  const token = getTokenData();

  const selectedServiceData = services.find(
    (service) => String(service.id) === String(selectedService)
  );

  const waitingCount = selectedServiceData?.active_tokens_count || 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="glass-card p-8 text-center">
          <p className="text-slate-300">Loading staff dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="glass-card p-6 mb-8 border-blue-500/20 bg-gradient-to-r from-slate-900/90 via-blue-950/40 to-slate-900/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-staff">
                <UserCheck className="w-3 h-3" />
                Staff Counter Station
              </span>

              <span className="text-xs text-slate-400">
                Staff ID: #{user?.id || "N/A"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.name || "Staff Member"} 👋
            </h1>

            <p className="text-slate-300 text-sm mt-1">
              Manage customers and control the queue in real time.
            </p>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Select Service
            </label>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="glass-input py-2 px-3 text-sm bg-slate-950 text-slate-200"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.prefix} - {service.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">
              Queue Waiting
            </span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="text-2xl font-extrabold text-cyan-400">
            {waitingCount}
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Customers waiting
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">
              Average Service
            </span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="text-2xl font-extrabold text-indigo-400">
            {selectedServiceData?.average_service_time || 0} min
          </div>

          <p className="text-xs text-slate-400 mt-1">
            {selectedServiceData?.name || "Select a service"}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">
              Counter Status
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="text-2xl font-extrabold text-emerald-400">
            ACTIVE
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Ready to serve
          </p>
        </div>

      </div>

      {/* Current Token */}
      <div className="glass-card p-6 border-blue-500/30 mb-8">

        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase">
              Current Customer
            </span>

            <h2 className="text-xl font-bold text-white mt-1">
              {token?.service_name ||
                token?.service ||
                selectedServiceData?.name ||
                "No active customer"}
            </h2>
          </div>

          {token && (
            <span className="badge-staff">
              {token.status || "ACTIVE"}
            </span>
          )}
        </div>

        {token ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400 uppercase">
                  Token
                </p>

                <p className="text-4xl font-extrabold text-white mt-2 font-mono">
                  {token.token_number}
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400 uppercase">
                  Customer
                </p>

                <p className="text-lg font-bold text-cyan-300 mt-2">
                  {token.user_name || token.name || "Customer"}
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400 uppercase">
                  Status
                </p>

                <p className="text-2xl font-extrabold text-emerald-400 mt-2">
                  {token.status}
                </p>
              </div>

            </div>

            {/* Controls */}
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase mb-3">
                Counter Controls
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">

                <button
                  onClick={startService}
                  disabled={actionLoading}
                  className="btn-primary !bg-indigo-600 hover:!bg-indigo-500 !text-xs !py-3 flex flex-col items-center gap-1"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>

                <button
                  onClick={completeService}
                  disabled={actionLoading}
                  className="btn-primary !bg-emerald-600 hover:!bg-emerald-500 !text-xs !py-3 flex flex-col items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </button>

                <button
                  onClick={recallCustomer}
                  disabled={actionLoading}
                  className="btn-secondary !text-xs !py-3 flex flex-col items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Recall
                </button>

                <button
                  onClick={skipCustomer}
                  disabled={actionLoading}
                  className="btn-secondary !text-xs !py-3 text-rose-300"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </button>

                <button
                  onClick={callNext}
                  disabled={actionLoading}
                  className="btn-primary !bg-blue-600 hover:!bg-blue-500 !text-xs !py-3 flex flex-col items-center gap-1"
                >
                  <PhoneCall className="w-4 h-4" />
                  Next
                </button>

              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />

            <p className="text-slate-400 mb-5">
              No customer is currently being served.
            </p>

            <button
              onClick={callNext}
              disabled={actionLoading}
              className="btn-primary"
            >
              <PhoneCall className="w-4 h-4 inline mr-2" />
              Call Next Customer
            </button>
          </div>
        )}

      </div>

      {/* Service List */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            Service Queue Overview
          </h2>

          <span className="text-xs text-slate-400">
            Auto-refreshing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3">Service</th>
                <th className="pb-3">Prefix</th>
                <th className="pb-3">Waiting</th>
                <th className="pb-3">Avg. Time</th>
              </tr>
            </thead>

            <tbody>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-slate-800/60 text-slate-300"
                >
                  <td className="py-4 font-medium">
                    {service.name}
                  </td>

                  <td className="py-4 font-mono font-bold text-cyan-400">
                    {service.prefix}
                  </td>

                  <td className="py-4">
                    {service.active_tokens_count}
                  </td>

                  <td className="py-4">
                    {service.average_service_time} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default StaffDashboard;

