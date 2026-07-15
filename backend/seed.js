require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Category = require("./models/category");
const Vendor = require("./models/vendor");
const Service = require("./models/service");
const User = require("./models/user");

// ============ CATEGORY DATA ============
const categoriesData = [
  {
    name: "Venues",
    description:
      "Discover breathtaking venues that set the perfect stage for your celebration.",
    image:
      "https://i.pinimg.com/474x/89/de/b1/89deb160439103ca0eeffefdbec7a8b1.jpg",
    details: {
      highlights: [
        "Luxury indoor and outdoor venues",
        "Custom decoration options",
        "Ample parking and accommodation",
        "Easy booking and coordination",
      ],
      services: [
        "Venue booking & coordination",
        "Seating arrangements",
        "Theme-based decoration",
        "Lighting & sound setup",
      ],
      whyChoose: [
        "Professional venue management",
        "Verified & trusted venues",
        "Flexible booking options",
        "Excellent customer support",
      ],
      testimonial:
        "The venue was stunning and everything went smoothly. Truly made our wedding day perfect! — Sarah & James",
    },
  },
  {
    name: "Catering",
    description:
      "Exquisite culinary experiences crafted by award-winning chefs.",
    image:
      "https://nishathotels.com/wp-content/uploads/2025/10/Wedding-catering-image.-570-x-380-px-min.png",
    details: {
      highlights: [
        "Customizable menu options",
        "Live cooking stations",
        "Dessert and beverage bars",
        "On-site service staff",
      ],
      services: [
        "Full course catering",
        "Dessert & beverage stations",
        "Special dietary options",
        "Live chef stations",
      ],
      whyChoose: [
        "High-quality ingredients",
        "Professional chefs",
        "Tailored menus",
        "Perfect for all event sizes",
      ],
      testimonial:
        "The food was delicious and beautifully presented. Guests were raving! — Aisha & Omar",
    },
  },
  {
    name: "Photography",
    description: "Timeless moments captured by master photographers.",
    image:
      "https://store.bandccamera.com/cdn/shop/articles/wedding-photography-tips-for-beginners-514217.png?v=1689877858",
    details: {
      highlights: [
        "Pre-wedding and wedding shoots",
        "Drone and cinematic coverage",
        "Photo albums and video editing",
        "Instant photo booth setup",
      ],
      services: [
        "Pre-wedding photoshoots",
        "Full-day wedding coverage",
        "Professional video editing",
        "Drone & cinematic shots",
      ],
      whyChoose: [
        "Experienced photographers",
        "High-resolution images",
        "Quick delivery",
        "Creative storytelling",
      ],
      testimonial:
        "The photos were breathtaking and captured every emotion perfectly. — Fatima & Ali",
    },
  },
  {
    name: "Makeup",
    description:
      "Professional beauty artistry to make you radiate on your special day.",
    image:
      "https://i.pinimg.com/736x/e8/23/5f/e8235fce034c01ca33ca9d81ca28c437.jpg",
    details: {
      highlights: [
        "HD & Airbrush makeup",
        "Trial sessions available",
        "Hairstyling and draping",
        "Skin prep and consultation",
      ],
      services: [
        "Bridal & groom makeup",
        "Hairstyling services",
        "Trial sessions",
        "Skincare prep",
      ],
      whyChoose: [
        "Professional artists",
        "Premium products",
        "Custom styles",
        "On-time service",
      ],
      testimonial:
        "I felt like a princess! The makeup stayed perfect all day. — Zara",
    },
  },
  {
    name: "Decor",
    description:
      "Transform your venue into a magical wonderland with stunning decor.",
    image:
      "https://flowerbouquet.pk/cdn/shop/files/Magical_Wedding_Lights_Over_Outdoor_Dining_Area.jpg?v=1736922563&width=1445",
    details: {
      highlights: [
        "Floral and theme decorations",
        "Stage and lighting design",
        "Table and centerpiece arrangements",
        "Custom color palettes",
      ],
      services: [
        "Floral arrangements",
        "Stage & backdrop design",
        "Lighting & sound decoration",
        "Theme-based table setups",
      ],
      whyChoose: [
        "Creative decor team",
        "Attention to detail",
        "Customized designs",
        "Reliable & timely setup",
      ],
      testimonial:
        "The decor made our venue magical! Everyone was impressed. — Hina & Sameer",
    },
  },
];

