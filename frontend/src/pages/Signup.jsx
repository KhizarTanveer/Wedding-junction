import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config/api";
import { showError as showToastError } from "../utils/toast";

function Signup() {
  const navigate = useNavigate();

  // User type selection
  const [userType, setUserType] = useState("user"); // "user" or "vendor"
  const [currentStep, setCurrentStep] = useState(0); // 0=account, 1-5=vendor steps

  // Form data state
  const [formData, setFormData] = useState({
    // Basic signup
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Vendor fields
    businessName: "",
    businessDescription: "",
    serviceCategory: "",
    experience: "",
    servicesOffered: [],
    minPrice: "",
    maxPrice: "",
    pricingModel: "package",
    contactPhone: "",
    contactEmail: "",
    website: "",
    instagram: "",
    facebook: "",
    city: "",
    state: "",
    serviceAreas: "",
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);

  // Track if form is currently submitting to prevent double-click
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track category fetch retry count
  const [categoryRetryCount, setCategoryRetryCount] = useState(0);
  const MAX_CATEGORY_RETRIES = 3;

  // Fetch categories for vendor registration
  useEffect(() => {
    if (userType === "vendor") {
      fetchCategories();
    }
  }, [userType]);

  const fetchCategories = async (isRetry = false) => {
    setCategoriesLoading(true);
    setCategoriesError(false);

    // Track retries
    if (isRetry) {
      setCategoryRetryCount((prev) => prev + 1);
    } else {
      setCategoryRetryCount(0);
    }

    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (!res.ok) {
        throw new Error("Failed to load categories");
      }
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
        setCategoryRetryCount(0); // Reset on success
      } else {
        throw new Error("Failed to load categories");
      }
    } catch (err) {
      setCategoriesError(true);

      // Auto-retry up to MAX_CATEGORY_RETRIES times with exponential backoff
      const currentRetry = categoryRetryCount + (isRetry ? 1 : 0);
      if (currentRetry < MAX_CATEGORY_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, currentRetry), 5000);
        setTimeout(() => fetchCategories(true), delay);
      } else {
        showToastError("Failed to load categories. Please try again.");
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Pre-populate contact email when user selects vendor and enters email
  useEffect(() => {
    if (userType === "vendor" && formData.email && !formData.contactEmail) {
      setFormData((prev) => ({ ...prev, contactEmail: formData.email }));
    }
  }, [userType, formData.email]);

  const steps = [
    { id: 0, title: "Account", description: "Create your account" },
    { id: 1, title: "Business Info", description: "Basic details about your business" },
    { id: 2, title: "Services", description: "What services do you offer" },
    { id: 3, title: "Contact", description: "How clients can reach you" },
    { id: 4, title: "Location", description: "Where you operate" },
    { id: 5, title: "Review", description: "Review and submit" },
  ];

  const vendorSteps = steps.slice(1); // Steps 1-5 for progress indicator

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

  const validateStep = (step) => {
    setError("");
    switch (step) {
      case 0: // Account info
        if (!formData.name || formData.name.length < 2) {
          setError("Name must be at least 2 characters");
          return false;
        }
        if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        if (!formData.password || formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        break;
      case 1: // Business info
        if (!formData.businessName || formData.businessName.length < 2) {
          setError("Business name must be at least 2 characters");
          return false;
        }
        if (!formData.businessDescription || formData.businessDescription.length < 50) {
          setError("Business description must be at least 50 characters");
          return false;
        }
        break;
      case 2: // Services
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
        if (Number(formData.minPrice) > Number(formData.maxPrice)) {
          setError("Minimum price cannot be greater than maximum price");
          return false;
        }
        break;
      case 3: // Contact
        if (!formData.contactPhone) {
          setError("Contact phone is required");
          return false;
        }
        if (!formData.contactEmail || !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
          setError("Please enter a valid contact email");
          return false;
        }
        break;
      case 4: // Location
        if (!formData.city || !formData.state) {
          setError("City and state are required");
          return false;
        }
        break;
      case 5: // Review
        if (!formData.termsAccepted) {
          setError("You must accept the terms and conditions");
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const nextStep = () => {
    // Prevent double-click by checking submission state
    if (isSubmitting || loading) return;

    if (validateStep(currentStep)) {
      if (userType === "user" && currentStep === 0) {
        // Submit regular user signup
        handleSignup();
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, 5));
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();

    // Prevent double submission
    if (isSubmitting || loading) return;

    setError("");
    setIsSubmitting(true);

    // For vendor registration at final step
    if (userType === "vendor" && currentStep === 5) {
      if (!validateStep(5)) {
        setIsSubmitting(false);
        return;
      }
    }

    setLoading(true);

    try {
      // Build request body
      const requestBody = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      // Add vendor data if registering as vendor
      if (userType === "vendor") {
        requestBody.registerAsVendor = true;
        requestBody.vendorData = {
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
            serviceAreas: formData.serviceAreas
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
          termsAccepted: formData.termsAccepted,
        };
      }

      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        // Use generic error message to prevent email enumeration
        const genericErrors = ["email already exists", "email is already", "user already exists"];
        const isEnumerationRisk = genericErrors.some(e =>
          data.message?.toLowerCase().includes(e)
        );
        setError(isEnumerationRisk
          ? "Unable to create account. Please check your details and try again."
          : (data.message || "Signup failed"));
        setLoading(false);
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      // Redirect based on user type
      if (userType === "vendor") {
        navigate("/become-vendor"); // Show application status page
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Regular user signup form
  const renderAccountStep = () => (
    <>
      {/* User Type Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-slate-600 block mb-3">
          Register as
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setUserType("user");
              setCurrentStep(0);
            }}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              userType === "user"
                ? "border-orange-500 bg-orange-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                userType === "user" ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-500"
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-800">User</p>
                <p className="text-xs text-stone-500">Browse & book vendors</p>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setUserType("vendor");
              setCurrentStep(0);
            }}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              userType === "vendor"
                ? "border-orange-500 bg-orange-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                userType === "vendor" ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-500"
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-800">Vendor</p>
                <p className="text-xs text-stone-500">Offer wedding services</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="text-sm font-medium text-slate-600 block mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          placeholder="Your full name"
          value={formData.name}
          onChange={handleChange}
          className="input-luxury"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-medium text-slate-600 block mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          className="input-luxury"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="text-sm font-medium text-slate-600 block mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            className="input-luxury pr-16"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-500 hover:text-orange-600 transition-colors font-medium"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="text-sm font-medium text-slate-600 block mb-1.5">
          Confirm Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="input-luxury"
          required
        />
      </div>

      {/* Terms - Only show for regular users */}
      {userType === "user" && (
        <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-400 focus:ring-offset-0 mt-0.5"
            required
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" className="text-orange-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>
          </span>
        </label>
      )}
    </>
  );

  // Vendor Step 1: Business Info
  const renderBusinessInfoStep = () => (
    <div className="space-y-5">
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
  );

  // Vendor Step 2: Services
  const renderServicesStep = () => (
    <div className="space-y-5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
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
  );

  // Vendor Step 3: Contact
  const renderContactStep = () => (
    <div className="space-y-5">
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
  );

  // Vendor Step 4: Location
  const renderLocationStep = () => (
    <div className="space-y-5">
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
  );

  // Vendor Step 5: Review
  const renderReviewStep = () => (
    <div className="space-y-5">
      <h2 className="text-xl font-serif text-slate-800 mb-4">Review Your Application</h2>

      <div className="bg-warm-50 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-stone-400">Account Name</p>
            <p className="text-slate-800 font-medium">{formData.name}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400">Account Email</p>
            <p className="text-slate-800 font-medium">{formData.email}</p>
          </div>
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
            <p className="text-xs text-stone-400">Business Email</p>
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
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderAccountStep();
      case 1:
        return renderBusinessInfoStep();
      case 2:
        return renderServicesStep();
      case 3:
        return renderContactStep();
      case 4:
        return renderLocationStep();
      case 5:
        return renderReviewStep();
      default:
        return renderAccountStep();
    }
  };

  // Progress indicator for vendor steps
  const renderProgressSteps = () => {
    if (userType !== "vendor" || currentStep === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {vendorSteps.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium text-xs sm:text-sm transition-all ${
                    currentStep >= step.id
                      ? "bg-orange-500 text-white"
                      : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {currentStep > step.id ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-xs mt-2 text-center hidden sm:block text-stone-500">{step.title}</span>
              </div>
              {index < vendorSteps.length - 1 && (
                <div className={`flex-1 h-1 mx-1 sm:mx-2 ${currentStep > step.id ? "bg-orange-500" : "bg-stone-200"}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-champagne-50 flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-amber-100/40 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-orange-50/40 to-transparent pointer-events-none"></div>

      <div className={`bg-white shadow-luxury-lg rounded-luxury-xl p-6 sm:p-8 relative z-10 border border-stone-100 transition-all ${
        userType === "vendor" && currentStep > 0 ? "max-w-2xl w-full" : "max-w-md w-full"
      }`}>
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-400 rounded-xl flex items-center justify-center shadow-soft">
            <span className="font-serif text-slate-800 font-bold text-xl">W</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-800 mb-2">
            {currentStep === 0 ? "Create Account" : userType === "vendor" ? "Vendor Application" : "Create Account"}
          </h1>
          <p className="text-stone-500 text-sm">
            {currentStep === 0
              ? "Begin your wedding planning journey"
              : `Step ${currentStep} of 5: ${steps[currentStep].description}`}
          </p>
        </div>

        {/* Progress Steps */}
        {renderProgressSteps()}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 text-center animate-fade-up">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className={`flex ${currentStep > 0 ? "justify-between" : "justify-center"} mt-4`}>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-stone-300 text-stone-600 rounded-full hover:bg-stone-50 transition-all"
              >
                Previous
              </button>
            )}

            {userType === "user" || (userType === "vendor" && currentStep < 5) ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className={`px-8 py-3.5 rounded-full font-medium text-white transition-all duration-300 shadow-soft ${
                  loading
                    ? "bg-stone-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 hover:shadow-soft-md hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    {userType === "user" ? "Creating account..." : "Processing..."}
                  </span>
                ) : (
                  userType === "user" && currentStep === 0 ? "Create Account" : "Continue"
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3.5 rounded-full font-medium text-white transition-all duration-300 shadow-soft ${
                  loading
                    ? "bg-stone-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 hover:shadow-soft-md hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </button>
            )}
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-stone-200"></div>
          <span className="text-stone-400 text-xs uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-stone-200"></div>
        </div>

        {/* Footer */}
        <p className="text-center text-stone-600 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
