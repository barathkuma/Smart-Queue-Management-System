import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import {
  ShieldCheck,
  Users,
  Layers,
  Activity,
  Database,
  Server,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const [healthStatus, setHealthStatus] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // Load Admin Dashboard
  // ==========================================

  const loadDashboard = async () => {
    try {
      setError("");

      const [healthResponse, servicesResponse] = await Promise.all([
        api.get("/health/"),
        api.get("/services/"),
      ]);

      setHealthStatus(healthResponse.data);
      setServices(servicesResponse.data || []);
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================
  // Refresh
  // ==========================================

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  // ==========================================
  // Calculations
  // ==========================================

  const totalServices = services.length;

  const totalWaiting = services.reduce(
    (total, service) =>
      total + Number(service.active_tokens_count || service.waiting_count || 0),
    0
  );

  const apiOnline = healthStatus?.status === "online";

  const databaseHealthy =
    healthStatus?.database === "healthy" ||
    healthStatus?.database === "connected";

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-10 text-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />

          <h2 className="text-lg font-bold text-white">
            Loading admin dashboard...
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Fetching system information.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Main Dashboard
  // ==========================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="glass-card p-6 sm:p-8 mb-8 border-purple-500/20 bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <span className="badge-admin">
                <ShieldCheck className="w-3 h-3" />
                System Administration Console
              </span>

              <span className="text-xs text-slate-400">
                Root Control Level
              </span>

            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Administrator Hub — {user?.name || "Admin"} ⚡
            </h1>

            <p className="text-slate-300 text-sm mt-1">
              Monitor services, queues, system health, and backend status.
            </p>

          </div>

          <button
            onClick={refreshDashboard}
            disabled={refreshing}
            className="btn-secondary text-xs !py-2.5 !px-4"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1.5 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing ? "Refreshing..." : "Refresh"}

          </button>

        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-2">

          <AlertCircle className="w-5 h-5" />

          {error}

        </div>
      )}

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        {/* Services */}
        <div className="glass-card p-5 border-slate-800">

          <div className="flex items-center justify-between text-slate-400 mb-2">

            <span className="text-xs font-semibold uppercase">
              Active Services
            </span>

            <Layers className="w-4 h-4 text-indigo-400" />

          </div>

          <div className="text-2xl font-extrabold text-indigo-400">
            {totalServices}
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Services configured
          </p>

        </div>

        {/* Waiting */}
        <div className="glass-card p-5 border-slate-800">

          <div className="flex items-center justify-between text-slate-400 mb-2">

            <span className="text-xs font-semibold uppercase">
              Queue Waiting
            </span>

            <Users className="w-4 h-4 text-cyan-400" />

          </div>

          <div className="text-2xl font-extrabold text-cyan-400">
            {totalWaiting}
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Customers currently waiting
          </p>

        </div>

        {/* API */}
        <div className="glass-card p-5 border-slate-800">

          <div className="flex items-center justify-between text-slate-400 mb-2">

            <span className="text-xs font-semibold uppercase">
              API Health
            </span>

            <Server className="w-4 h-4 text-emerald-400" />

          </div>

          <div
            className={`text-2xl font-extrabold ${
              apiOnline ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {apiOnline ? "ONLINE" : "OFFLINE"}
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Backend API status
          </p>

        </div>

        {/* Database */}
        <div className="glass-card p-5 border-slate-800">

          <div className="flex items-center justify-between text-slate-400 mb-2">

            <span className="text-xs font-semibold uppercase">
              Database
            </span>

            <Database className="w-4 h-4 text-purple-400" />

          </div>

          <div
            className={`text-2xl font-extrabold ${
              databaseHealthy
                ? "text-emerald-400"
                : "text-yellow-400"
            }`}
          >
            {databaseHealthy ? "HEALTHY" : "ACTIVE"}
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Database connection
          </p>

        </div>

      </div>

      {/* Service Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Service Table */}
        <div className="lg:col-span-2">

          <div className="glass-card p-6">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-lg font-bold text-white">
                  Service Queue Overview
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Current queue information from the backend
                </p>

              </div>

              <span className="text-xs text-purple-400 font-semibold">
                Live Data
              </span>

            </div>

            {services.length === 0 ? (

              <div className="text-center py-10">

                <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />

                <p className="text-sm text-slate-400">
                  No services available.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead>

                    <tr className="border-b border-slate-800 text-slate-400">

                      <th className="pb-3">
                        Service
                      </th>

                      <th className="pb-3">
                        Prefix
                      </th>

                      <th className="pb-3">
                        Waiting
                      </th>

                      <th className="pb-3">
                        Avg. Time
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {services.map((service) => (

                      <tr
                        key={service.id}
                        className="border-b border-slate-800/60 text-slate-300"
                      >

                        <td className="py-4 font-medium text-white">
                          {service.name}
                        </td>

                        <td className="py-4 font-mono font-bold text-cyan-400">
                          {service.prefix || "-"}
                        </td>

                        <td className="py-4">
                          {service.active_tokens_count ||
                            service.waiting_count ||
                            0}
                        </td>

                        <td className="py-4">
                          {service.average_service_time || 0} min
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

        {/* System Status */}
        <div className="space-y-6">

          <div className="glass-card p-6">

            <h3 className="text-sm font-bold text-white mb-5">
              System Status
            </h3>

            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Activity className="w-4 h-4 text-emerald-400" />

                  <span className="text-sm text-slate-300">
                    Backend API
                  </span>

                </div>

                <span className="text-xs text-emerald-400 font-semibold">
                  {apiOnline ? "Online" : "Offline"}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Database className="w-4 h-4 text-cyan-400" />

                  <span className="text-sm text-slate-300">
                    Database
                  </span>

                </div>

                <span className="text-xs text-emerald-400 font-semibold">
                  {databaseHealthy ? "Healthy" : "Active"}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Layers className="w-4 h-4 text-indigo-400" />

                  <span className="text-sm text-slate-300">
                    Queue Services
                  </span>

                </div>

                <span className="text-xs text-indigo-400 font-semibold">
                  {totalServices} Active
                </span>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Users className="w-4 h-4 text-purple-400" />

                  <span className="text-sm text-slate-300">
                    Waiting Customers
                  </span>

                </div>

                <span className="text-xs text-purple-400 font-semibold">
                  {totalWaiting}
                </span>

              </div>

            </div>

          </div>

          {/* Admin Info */}
          <div className="glass-card p-6 border-purple-500/20 bg-purple-950/20">

            <div className="flex items-center gap-2 mb-3">

              <Sparkles className="w-4 h-4 text-purple-400" />

              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Administrator
              </h4>

            </div>

            <div className="space-y-2 text-xs">

              <div className="flex justify-between">

                <span className="text-slate-400">
                  Name
                </span>

                <span className="text-slate-200 font-semibold">
                  {user?.name || "Admin"}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-400">
                  Email
                </span>

                <span className="text-slate-200 font-semibold">
                  {user?.email || "Not available"}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-400">
                  Role
                </span>

                <span className="text-purple-400 font-semibold">
                  {user?.role || "ADMIN"}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Completion Status */}
      <div className="glass-card p-6 mt-8 border-emerald-500/20 bg-emerald-950/10">

        <div className="flex items-start gap-3">

          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />

          <div>

            <h3 className="text-sm font-bold text-white">
              Admin Dashboard Connected
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Service information and system health are now being loaded
              directly from your backend APIs instead of using demo data.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;