// ============ SERVICE DATA ============
const servicesData = [
  {
    title: "Wedding Planning",
    description:
      "From concept to execution, our expert planners make your wedding seamless and memorable.",
    icon: "💍",
    details:
      "Our wedding planning service covers everything from initial concept, venue selection, theme design, vendor coordination, and day-of management.",
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Catering & Menu",
    description:
      "Customized menus with exquisite cuisine to delight every guest.",
    icon: "🍽️",
    details:
      "We provide curated menus, live stations, gourmet dishes, and personalized culinary experiences.",
    image:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Photography & Videography",
    description: "Capture every magical moment with cinematic storytelling.",
    icon: "📸",
    details:
      "Professional photography and videography with cinematic edits and full-day coverage.",
    image:
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Makeup & Styling",
    description: "Customized bridal makeup and styling services.",
    icon: "💄",
    details:
      "Personalized consultations, trial sessions, bridal makeup, hair styling, and on-site touch-ups.",
    image:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80",
  },
];

// ============ FEATURED VENDORS DATA ============
const featuredVendorsData = [
  {
    name: "Elegant Weddings",
    service: "Wedding Planner",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    description:
      "Professional wedding planners making your dream day seamless and unforgettable.",
    details:
      "Elegant Weddings specializes in luxury wedding planning. From venue selection to decor, we ensure every moment is magical. Our team coordinates vendors, timelines, and personal touches to create an unforgettable experience for you and your guests.",
    experience: "10+ years of experience in planning luxury weddings worldwide.",
    servicesOffered: [
      "Full wedding planning",
      "Venue & vendor coordination",
      "Theme & decor design",
      "On-the-day management",
      "Destination weddings",
    ],
    price: 75000,
    contact: {
      phone: "+1 555-123-4567",
      email: "contact@elegantweddings.com",
      website: "www.elegantweddings.com",
    },
    location: "Karachi",
    rating: 5,
    isFeatured: true,
    reviews: [
      {
        name: "Ayesha K.",
        rating: 5,
        comment: "Absolutely loved their service! Highly professional.",
      },
      {
        name: "Ali R.",
        rating: 4,
        comment: "Great planning and attention to detail.",
      },
    ],
  },
  {
    name: "Memory Lens",
    service: "Photography & Videography",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    description:
      "Capture your magical moments with artistic photography and cinematic videos.",
    details:
      "Memories Captured offers professional wedding photography services. We focus on storytelling, capturing genuine emotions, candid moments, and every detail that makes your day unique.",
    experience: "8+ years capturing weddings, portraits, and events globally.",
    servicesOffered: [
      "Pre-wedding photoshoots",
      "Candid & traditional photography",
      "Drone videography",
      "Photo albums & prints",
      "Destination weddings coverage",
    ],
    price: 50000,
    contact: {
      phone: "+1 555-987-6543",
      email: "info@memorylens.com",
      website: "www.memorylens.com",
    },
    location: "Lahore",
    rating: 4,
    isFeatured: true,
    reviews: [
      {
        name: "Sara T.",
        rating: 5,
        comment: "Amazing photography, very professional!",
      },
      {
        name: "Bilal S.",
        rating: 4,
        comment: "Great quality videos and photos.",
      },
    ],
  },
  {
    name: "Bloom Decor",
    service: "Florist & Decor",
    image:
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=800&q=80",
    description:
      "Beautiful floral arrangements and décor that transform your wedding venue.",
    details:
      "Bloom Florist creates exquisite floral arrangements tailored to your wedding theme. From bouquets to table centerpieces, our designs bring elegance and fragrance to your celebration.",
    experience: "7+ years designing bespoke floral arrangements.",
    servicesOffered: [
      "Bouquets & boutonnières",
      "Table & altar arrangements",
      "Floral installations",
      "Seasonal & exotic flowers",
      "Delivery & setup on wedding day",
    ],
    price: 60000,
    contact: {
      phone: "+1 555-246-8102",
      email: "contact@bloomdecor.com",
      website: "www.bloomdecor.com",
    },
    location: "Islamabad",
    rating: 5,
    isFeatured: true,
    reviews: [
      {
        name: "Sania H.",
        rating: 5,
        comment: "Stunning floral arrangements!",
      },
      {
        name: "Fahad A.",
        rating: 5,
        comment: "Loved their decoration style, very elegant.",
      },
    ],
  },
  {
    name: "Sweet Delights",
    service: "Cake Designer",
    image:
      "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80",
    description:
      "Custom-designed wedding cakes that are as delicious as they are beautiful.",
    details:
      "Sweet Delights specializes in custom wedding cakes and desserts. Our creations combine taste and visual appeal, ensuring your cake is the centerpiece of your celebration.",
    experience: "5+ years in bespoke cake design with international clients.",
    servicesOffered: [
      "Wedding & special occasion cakes",
      "Themed cake designs",
      "Dietary options (gluten-free, vegan)",
      "Cupcakes & dessert tables",
    ],
    price: 25000,
    contact: {
      phone: "+1 555-369-1470",
      email: "contact@sweetdelights.com",
      website: "www.sweetdelights.com",
    },
    location: "Karachi",
    rating: 4,
    isFeatured: true,
    reviews: [
      {
        name: "Hina K.",
        rating: 5,
        comment: "Delicious cakes, beautifully decorated!",
      },
      {
        name: "Omar R.",
        rating: 4,
        comment: "Perfect taste and design.",
      },
    ],
  },
  {
    name: "DJ Vibes",
    service: "Music & Entertainment",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    description:
      "Create an unforgettable atmosphere with professional DJs and live music.",
    details:
      "Party Beats brings energy and fun to your wedding with professional DJ and live music services. We curate playlists, handle sound systems, and ensure your dance floor is always full.",
    experience: "10+ years of entertaining at weddings, parties, and events.",
    servicesOffered: [
      "Custom DJ playlists",
      "Live music & bands",
      "Sound & lighting setup",
      "Dance floor management",
      "Corporate & private events",
    ],
    price: 40000,
    contact: {
      phone: "+1 555-741-2580",
      email: "info@djvibes.com",
      website: "www.djvibes.com",
    },
    location: "Lahore",
    rating: 5,
    isFeatured: true,
    reviews: [
      {
        name: "Tariq A.",
        rating: 5,
        comment: "Amazing DJ, party was lit!",
      },
      {
        name: "Sadia P.",
        rating: 5,
        comment: "Perfect entertainment for our wedding.",
      },
    ],
  },
];

