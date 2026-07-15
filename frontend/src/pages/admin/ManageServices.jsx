import { useEffect, useState } from "react";
import { API_URL } from "../../config/api";

function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "",
    details: "",
    image: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/services`);
      const data = await res.json();
      setServices(data.data || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load services");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ title: "", description: "", icon: "", details: "", image: "" });
    setEditingService(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setForm({
      title: service.title || "",
      description: service.description || "",
      icon: service.icon || "",
      details: service.details || "",
      image: service.image || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = editingService
        ? `${API_URL}/api/admin/services/${editingService._id}`
        : `${API_URL}/api/admin/services`;

      const res = await fetch(url, {
        method: editingService ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save service");
      }

      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      const res = await fetch(
        `${API_URL}/api/admin/services/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete service");
      }

      fetchServices();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
              Admin Panel
            </span>
            <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mt-2">
              Manage Services
            </h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-4"></div>
          </div>

          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-300"
          >
            + Add New Service
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-luxury-xl shadow-soft overflow-hidden border border-stone-100 hover:shadow-elegant transition-all duration-300"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{service.icon}</span>
                  <h3 className="font-serif font-semibold text-slate-800">
                    {service.title}
                  </h3>
                </div>
                <p className="text-sm text-stone-500 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(service)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-500">No services found</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-luxury-xl shadow-luxury-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-serif text-slate-800">
                  {editingService ? "Edit Service" : "Add New Service"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">
                      Service Title *
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-200/50 focus:border-violet-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">
                      Icon (emoji) *
                    </label>
                    <input
                      name="icon"
                      value={form.icon}
                      onChange={handleChange}
                      placeholder="e.g., 📸"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-200/50 focus:border-violet-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">
                    Image URL *
                  </label>
                  <input
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-200/50 focus:border-violet-400 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="2"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-200/50 focus:border-violet-400 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">
                    Details *
                  </label>
                  <textarea
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    rows="3"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-200/50 focus:border-violet-400 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-stone-100 text-slate-700 rounded-full font-medium hover:bg-stone-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full font-medium shadow-soft hover:shadow-soft-md transition-all disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingService
                      ? "Update"
                      : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ManageServices;
