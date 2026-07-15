import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config/api";

function VendorProfile() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    service: "",
    description: "",
    details: "",
    experience: "",
    price: "",
    location: "",
    image: "",
    contactPhone: "",
    contactEmail: "",
    contactWebsite: "",
    isAvailable: true,
    negotiable: true,
    minPrice: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/vendor/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.status === "success") {
        setVendor(data.vendor);
        setFormData({
          name: data.vendor.name || "",
          service: data.vendor.service || "",
          description: data.vendor.description || "",
          details: data.vendor.details || "",
          experience: data.vendor.experience || "",
          price: data.vendor.price || "",
          location: data.vendor.location || "",
          image: data.vendor.image || "",
          contactPhone: data.vendor.contact?.phone || "",
          contactEmail: data.vendor.contact?.email || "",
          contactWebsite: data.vendor.contact?.website || "",
          isAvailable: data.vendor.isAvailable ?? true,
          negotiable: data.vendor.pricing?.negotiable ?? true,
          minPrice: data.vendor.pricing?.minPrice || "",
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/vendor/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          service: formData.service,
          description: formData.description,
          details: formData.details,
          experience: formData.experience,
          price: Number(formData.price),
          location: formData.location,
          image: formData.image,
          contact: {
            phone: formData.contactPhone,
            email: formData.contactEmail,
            website: formData.contactWebsite,
          },
          isAvailable: formData.isAvailable,
          pricing: {
            negotiable: formData.negotiable,
            minPrice: formData.minPrice ? Number(formData.minPrice) : undefined,
          },
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setVendor(data.vendor);
        setSuccess("Profile updated successfully!");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/vendor"
            className="text-sm text-orange-600 hover:text-orange-700 mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mt-2">
            Edit Profile
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-4"></div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100">
            <h2 className="text-xl font-serif text-slate-800 mb-6">
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Service Type
                </label>
                <input
                  type="text"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Additional Details
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5+ years"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-4 w-48 h-32 object-cover rounded-xl"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100">
            <h2 className="text-xl font-serif text-slate-800 mb-6">Pricing</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Base Price (Rs.)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Minimum Price (Rs.)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleChange}
                  placeholder="Lowest you'll accept"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="negotiable"
                  checked={formData.negotiable}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-300"
                />
                <label className="text-sm text-stone-600">
                  Price is negotiable
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-300"
                />
                <label className="text-sm text-stone-600">
                  Currently available for bookings
                </label>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100">
            <h2 className="text-xl font-serif text-slate-800 mb-6">
              Contact Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="contactWebsite"
                  value={formData.contactWebsite}
                  onChange={handleChange}
                  placeholder="https://"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 shadow-soft"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default VendorProfile;
