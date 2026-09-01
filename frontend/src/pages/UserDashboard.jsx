import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import {
  ShieldCheck,
  Users,
  Layers,
  Activity,
  Database,
  Server,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save,
  X
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();

  const [healthStatus, setHealthStatus] = useState(null);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    prefix: '',
    description: '',
    average_service_time: 5,
    is_active: true
  });

  // ==========================================
  // Load Services
  // ==========================================

  const loadServices = async () => {
    try {
      const response = await api.get('/services/?all=true');
      setServices(response.data || []);
    } catch (err) {
      console.error('Failed to load services:', err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Unable to load services.'
      );
    }
  };

  // ==========================================
  // Load System Health
  // ==========================================

  const loadHealth = async () => {
    try {
      const response = await api.get('/health/');
      setHealthStatus(response.data);
    } catch (err) {
      console.error('Failed to load health:', err);
    }
  };

  // ==========================================
  // Load Dashboard
  // ==========================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      await Promise.all([
        loadServices(),
        loadHealth()
      ]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================
  // Form Change
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ==========================================
  // Open Create Form
  // ==========================================

  const openCreateForm = () => {
    setEditingService(null);

    setFormData({
      name: '',
      prefix: '',
      description: '',
      average_service_time: 5,
      is_active: true
    });

    setMessage('');
    setError('');
    setShowForm(true);
  };

  // ==========================================
  // Open Edit Form
  // ==========================================

  const openEditForm = (service) => {
    setEditingService(service);

    setFormData({
      name: service.name || '',
      prefix: service.prefix || '',
      description: service.description || '',
      average_service_time: service.average_service_time || 5,
      is_active: service.is_active
    });

    setMessage('');
    setError('');
    setShowForm(true);
  };

  // ==========================================
  // Close Form
  // ==========================================

  const closeForm = () => {
    setShowForm(false);
    setEditingService(null);
  };

  // ==========================================
  // Save Service
  // ==========================================

  const saveService = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const payload = {
        name: formData.name,
        prefix: formData.prefix,
        description: formData.description,
        average_service_time: Number(formData.average_service_time),
        is_active: formData.is_active
      };

      if (editingService) {
        await api.patch(
          `/services/${editingService.id}/`,
          payload
        );

        setMessage('Service updated successfully.');
      } else {
        await api.post('/services/', payload);

        setMessage('Service created successfully.');
      }

      closeForm();
      await loadServices();

    } catch (err) {
      console.error('Save service error:', err);

      const data = err.response?.data;

      if (data && typeof data === 'object') {
        const firstError = Object.values(data)[0];

        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : String(firstError)
        );
      } else {
        setError('Unable to save service.');
      }

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Delete Service
  // ==========================================

  const deleteService = async (service) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setMessage('');

      await api.delete(`/services/${service.id}/`);

      setMessage(
        `"${service.name}" deleted successfully.`
      );

      await loadServices();

    } catch (err) {
      console.error('Delete service error:', err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Unable to delete service.'
      );
    }
  };

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
            Fetching services and system information.
          </p>

        </div>

      </div>
    );
  }

  // ==========================================
  // Dashboard
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

            <