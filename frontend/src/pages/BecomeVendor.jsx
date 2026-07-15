import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { showError as showToastError } from "../utils/toast";

function BecomeVendor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Business Info
    businessName: "",
    businessDescription: "",
    // Service Details
    serviceCategory: "",
    experience: "",
    servicesOffered: [],
    minPrice: "",
    maxPrice: "",
    pricingModel: "package",
    // Contact
    contactPhone: "",
    contactEmail: "",
    website: "",
    instagram: "",
    facebook: "",
    // Location
    city: "",
    state: "",
    serviceAreas: "",
    // Terms
    termsAccepted: false,
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const steps = [
    { id: 1, title: "Business Info", description: "Basic details about your business" },
    { id: 2, title: "Services", description: "What services do you offer" },
    { id: 3, title: "Contact", description: "How clients can reach you" },
    { id: 4, title: "Location", description: "Where you operate" },
    { id: 5, title: "Review", description: "Review and submit" },
  ];

  useEffect(() => {
    checkApplicationStatus();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(false);
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (!res.ok) {
        throw new Error("Failed to load categories");
      }
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        throw new Error("Failed to load categories");
      }
    } catch (err) {
      setCategoriesError(true);
      showToastError("Failed to load categories. Please try again.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/application-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.status === "success") {
        setApplicationStatus(data.vendorApplication);
      }
    } catch (err) {
      console.error("Failed to fetch status");
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

  const handleServicesChange = (service) => {
    setFormData((prev) => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter((s) => s !== service)
        : [...prev.servicesOffered, service],
    }));
  };

  const validateStep = () => {
    setError("");
    switch (currentStep) {
      case 1:
        if (!formData.businessName || formData.businessName.length < 2) {
          setError("Business name must be at least 2 characters");
          return false;
        }
        if (!formData.businessDescription || formData.businessDescription.length < 50) {
          setError("Business description must be at least 50 characters");
          return false;
        }
        break;
      case 2:
        if (!formData.serviceCategory) {
          setError("Please select a service category");
          return false;
        }
        if (!formData.experience || formData.experience < 0) {
          setError("Please enter valid years of experience");
          return false;
        }
        if (formData.servicesOffered.length === 0) {
          setError("Please select at least one service");
          return false;
        }
        if (!formData.minPrice || !formData.maxPrice) {
          setError("Please enter your price range");
          return false;
        }
        break;
      case 3:
        if (!formData.contactPhone) {
          setError("Contact phone is required");
          return false;
        }
        if (!formData.contactEmail) {
          setError("Contact email is required");
          return false;
        }
        break;
      case 4:
        if (!formData.city || !formData.state) {
          setError("City and state are required");
          return false;
        }
        break;
      case 5:
        if (!formData.termsAccepted) {
          setError("You must accept the terms and conditions");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      // Format data for new VendorApplication model
      const applicationData = {
        businessInfo: {
          name: formData.businessName,
          description: formData.businessDescription,
        },
        serviceDetails: {
          category: formData.serviceCategory,
          experience: parseInt(formData.experience),
          servicesOffered: formData.servicesOffered,
          pricing: {
            minPrice: parseFloat(formData.minPrice),
            maxPrice: parseFloat(formData.maxPrice),
            pricingModel: formData.pricingModel,
          },
        },
        contact: {
          phone: formData.contactPhone,
          email: formData.contactEmail,
          website: formData.website,
          socialMedia: {
            instagram: formData.instagram,
            facebook: formData.facebook,
          },
        },
        location: {
          city: formData.city,
          state: formData.state,
          serviceAreas: formData.serviceAreas.split(",").map((s) => s.trim()).filter(Boolean),
        },
        termsAccepted: formData.termsAccepted,
      };

      const res = await fetch(`${API_URL}/api/auth/apply-vendor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(applicationData),
      });

      const data = await res.json();
      if (data.status === "success") {
        setSuccess("Application submitted successfully! We will review it shortly.");
        setApplicationStatus(data.vendorApplication);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const serviceOptions = [
    "Wedding Photography",
    "Pre-Wedding Shoots",
    "Candid Photography",
    "Traditional Photography",
    "Album Design",
    "Photo Editing",
    "Drone Photography",
    "Cinematography",
    "Highlight Reels",
    "Live Streaming",
  ];

  const pakistaniProvinces = [
    "Punjab",
    "Sindh",
    "Khyber Pakhtunkhwa",
    "Balochistan",
    "Islamabad Capital Territory",
    "Azad Jammu and Kashmir",
    "Gilgit-Baltistan",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Already a vendor
  if (currentUser.role === "vendor") {
    return (
      <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-white rounded-luxury-xl shadow-soft p-12 border border-stone-100">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-slate-800 mb-4">You're Already a Vendor!</h1>
            <p className="text-stone-500 mb-6">
              You already have a vendor account. Go to your dashboard to manage your profile and bookings.
            </p>
            <Link
              to="/vendor"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              Go to Vendor Dashboard
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Application under review
  if (applicationStatus?.status === "submitted" || applicationStatus?.status === "under_review" || applicationStatus?.status === "pending") {
    return (
      <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-white rounded-luxury-xl shadow-soft p-12 border border-stone-100">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-slate-800 mb-4">Application Under Review</h1>
            <p className="text-stone-500 mb-4">Your vendor application is currently being reviewed by our team.</p>

            {/* Status Timeline */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-emerald-600">Submitted</span>
              </div>
              <div className="w-8 h-0.5 bg-amber-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="ml-2 text-sm text-amber-600">Under Review</span>
              </div>
              <div className="w-8 h-0.5 bg-stone-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-stone-400">Approved</span>
              </div>
            </div>

            <div className="bg-warm-50 rounded-xl p-4 text-left mb-6">
              <p className="text-sm text-stone-600">
                <strong>Business Name:</strong> {applicationStatus.businessInfo?.name || applicationStatus.businessName}
              </p>
              <p className="text-sm text-stone-600 mt-2">
                <strong>Category:</strong> {applicationStatus.serviceDetails?.category || applicationStatus.serviceCategory}
              </p>
              <p className="text-sm text-stone-600 mt-2">
                <strong>Applied:</strong> {new Date(applicationStatus.submittedAt || applicationStatus.appliedAt).toLocaleDateString()}
              </p>
            </div>
            <p className="text-sm text-stone-400">We'll notify you via email once your application is reviewed.</p>
          </div>
        </div>
      </section>
    );
  }

  // Documents pending
  if (applicationStatus?.status === "documents_pending") {
    return (
      <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-white rounded-luxury-xl shadow-soft p-12 border border-stone-100">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-slate-800 mb-4">Additional Documents Required</h1>
            <p className="text-stone-500 mb-4">We need some additional documents to complete your verification.</p>
            {applicationStatus.review?.reviewNotes && (
              <div className="bg-blue-50 rounded-xl p-4 text-left mb-6">
                <p className="text-sm text-blue-700">
                  <strong>Required:</strong> {applicationStatus.review.reviewNotes}
                </p>
              </div>
            )}
            <p className="text-sm text-stone-400">Please contact support to submit the required documents.</p>
          </div>
        </div>
      </section>
    );
  }

  // Application rejected
  if (applicationStatus?.status === "rejected") {
    return (
      <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-white rounded-luxury-xl shadow-soft p-12 border border-stone-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-slate-800 mb-4">Application Not Approved</h1>
            <p className="text-stone-500 mb-4">Unfortunately, your vendor application was not approved.</p>
            {(applicationStatus.review?.rejectionReason || applicationStatus.rejectionReason) && (
              <div className="bg-red-50 rounded-xl p-4 text-left mb-6">
                <p className="text-sm text-red-600">
                  <strong>Reason:</strong> {applicationStatus.review?.rejectionReason || applicationStatus.rejectionReason}
                </p>
              </div>
            )}
            <p className="text-sm text-stone-400 mb-4">You may reapply after 30 days.</p>
            <p className="text-sm text-stone-400">Please contact support if you have questions.</p>
          </div>
        </div>
      </section>
    );
  }

  // Multi-step application form
  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">Join Our Platform</span>
          <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mt-2">Become a Vendor</h1>
          <p className="text-stone-500 mt-4 max-w-lg mx-auto">
            Join our network of trusted wedding vendors and reach thousands of couples.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                      currentStep >= step.id
                        ? "bg-orange-500 text-white"
                        : "bg-stone-200 text-stone-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center hidden md:block text-stone-500">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${currentStep > step.id ? "bg-orange-500" : "bg-stone-200"}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-luxury-xl shadow-soft p-8 border border-stone-100">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}
          {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Business Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-slate-800 mb-4">Business Information</h2>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">Business Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Your business or brand name"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">
                    Business Description * <span className="text-stone-400">(min 50 characters)</span>
                  </label>
                  <textarea
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us about your services, experience, and what makes you unique..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-stone-400 mt-1">{formData.businessDescription.length}/50 characters</p>
                </div>
              </div>
            )}

            {/* Step 2: Services */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-slate-800 mb-4">Service Details</h2>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">Service Category *</label>
                  {categoriesError ? (
                    <div className="flex items-center gap-2">
                      <select disabled className="flex-1 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 outline-none">
                        <option>Error loading categories</option>
                      </select>
                      <button
                        type="button"
                        onClick={fetchCategories}
                        disabled={categoriesLoading}
                        className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        {categoriesLoading ? "..." : "Retry"}
                      </button>
                    </div>
                  ) : (
                    <select
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleChange}
                      disabled={categoriesLoading}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all disabled:opacity-50"
                      required
                    >
                      <option value="">{categoriesLoading ? "Loading categories..." : "Select a category"}</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">Years of Experience *</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    placeholder="e.g., 5"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">Services Offered *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {serviceOptions.map((service) => (
                      <label key={service} className="flex items-center gap-2 p-3 rounded-lg border border-stone-200 hover:bg-warm-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.servicesOffered.includes(service)}
                          onChange={() => handleServicesChange(service)}
                          className="w-4 h-4 text-orange-500 rounded"
                        />
                        <span className="text-sm text-slate-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Min Price (Rs.) *</label>
                    <input
                      type="number"
                      name="minPrice"
                      value={formData.minPrice}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g., 25000"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Max Price (Rs.) *</label>
                    <input
                      type="number"
                      name="maxPrice"
                      value={formData.maxPrice}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g., 100000"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">Pricing Model</label>
                  <select
                    name="pricingModel"
                    value={formData.pricingModel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                  >
                    <option value="package">Package Based</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="fixed">Fixed Price</option>
                    <option value="custom">Custom/Negotiable</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Contact */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-slate-800 mb-4">Contact Information</h2>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">Business Email *</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="business@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">Website (Optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Instagram</label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@yourusername"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Facebook</label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="facebook.com/yourpage"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Location */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-slate-800 mb-4">Location & Service Areas</h2>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Lahore"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                    required
                  >
                    <option value="">Select state</option>
                    {pakistaniProvinces.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">
                    Service Areas <span className="text-stone-400">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    name="serviceAreas"
                    value={formData.serviceAreas}
                    onChange={handleChange}
                    placeholder="e.g., Lahore, Karachi, Islamabad, Faisalabad"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                  />
                  <p className="text-xs text-stone-400 mt-1">List all cities/areas where you provide services</p>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-slate-800 mb-4">Review Your Application</h2>

                <div className="bg-warm-50 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-stone-400">Business Name</p>
                      <p className="text-slate-800 font-medium">{formData.businessName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">Experience</p>
                      <p className="text-slate-800 font-medium">{formData.experience} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">Price Range</p>
                      <p className="text-slate-800 font-medium">Rs. {formData.minPrice} - Rs. {formData.maxPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">Location</p>
                      <p className="text-slate-800 font-medium">{formData.city}, {formData.state}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">Phone</p>
                      <p className="text-slate-800 font-medium">{formData.contactPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">Email</p>
                      <p className="text-slate-800 font-medium">{formData.contactEmail}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Services Offered</p>
                    <p className="text-slate-800">{formData.servicesOffered.join(", ") || "None selected"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-500 rounded mt-1"
                  />
                  <label htmlFor="termsAccepted" className="text-sm text-stone-600">
                    I agree to the{" "}
                    <Link to="/terms" className="text-orange-600 hover:underline">Terms of Service</Link> and{" "}
                    <Link to="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>.
                    I confirm that all information provided is accurate.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-stone-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-stone-300 text-stone-600 rounded-xl hover:bg-stone-50 transition-all"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 shadow-soft"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default BecomeVendor;
