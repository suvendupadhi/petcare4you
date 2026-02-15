import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { tipService, serviceTypeService, Tip, ServiceType } from '../services/petCareService';
import { Plus, Edit2, Trash2, Check, X, Info } from 'lucide-react';

export default function TipsManagementPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [formData, setFormData] = useState<Partial<Tip>>({
    title: '',
    content: '',
    serviceTypeId: undefined,
    userRoleId: undefined,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tipsData, serviceTypesData] = await Promise.all([
        tipService.getTips(undefined, true),
        serviceTypeService.getServiceTypes()
      ]);
      setTips(tipsData);
      setServiceTypes(serviceTypesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tip: Tip | null = null) => {
    if (tip) {
      setEditingTip(tip);
      setFormData({
        title: tip.title,
        content: tip.content,
        serviceTypeId: tip.serviceTypeId,
        userRoleId: tip.userRoleId,
        isActive: tip.isActive
      });
    } else {
      setEditingTip(null);
      setFormData({
        title: '',
        content: '',
        serviceTypeId: undefined,
        userRoleId: undefined,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTip) {
        await tipService.updateTip(editingTip.id, formData);
      } else {
        await tipService.createTip(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving tip:', error);
      alert('Failed to save tip');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tip?')) {
      try {
        await tipService.deleteTip(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting tip:', error);
        alert('Failed to delete tip');
      }
    }
  };

  const toggleStatus = async (tip: Tip) => {
    try {
      await tipService.updateTip(tip.id, { ...tip, isActive: !tip.isActive });
      fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  return (
    <Layout title="Tips Management">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pet Care Tips</h1>
            <p className="text-slate-500">Configure educational tips shown to users</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 transition-colors"
          >
            <Plus size={20} />
            Add New Tip
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ${
                  !tip.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                      {tip.serviceTypeId ? (
                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-md font-bold">
                          {serviceTypes.find(st => st.id === tip.serviceTypeId)?.name || 'Service'}
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-md font-bold">
                          General
                        </span>
                      )}
                      {tip.userRoleId === 1 && (
                        <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-md font-bold">
                          Owner
                        </span>
                      )}
                      {tip.userRoleId === 2 && (
                        <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-md font-bold">
                          Provider
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleStatus(tip)}
                      className={`p-1 rounded-full ${
                        tip.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                      }`}
                      title={tip.isActive ? 'Active' : 'Inactive'}
                    >
                      {tip.isActive ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{tip.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-4">{tip.content}</p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    onClick={() => handleOpenModal(tip)}
                    className="p-2 text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(tip.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingTip ? 'Edit Tip' : 'Add New Tip'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter tip title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Enter tip content"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Target Role</label>
                    <select
                      value={formData.userRoleId || ''}
                      onChange={(e) => setFormData({ ...formData, userRoleId: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">All Roles</option>
                      <option value="1">Pet Owners</option>
                      <option value="2">Service Providers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Service Category</label>
                    <select
                      value={formData.serviceTypeId || ''}
                      onChange={(e) => setFormData({ ...formData, serviceTypeId: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">General</option>
                      {serviceTypes.map((st) => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 accent-orange-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
                    Visible to users
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    {editingTip ? 'Update Tip' : 'Create Tip'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