// ============ CATEGORY VENDORS DATA ============
const categoryVendorsData = {
  Venues: [
    {
      name: "Royal Palace Hall",
      image:
        "https://cdn0.weddingwire.com/vendor/526481/3_2/960/jpg/image-6487327-007_51_184625-170673085525439.jpeg",
      description: "Luxurious palace-style hall with grand interiors.",
      price: 500000,
      contact: { phone: "+92 300 1111111", email: "royalpalace@weddings.pk" },
      location: "Karachi",
      rating: 5,
    },
    {
      name: "Garden Paradise",
      image:
        "https://mindy-weiss.s3.amazonaws.com/wp-content/uploads/2022/08/26161830/003-garden-party-wedding-ceremony-decor.jpg",
      description: "Outdoor garden venue with floral arrangements.",
      price: 350000,
      contact: { phone: "+92 300 2222222", email: "gardenparadise@weddings.pk" },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Beachside Bliss",
      image:
        "https://www.brides.com/thmb/X8rjp6wjPSxR2pr7KLxIme9ooMk%3D/1500x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29/beach-wedding-ideas-ceremony-aisle-megan-kay-photography-fb-0625-465355e5b5284db58f6ce3276cd7ed56.jpg",
      description: "Celebrate your wedding by the serene beachside.",
      price: 450000,
      contact: { phone: "+92 300 3333333", email: "beachsidebliss@weddings.pk" },
      location: "Karachi",
      rating: 4,
    },
    {
      name: "Skyline Rooftop",
      image:
        "https://asparklylifeforme.com/wp-content/uploads/2025/03/Night-Event-Decor-Black-Gold-Wedding-7.webp",
      description: "Rooftop venue with city skyline views.",
      price: 400000,
      contact: { phone: "+92 300 4444444", email: "skylinerooftop@weddings.pk" },
      location: "Islamabad",
      rating: 5,
    },
    {
      name: "Historic Mansion",
      image:
        "https://www.theknot.com/tk-media/images/d9855c81-262f-4d79-a8f2-b198d71d6f24.jpg",
      description: "Classic mansion venue with vintage charm.",
      price: 550000,
      contact: {
        phone: "+92 300 5555555",
        email: "historicmansion@weddings.pk",
      },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Banquet Royal",
      image:
        "https://grandambienceresort.com/wp-content/uploads/2024/07/01_ExpensiveWeddingVenues__FourSeasonsHotelHongKong_1-1-HKG_599_print-medium-1024x683-3.jpg",
      description: "Elegant banquet hall with customizable decorations.",
      price: 480000,
      contact: { phone: "+92 300 6666666", email: "banquetroyal@weddings.pk" },
      location: "Karachi",
      rating: 4,
    },
    {
      name: "Modern Loft",
      image:
        "https://caratsandcake.com/_images/cache/industrial-wedding-venues-01-228020-1668720789.jpg",
      description: "Stylish loft for intimate wedding celebrations.",
      price: 350000,
      contact: { phone: "+92 300 7777777", email: "modernloft@weddings.pk" },
      location: "Islamabad",
      rating: 4,
    },
    {
      name: "Countryside Villa",
      image:
        "https://www.amazingspaceweddings.co.uk/uploads/silchester_farm/bsp-0040__2_.jpg",
      description: "Charming villa surrounded by scenic countryside.",
      price: 400000,
      contact: {
        phone: "+92 300 8888888",
        email: "countrysidevilla@weddings.pk",
      },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Grand Ballroom",
      image:
        "https://therockleigh.net/wp-content/uploads/2020/03/the-rockleigh-luxury-wedding-venue-scaled.jpg",
      description: "Massive ballroom perfect for large weddings.",
      price: 600000,
      contact: { phone: "+92 300 9999999", email: "grandballroom@weddings.pk" },
      location: "Karachi",
      rating: 5,
    },
    {
      name: "Private Estate",
      image:
        "https://images.squarespace-cdn.com/content/v1/62aa1b2ac1fe8d3d35a012e8/1755326592030-EBUEERUFJKI9ESJAQQHN/outdoor%2Bwedding%2Bvenues%2C%2Boutdoor%2Bwedding%2Bvenues%2Blos%2Bangeles%2Bhummingbird%2Bnest%2Branch1.webp",
      description: "Exclusive estate for a private wedding celebration.",
      price: 750000,
      contact: { phone: "+92 300 1010101", email: "privateestate@weddings.pk" },
      location: "Islamabad",
      rating: 5,
    },
  ],
  Catering: [
    {
      name: "Gourmet Buffet",
      image:
        "https://blog.bridals.pk/wp-content/uploads/2019/05/Wedding-Caterers-7.jpg",
      description: "Delicious international buffet for your guests.",
      price: 150000,
      contact: { phone: "+92 301 1111111", email: "gourmetbuffet@weddings.pk" },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Traditional Feast",
      image:
        "https://eventplannerinlahore.pk/wp-content/uploads/2022/05/Event-Planner-Best-Menu-in-Lahore.jpg",
      description: "Authentic traditional dishes for cultural touch.",
      price: 120000,
      contact: {
        phone: "+92 301 2222222",
        email: "traditionalfeast@weddings.pk",
      },
      location: "Islamabad",
      rating: 5,
    },
    {
      name: "Live Cooking Station",
      image:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&w=800&q=80",
      description: "Interactive live cooking stations for guests.",
      price: 200000,
      contact: { phone: "+92 301 3333333", email: "livecooking@weddings.pk" },
      location: "Karachi",
      rating: 5,
    },
    {
      name: "Dessert Table",
      image:
        "https://media-api.xogrp.com/images/64c23193-3a2e-4729-bb1d-f863958e1eee~rs_768.h-cr_0.0.1000.750",
      description: "Exquisite dessert spreads with cakes and pastries.",
      price: 90000,
      contact: { phone: "+92 301 4444444", email: "desserttable@weddings.pk" },
      location: "Lahore",
      rating: 4,
    },
    {
      name: "Beverage Bar",
      image:
        "https://img.weddingbazaar.com/photos/pictures/000/358/072/new_medium/tjhe_whaling_club.jpg?1520516658=",
      description: "Custom cocktail and mocktail bar for your wedding.",
      price: 60000,
      contact: { phone: "+92 301 5555555", email: "beveragebar@weddings.pk" },
      location: "Islamabad",
      rating: 4,
    },
    {
      name: "Vegan & Gluten-Free",
      image:
        "https://babtoomacatering.com/wp-content/uploads/2024/10/menu.png",
      description: "Healthy menu options for everyone.",
      price: 50000,
      contact: { phone: "+92 301 6666666", email: "vegancuisine@weddings.pk" },
      location: "Karachi",
      rating: 4,
    },
    {
      name: "Cultural Cuisine",
      image:
        "https://cdn-blog.zameen.com/blog/wp-content/uploads/2019/04/cover-image-30.jpg",
      description: "Special dishes based on regional flavors.",
      price: 70000,
      contact: { phone: "+92 301 7777777", email: "culturalcuisine@weddings.pk" },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Mini Bites",
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&w=800&q=80",
      description: "Appetizers and small bites for cocktail hour.",
      price: 40000,
      contact: { phone: "+92 301 8888888", email: "minibites@weddings.pk" },
      location: "Islamabad",
      rating: 4,
    },
    {
      name: "Signature Dishes",
      image:
        "https://www.brides.com/thmb/IMhS9vGayy-XNseONGPctsyHqsk%3D/1500x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29/wedding-food-plated-meal-chris-j-evans-primary-0425-95f5a84ebdc14313a1b1c85da906662e.jpg",
      description: "Custom signature dishes for the wedding menu.",
      price: 120000,
      contact: {
        phone: "+92 301 9999999",
        email: "signaturedishes@weddings.pk",
      },
      location: "Karachi",
      rating: 5,
    },
    {
      name: "Seafood Extravaganza",
      image:
        "https://i.pinimg.com/736x/67/6c/ab/676cab86bb0e0dbd0b78d070004a772a.jpg",
      description: "Delightful seafood platters for luxury weddings.",
      price: 180000,
      contact: {
        phone: "+92 301 1010101",
        email: "seafoodextravaganza@weddings.pk",
      },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Chocolate Fountain",
      image:
        "https://www.dribblys.co.uk/wp-content/uploads/2019/10/dribblys-chocolate-fountain-hire-50-xl-3.png",
      description: "Interactive chocolate fountain for guests to enjoy.",
      price: 30000,
      contact: {
        phone: "+92 301 1212121",
        email: "chocolatefountain@weddings.pk",
      },
      location: "Islamabad",
      rating: 4,
    },
  ],
  Photography: [
    {
      name: "Pre-Wedding Shoot",
      image:
        "https://www.shaadidukaan.com/vogue/wp-content/uploads/2025/04/Pre-Wedding-Dress-11.webp",
      description: "Romantic pre-wedding photoshoot at stunning locations.",
      price: 100000,
      contact: { phone: "+92 302 1111111", email: "preweddingshoot@photos.pk" },
      location: "Karachi",
      rating: 5,
    },
    {
      name: "Wedding Day Coverage",
      image:
        "https://cdn-amhpo.nitrocdn.com/XcABegWkehNFhdktJpGUhdJXNpPZZSbG/assets/images/optimized/rev-8bdd26e/www.camstudio.com.pk/wp-content/uploads/2025/08/wedding-couple-photography.jpg",
      description: "Full-day photography capturing every precious moment.",
      price: 180000,
      contact: { phone: "+92 302 2222222", email: "weddingday@photos.pk" },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Drone Shots",
      image:
        "https://www.saintpatrickpalace.com/wp-content/uploads/MSP-24-scaled.jpg",
      description: "Aerial shots of your wedding venue and guests.",
      price: 120000,
      contact: { phone: "+92 302 3333333", email: "droneshots@photos.pk" },
      location: "Islamabad",
      rating: 5,
    },
    {
      name: "Cinematic Video",
      image: "https://i.ytimg.com/vi/r10L-NTG0Uo/maxresdefault.jpg",
      description: "Cinematic wedding videos for unforgettable memories.",
      price: 250000,
      contact: { phone: "+92 302 4444444", email: "cinematicvideo@photos.pk" },
      location: "Karachi",
      rating: 5,
    },
    {
      name: "Instant Photo Booth",
      image:
        "https://images.squarespace-cdn.com/content/v1/5ec5b8a5ec87db1698acad47/2c028538-0edb-4d0d-9b64-ecf3bfd365ef/icon-photo-booth-copyright-photobomb-events",
      description: "Fun photo booth setup for guests.",
      price: 80000,
      contact: { phone: "+92 302 5555555", email: "photobooth@photos.pk" },
      location: "Lahore",
      rating: 4,
    },
    {
      name: "Album Creation",
      image:
        "https://cdn.dribbble.com/userupload/43990282/file/original-afe53c4775b810c4006bc1f2a192c562.jpg?resize=752x&vertical=center",
      description: "Beautifully curated photo albums for your wedding.",
      price: 60000,
      contact: { phone: "+92 302 6666666", email: "albumcreation@photos.pk" },
      location: "Islamabad",
      rating: 4,
    },
    {
      name: "Editing & Retouching",
      image:
        "https://www.freireweddingphoto.com/wp-content/uploads/2017/03/DSC0310s-1200x749.jpg",
      description: "Professional photo and video editing services.",
      price: 50000,
      contact: {
        phone: "+92 302 7777777",
        email: "editingretouching@photos.pk",
      },
      location: "Karachi",
      rating: 4,
    },
    {
      name: "Black & White Photography",
      image: "https://i.insider.com/62cdbb8a8045920019aeb038?width=700",
      description: "Classic monochrome photography for timeless elegance.",
      price: 70000,
      contact: { phone: "+92 302 8888888", email: "blackwhite@photos.pk" },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Couple Portraits",
      image:
        "https://i.pinimg.com/736x/cb/19/e4/cb19e4f3ef15fbbf2eba2c8c486e7fb1.jpg",
      description: "Artistic couple portraits capturing emotions.",
      price: 90000,
      contact: { phone: "+92 302 9999999", email: "coupleportraits@photos.pk" },
      location: "Islamabad",
      rating: 5,
    },
    {
      name: "Venue Highlights",
      image:
        "https://i.ytimg.com/vi/wDmlnN7tdaU/hq720.jpg?rs=AOn4CLBZllKMoaYpooxDUdtUbnlKTDo58A&sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGFYgKSh_MA8%3D",
      description: "Highlighting the beauty of the venue through photography.",
      price: 80000,
      contact: { phone: "+92 302 1010101", email: "venuehighlights@photos.pk" },
      location: "Karachi",
      rating: 4,
    },
  ],
  Makeup: [
    {
      name: "Bridal Makeup",
      image:
        "https://www.nameerabyfarooq.com/cdn/shop/articles/Pakistani_Bridal_Makeup_Tips_and_Tricks_for_a_Flawless_Finish_1920x.jpg?v=1678804467",
      description: "Full bridal makeup with premium products.",
      price: 80000,
      contact: { phone: "+92 303 1111111", email: "bridalmakeup@makeup.pk" },
      location: "Karachi",
      rating: 5,
    },
    {
      name: "Groom Styling",
      image:
        "https://i0.wp.com/naushemian.com/wp-content/uploads/2023/07/B612_20230310_170906_092-scaled.webp?fit=1707%2C2560&ssl=1",
      description: "Professional grooming and styling for the groom.",
      price: 50000,
      contact: { phone: "+92 303 2222222", email: "groomstyling@makeup.pk" },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Trial Session",
      image:
        "https://thecreatorzevents.com/wp-content/uploads/2024/10/pexels-yogendras31-3089849-1024x683.jpg",
      description: "Trial makeup sessions to finalize your look.",
      price: 30000,
      contact: { phone: "+92 303 3333333", email: "trialsession@makeup.pk" },
      location: "Islamabad",
      rating: 4,
    },
    {
      name: "Hairstyling",
      image:
        "https://arammish.co/wp-content/uploads/2024/06/Makeup-Artist-near-Me-For-Wedding-2-819x1024.jpg",
      description: "Elegant bridal hairstyles and draping.",
      price: 40000,
      contact: { phone: "+92 303 4444444", email: "hairstyling@makeup.pk" },
      location: "Karachi",
      rating: 5,
    },
    {
      name: "Airbrush Makeup",
      image:
        "https://i.pinimg.com/736x/b9/78/22/b97822cec7ed886c29459b85fc4ee75c.jpg",
      description: "Long-lasting HD airbrush makeup for photos.",
      price: 60000,
      contact: { phone: "+92 303 5555555", email: "airbrush@makeup.pk" },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Skincare Prep",
      image:
        "https://slaestheticsclinic.com/wp-content/uploads/2024/03/Bridal-Bliss-Glow-on-Your-Big-Day-with-Our-Signature-Wedding-Facials.webp",
      description: "Skin preparation and consultation before makeup.",
      price: 20000,
      contact: { phone: "+92 303 6666666", email: "skincare@makeup.pk" },
      location: "Islamabad",
      rating: 4,
    },
    {
      name: "Makeup Consultation",
      image:
        "https://karsaaz.app/uploads/sub-category/7647d92daf501e3785e1bf5b10fc012983efb889.jpg",
      description: "Expert advice to choose the perfect look.",
      price: 15000,
      contact: { phone: "+92 303 7777777", email: "consultation@makeup.pk" },
      location: "Karachi",
      rating: 4,
    },
    {
      name: "Evening Makeup",
      image:
        "https://i.pinimg.com/736x/ed/af/98/edaf986c93f05e3fd5b8ea4ed82452d0.jpg",
      description: "Special evening makeup for post-ceremony events.",
      price: 45000,
      contact: { phone: "+92 303 8888888", email: "eveningmakeup@makeup.pk" },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Natural Look",
      image:
        "https://www.fabmood.com/inspiration/wp-content/uploads/2024/03/bridal-makeup-5.jpg",
      description: "Soft, natural makeup for a fresh look.",
      price: 25000,
      contact: { phone: "+92 303 9999999", email: "naturallook@makeup.pk" },
      location: "Islamabad",
      rating: 4,
    },
  ],
  Decor: [
    {
      name: "Floral Arrangements",
      image:
        "https://sendflowers.pk/wp-content/uploads/2023/11/64c38c71-657e-4b78-9ba5-78742f50adc0.jpeg",
      description: "Beautiful floral arrangements for the venue.",
      price: 40000,
      contact: { phone: "+92 304 1111111", email: "floral@decor.pk" },
      location: "Karachi",
      rating: 5,
    },
    {
      name: "Stage Setup",
      image:
        "https://i.pinimg.com/564x/0b/82/b0/0b82b0a8b8aa747deeb9819d65e66b3d.jpg",
      description: "Elegant stage decoration for ceremonies.",
      price: 60000,
      contact: { phone: "+92 304 2222222", email: "stage@decor.pk" },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Lighting Design",
      image:
        "https://flowerbouquet.pk/cdn/shop/files/Outdoor_Decorative_String_Lights_for_Garden_and_Home.jpg?v=1736921454&width=533",
      description: "Professional lighting to create the perfect mood.",
      price: 50000,
      contact: { phone: "+92 304 3333333", email: "lighting@decor.pk" },
      location: "Islamabad",
      rating: 5,
    },
    {
      name: "Table Decor",
      image:
        "https://d397bfy4gvgcdm.cloudfront.net/116199-meena-and-tariq-luxury-chicago-wedding-maha-designs-hilton-michigan-avenue-chicago-illinois-wedding-photography-273.jpeg",
      description: "Themed table arrangements and centerpieces.",
      price: 35000,
      contact: { phone: "+92 304 4444444", email: "table@decor.pk" },
      location: "Karachi",
      rating: 4,
    },
    {
      name: "Venue Draping",
      image:
        "https://www.shelter-structures.com/wp-content/uploads/wedding-tent12-e1709001416620.webp",
      description: "Custom draping for halls and tents.",
      price: 45000,
      contact: { phone: "+92 304 5555555", email: "draping@decor.pk" },
      location: "Lahore",
      rating: 5,
    },
    {
      name: "Custom Themes",
      image:
        "https://flowerbouquet.pk/cdn/shop/collections/Enchanting_Staircase_Decor.jpg?v=1736867589&width=1500",
      description: "Create your dream wedding theme with our decor team.",
      price: 70000,
      contact: { phone: "+92 304 6666666", email: "customthemes@decor.pk" },
      location: "Islamabad",
      rating: 5,
    },
    {
      name: "Lighting & Effects",
      image:
        "https://tulipsevents.com/wp-content/uploads/2025/06/Best-Pakistani-Wedding-Stages-Trends-2025-Tulips-Events-6-1024x577.jpg",
      description: "Special lighting effects for evening celebrations.",
      price: 65000,
      contact: { phone: "+92 304 7777777", email: "effects@decor.pk" },
      location: "Karachi",
      rating: 5,
    },
    {
      name: "Entrance Decor",
      image:
        "https://i.pinimg.com/736x/dc/29/81/dc2981ef218865f20fee061849242a9f.jpg",
      description: "Decorative entrance setup for grand welcomes.",
      price: 55000,
      contact: { phone: "+92 304 8888888", email: "entrance@decor.pk" },
      location: "Lahore",
      rating: 4,
    },
    {
      name: "Outdoor Decor",
      image:
        "https://i.pinimg.com/736x/a8/1e/dd/a81edd62bf71b45c333251a221f10c3e.jpg",
      description: "Beautiful outdoor wedding decorations.",
      price: 50000,
      contact: { phone: "+92 304 9999999", email: "outdoor@decor.pk" },
      location: "Islamabad",
      rating: 5,
    },
  ],
};

