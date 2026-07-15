import { useEffect, useState } from "react";
import { API_URL } from "../../config/api";
import { showError as showToastError } from "../../utils/toast";

function ManageVendors() {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    service: "",
    category: "",
    image: "",
    description: "",
    details: "",
    experience: "",
    price: "",
    location: "",
    isFeatured: false,
    contact: { phone: "", email: "", website: "" },
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Use Promise.allSettled to handle partial failures
      const results = await Promise.allSettled([
        fetch(`${API_URL}/api/vendors`),
        fetch(`${API_URL}/api/categories`),
      ]);

      const errors = [];

      // Process vendors response
      if (results[0].status === "fulfilled") {
        const vendorsRes = results[0].value;
        if (vendorsRes.ok) {
          const vendorsData = await vendorsRes.json();
          setVendors(vendorsData.vendors || []);
        } else {
          errors.push("Failed to load vendors");
        }
      } else {
        errors.push("Failed to load vendors");
      }

      // Process categories response
      if (results[1].status === "fulfilled") {
        const categoriesRes = results[1].value;
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        } else {
          errors.push("Failed to load categories");
        }
      } else {
        errors.push("Failed to load categories");
      }

      if (errors.length > 0) {
        setError(errors.join(". "));
      }
    } catch (err) {
      setError("Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("contact.")) {
      const contactField = name.split(".")[1];
      setForm({
        ...form,
        contact: { ...form.contact, [contactField]: value },
      });
    } else {
      setForm({
        ...form,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      service: "",
      category: "",
      image: "",
      description: "",
      details: "",
      experience: "",
      price: "",
      location: "",
      isFeatured: false,
      contact: { phone: "", email: "", website: "" },
    });
    setEditingVendor(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (vendor) => {
    setEditingVendor(vendor);
    setForm({
      name: vendor.name || "",
      service: vendor.service || "",
      category: vendor.category?._id || vendor.category || "",
      image: vendor.image || "",
      description: vendor.description || "",
      details: vendor.details || "",
      experience: vendor.experience || "",
      price: vendor.price || "",
      location: vendor.location || "",
      isFeatured: vendor.isFeatured || false,
      contact: {
        phone: vendor.contact?.phone || "",
        email: vendor.contact?.email || "",
        website: vendor.contact?.website || "",
      },
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = editingVendor
        ? `${API_URL}/api/admin/vendors/${editingVendor._id}`
        : `${API_URL}/api/admin/vendors`;

      const res = await fetch(url, {
        method: editingVendor ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save vendor");
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const res = await fetch(
        `${API_URL}/api/admin/vendors/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete vendor");
      }

      fetchData();
    } catch (err) {
      showToastError(err.message || "Failed to delete vendor");
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.service.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading vendors...</p>
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
              Manage Vendors
            </h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-4"></div>
          </div>

          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-full font-medium shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-300"
          >
            + Add New Vendor
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-200/50 focus:border-orange-400 transition-all"
          />
        </div>

        {/* Vendors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor._id}
              className="bg-white rounded-luxury-xl shadow-soft overflow-hidden border border-stone-100 hover:shadow-elegant transition-all duration-300"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif font-semibold text-slate-800">
                    {vendor.name}
                  </h3>
                  {vendor.isFeatured && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-500 mb-1">{vendor.service}</p>
                <p className="text-orange-600 font-medium">
                  Rs. {vendor.price?.toLocaleString("en-IN")}
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(vendor)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vendor._id)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-500">No vendors found</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-luxury-xl shadow-luxury-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-serif text-slate-800">
                  {editingVendor ? "Edit Vendor" : "Add New Vendor"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Vendor Name *"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Service Type *"
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    placeholder="e.g., Photography"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-200/50 focus:border-orange-400 transition-all"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Price (Rs.) *"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Input
                  label="Image URL *"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />

                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-200/50 focus:border-orange-400 transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Experience"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g., 10+ Years"
                  />
                  <Input
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g., Lahore, Pakistan"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    label="Phone"
                    name="contact.phone"
                    value={form.contact.phone}
                    onChange={handleChange}
                  />
                  <Input
                    label="Email"
                    name="contact.email"
                    type="email"
                    value={form.contact.email}
                    onChange={handleChange}
                  />
                  <Input
                    label="Website"
                    name="contact.website"
                    value={form.contact.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-sm text-slate-700"
                  >
                    Featured Vendor (show on homepage)
                  </label>
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full font-medium shadow-soft hover:shadow-soft-md transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingVendor ? "Update" : "Create"}
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

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-600 block mb-1.5">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-200/50 focus:border-orange-400 transition-all"
      />
    </div>
  );
}

export default ManageVendors;