// ============ SEED FUNCTION ============
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Category.deleteMany({});
    await Vendor.deleteMany({});
    await Service.deleteMany({});
    console.log("Cleared existing data");

    // Create Admin User (from env variables or defaults)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@weddingjunction.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Admin";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      // Update existing user to admin role
      await User.findByIdAndUpdate(existingAdmin._id, { role: "admin" });
      console.log(`Admin user already exists: ${adminEmail}`);
    }

    // 1. Insert Categories
    const categories = await Category.insertMany(categoriesData);
    console.log(`Inserted ${categories.length} categories`);

    // Create a map of category names to ObjectIds
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 2. Insert Services
    const services = await Service.insertMany(servicesData);
    console.log(`Inserted ${services.length} services`);

    // 3. Create vendor owner users for seeding
    const salt = await bcrypt.genSalt(10);
    const vendorPassword = await bcrypt.hash("vendor123", salt);

    // Create vendor users for each vendor
    const vendorUsers = [];
    let vendorIndex = 0;

    // Count total vendors
    let totalVendors = featuredVendorsData.length;
    for (const vendors of Object.values(categoryVendorsData)) {
      totalVendors += vendors.length;
    }

    // Create vendor users
    for (let i = 0; i < totalVendors; i++) {
      vendorUsers.push({
        name: `Vendor User ${i + 1}`,
        email: `vendor${i + 1}@weddingjunction.com`,
        password: vendorPassword,
        role: "vendor",
      });
    }

    // Delete existing vendor users and create new ones
    await User.deleteMany({ email: { $regex: /^vendor\d+@weddingjunction\.com$/ } });
    const createdVendorUsers = await User.insertMany(vendorUsers);
    console.log(`Created ${createdVendorUsers.length} vendor users`);

    // 4. Insert Vendors
    const allVendors = [];

    // Add category vendors (non-featured)
    for (const [categoryName, vendors] of Object.entries(categoryVendorsData)) {
      vendors.forEach((vendor) => {
        allVendors.push({
          ...vendor,
          owner: createdVendorUsers[vendorIndex++]._id,
          businessInfo: {
            name: vendor.name,
            description: vendor.description,
          },
          service: categoryName,
          category: categoryMap[categoryName],
          isFeatured: false,
          status: "active",
        });
      });
    }

    // Add featured vendors
    const categoryMapping = {
      "Wedding Planner": "Venues",
      "Photography & Videography": "Photography",
      "Florist & Decor": "Decor",
      "Cake Designer": "Catering",
      "Music & Entertainment": "Venues",
    };

    featuredVendorsData.forEach((vendor) => {
      const categoryName = categoryMapping[vendor.service] || "Venues";
      allVendors.push({
        ...vendor,
        owner: createdVendorUsers[vendorIndex++]._id,
        businessInfo: {
          name: vendor.name,
          description: vendor.description,
        },
        category: categoryMap[categoryName],
        status: "active",
      });
    });

    const insertedVendors = await Vendor.insertMany(allVendors);
    console.log(`Inserted ${insertedVendors.length} vendors`);

    console.log("\n========================================");
    console.log("Database seeded successfully!");
    console.log("========================================");
    console.log(`Categories: ${categories.length}`);
    console.log(`Services: ${services.length}`);
    console.log(`Vendors: ${insertedVendors.length}`);
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
