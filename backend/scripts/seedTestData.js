/**
 * Seed script for E2E test data
 * Run with: node scripts/seedTestData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const Booking = require('../models/booking');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const Review = require('../models/review');
const VendorApplication = require('../models/vendorApplication');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/weddingApp';

// Test data matching e2e/fixtures/test-data.ts
const testUsers = {
  user: {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    role: 'user',
  },
  vendor: {
    name: 'Test Vendor',
    email: 'testvendor@example.com',
    password: 'VendorPassword123!',
    role: 'vendor',
  },
  admin: {
    name: 'Test Admin',
    email: 'admin@weddingjunction.com',
    password: 'AdminPassword123!',
    role: 'admin',
  },
};

const testCategories = [
  {
    name: 'Photography',
    description: 'Professional wedding photography services',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
  },
  {
    name: 'Catering',
    description: 'Wedding catering and food services',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
  },
  {
    name: 'Decoration',
    description: 'Wedding decoration and styling',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
  },
  {
    name: 'Venues',
    description: 'Wedding venues and banquet halls',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
  },
  {
    name: 'Music & Entertainment',
    description: 'DJs, bands, and entertainment',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Seed Categories
    console.log('\nSeeding categories...');
    const createdCategories = {};
    for (const categoryData of testCategories) {
      let category = await Category.findOne({ name: categoryData.name });
      if (!category) {
        category = await Category.create(categoryData);
        console.log(`  Created category: ${categoryData.name}`);
      } else {
        console.log(`  Category already exists: ${categoryData.name}`);
      }
      createdCategories[categoryData.name] = category;
    }

    // Seed Users
    console.log('\nSeeding test users...');
    const createdUsers = {};

    for (const [key, userData] of Object.entries(testUsers)) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        user = await User.create({
          ...userData,
          password: hashedPassword,
          isVerified: true,
        });
        console.log(`  Created ${key}: ${userData.email}`);
      } else {
        console.log(`  User already exists: ${userData.email}`);
      }
      createdUsers[key] = user;
    }

    // Seed Vendor Profile
    console.log('\nSeeding vendor profile...');
    const photographyCategory = createdCategories['Photography'];
    let vendorProfile = await Vendor.findOne({ owner: createdUsers.vendor._id });

    if (!vendorProfile) {
      const vendorData = {
        owner: createdUsers.vendor._id,
        status: 'active',
        businessInfo: {
          name: 'Premium Wedding Photography',
          slug: 'premium-wedding-photography',
          tagline: 'Capturing your perfect moments',
          description: 'We are a professional wedding photography studio with over 10 years of experience capturing beautiful moments.',
          logo: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
          coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
          gallery: [
            { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', caption: 'Wedding ceremony', order: 0 },
            { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', caption: 'Reception', order: 1 },
          ],
        },
        name: 'Premium Wedding Photography',
        service: 'Photography',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        description: 'Professional wedding photography studio with 10+ years of experience.',
        details: 'Full-day coverage, pre-wedding shoots, candid and traditional styles.',
        experience: '10+ years',
        servicesOffered: ['Wedding Photography', 'Pre-Wedding Shoots', 'Candid Photography', 'Drone Coverage'],
        location: 'Lahore, Punjab',
        category: photographyCategory._id,
        price: 75000,
        pricing: {
          basePrice: 75000,
          currency: 'PKR',
          minPrice: 50000,
          maxPrice: 200000,
          negotiable: true,
          depositRequired: true,
          depositPercentage: 30,
        },
        locationDetails: {
          address: '123 Wedding Street',
          city: 'Lahore',
          state: 'Punjab',
          country: 'Pakistan',
          pincode: '54000',
        },
        serviceAreas: [
          { city: 'Lahore', state: 'Punjab', radius: 50, travelCharges: 0 },
          { city: 'Islamabad', state: 'Federal', radius: 30, travelCharges: 10000 },
        ],
        contact: {
          phone: '03001234567',
          email: 'contact@premiumwedding.com',
          website: 'https://premiumwedding.com',
          whatsapp: '03001234567',
          socialMedia: {
            instagram: 'premiumwedding',
            facebook: 'premiumweddingpk',
          },
        },
        experienceDetails: {
          years: 10,
          eventsCompleted: 500,
          highlights: ['Featured in Wedding Magazine', '500+ weddings', 'Award-winning team'],
        },
        rating: 4.8,
        ratings: {
          average: 4.8,
          count: 45,
          distribution: { 1: 0, 2: 1, 3: 2, 4: 8, 5: 34 },
        },
        metrics: {
          responseTime: { average: 30, lastUpdated: new Date() },
          responseRate: 98,
          bookingAcceptRate: 95,
          completionRate: 100,
          totalBookings: 50,
          completedBookings: 45,
          profileViews: 1500,
          inquiries: 200,
        },
        verification: {
          isVerified: true,
          verifiedAt: new Date(),
          level: 'premium',
        },
        isFeatured: true,
        isAvailable: true,
        availability: {
          isAvailable: true,
          bookingLeadTime: 14,
          maxBookingsPerDay: 2,
        },
      };

      vendorProfile = await Vendor.create(vendorData);
      console.log(`  Created vendor profile: ${vendorProfile.businessInfo.name}`);
    } else {
      console.log(`  Vendor profile already exists: ${vendorProfile.businessInfo?.name || vendorProfile.name}`);
    }

    // Seed a completed booking for review tests
    console.log('\nSeeding test booking...');
    let testBooking = await Booking.findOne({ user: createdUsers.user._id, vendor: vendorProfile._id });

    if (!testBooking) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - 7); // Past date for completed booking

      const bookingData = {
        user: createdUsers.user._id,
        vendor: vendorProfile._id,
        userName: createdUsers.user.name,
        userEmail: createdUsers.user.email,
        service: 'Wedding Photography',
        price: 75000,
        status: 'completed',
        clientDetails: {
          fullName: 'Test User',
          phone: '03009876543',
          email: 'testuser@example.com',
          eventDate: eventDate,
          eventType: 'Wedding',
          guestCount: 200,
          address: '123 Wedding Street, Lahore',
        },
        payment: {
          status: 'completed',
        },
        pricing: {
          originalPrice: 75000,
          finalPrice: 75000,
          totalAmount: 75000,
          currency: 'PKR',
        },
        statusHistory: [
          { status: 'draft', changedAt: new Date(eventDate.getTime() - 30 * 24 * 60 * 60 * 1000) },
          { status: 'requested', changedAt: new Date(eventDate.getTime() - 29 * 24 * 60 * 60 * 1000) },
          { status: 'vendor_accepted', changedAt: new Date(eventDate.getTime() - 28 * 24 * 60 * 60 * 1000) },
          { status: 'confirmed', changedAt: new Date(eventDate.getTime() - 25 * 24 * 60 * 60 * 1000) },
          { status: 'completed', changedAt: eventDate },
        ],
        vendorAccepted: true,
        vendorAcceptedAt: new Date(eventDate.getTime() - 28 * 24 * 60 * 60 * 1000),
        isConfirmed: true,
        completedAt: eventDate,
      };

      testBooking = await Booking.create(bookingData);
      console.log(`  Created test booking: ${testBooking._id}`);
    } else {
      console.log(`  Test booking already exists: ${testBooking._id}`);
    }

    // Seed a pending booking (requested status)
    console.log('\nSeeding pending booking...');
    let pendingBooking = await Booking.findOne({ user: createdUsers.user._id, status: 'requested' });

    if (!pendingBooking) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      pendingBooking = await Booking.create({
        user: createdUsers.user._id,
        vendor: vendorProfile._id,
        userName: createdUsers.user.name,
        userEmail: createdUsers.user.email,
        service: 'Pre-Wedding Shoot',
        price: 35000,
        status: 'requested',
        clientDetails: {
          fullName: 'Test User',
          phone: '03009876543',
          email: 'testuser@example.com',
          eventDate: futureDate,
          eventType: 'Pre-Wedding',
        },
        statusHistory: [
          { status: 'draft', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'requested', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        ],
      });
      console.log(`  Created pending booking: ${pendingBooking._id}`);
    } else {
      console.log(`  Pending booking already exists: ${pendingBooking._id}`);
    }

    // Seed a conversation
    console.log('\nSeeding test conversation...');
    let conversation = await Conversation.findOne({ user: createdUsers.user._id, vendor: vendorProfile._id });

    if (!conversation) {
      // Create conversation first without lastMessage
      conversation = await Conversation.create({
        user: createdUsers.user._id,
        vendor: vendorProfile._id,
        vendorUser: createdUsers.vendor._id,
        context: {
          service: 'Wedding Photography',
          originalPrice: 75000,
        },
        status: 'active',
        lastMessageAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      });
      console.log(`  Created conversation: ${conversation._id}`);

      // Create messages
      const message1 = await Message.create({
        conversation: conversation._id,
        sender: createdUsers.user._id,
        senderRole: 'user',
        content: 'Hello, I am interested in your wedding photography services. Could you please share more details?',
        messageType: 'text',
        isRead: true,
        readAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000),
      });
      console.log(`  Created message 1: ${message1._id}`);

      const message2 = await Message.create({
        conversation: conversation._id,
        sender: createdUsers.vendor._id,
        senderRole: 'vendor',
        content: 'Thank you for your interest! We offer full-day coverage starting at Rs. 75,000. Would you like to schedule a consultation?',
        messageType: 'text',
        isRead: true,
        readAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
      });
      console.log(`  Created message 2: ${message2._id}`);

      // Update conversation with lastMessage
      conversation.lastMessage = message2._id;
      await conversation.save();
      console.log(`  Updated conversation with lastMessage`);
    } else {
      console.log(`  Conversation already exists: ${conversation._id}`);
    }

    // Seed pending vendor applications
    console.log('\nSeeding pending vendor applications...');

    const pendingApplicants = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        password: 'TestPassword123!',
        applicationData: {
          businessName: 'Sharma Catering Services',
          businessDescription: 'Premium catering services for weddings and events with 15 years of experience. We specialize in multi-cuisine menus, live counters, and customized wedding packages.',
          categoryName: 'Catering',
          phone: '03001112233',
          experience: 15,
          city: 'Lahore',
          state: 'Punjab',
          submittedDaysAgo: 2,
        },
      },
      {
        name: 'Ayesha Khan',
        email: 'ayesha.khan@example.com',
        password: 'TestPassword123!',
        applicationData: {
          businessName: 'Elegant Decor Studio',
          businessDescription: 'Transforming venues into magical wedding spaces with creative decoration services. From floral arrangements to lighting design, we create unforgettable atmospheres.',
          categoryName: 'Decoration',
          phone: '03004445566',
          experience: 8,
          city: 'Karachi',
          state: 'Sindh',
          submittedDaysAgo: 1,
        },
      },
      {
        name: 'Ahmed Ali',
        email: 'ahmed.ali@example.com',
        password: 'TestPassword123!',
        applicationData: {
          businessName: 'DJ Ahmed Entertainment',
          businessDescription: 'Professional DJ and entertainment services for weddings, mehendis, and parties. We bring the perfect mix of music and energy to make your celebration memorable.',
          categoryName: 'Music & Entertainment',
          phone: '03007778899',
          experience: 5,
          city: 'Islamabad',
          state: 'Federal',
          submittedDaysAgo: 0,
        },
      },
    ];

    for (const applicantData of pendingApplicants) {
      // Check if user already exists
      let applicant = await User.findOne({ email: applicantData.email });

      // Check if application already exists for this user
      let existingApplication = null;
      if (applicant) {
        existingApplication = await VendorApplication.findOne({ applicant: applicant._id });
      }

      if (existingApplication) {
        console.log(`  Application already exists for: ${applicantData.name}`);
        continue;
      }

      // Create user if doesn't exist
      if (!applicant) {
        const hashedPassword = await bcrypt.hash(applicantData.password, 10);
        applicant = await User.create({
          name: applicantData.name,
          email: applicantData.email,
          password: hashedPassword,
          role: 'user',
          isVerified: true,
        });
        console.log(`  Created user: ${applicantData.name}`);
      }

      // Find category
      const category = await Category.findOne({ name: applicantData.applicationData.categoryName });
      if (!category) {
        console.log(`  Warning: Category ${applicantData.applicationData.categoryName} not found, skipping application`);
        continue;
      }

      // Create VendorApplication
      const submittedAt = new Date(Date.now() - applicantData.applicationData.submittedDaysAgo * 24 * 60 * 60 * 1000);

      const vendorApplication = await VendorApplication.create({
        applicant: applicant._id,
        businessInfo: {
          name: applicantData.applicationData.businessName,
          description: applicantData.applicationData.businessDescription,
        },
        serviceDetails: {
          category: category._id,
          experience: applicantData.applicationData.experience,
          servicesOffered: [applicantData.applicationData.categoryName + ' Services'],
          pricing: {
            minPrice: 20000,
            maxPrice: 100000,
            pricingModel: 'package',
          },
        },
        contact: {
          phone: applicantData.applicationData.phone,
          email: applicantData.email,
        },
        location: {
          city: applicantData.applicationData.city,
          state: applicantData.applicationData.state,
          serviceAreas: [applicantData.applicationData.city],
        },
        status: 'submitted',
        submittedAt: submittedAt,
        termsAccepted: true,
        termsAcceptedAt: submittedAt,
      });

      // Link application to user
      applicant.vendorApplication = vendorApplication._id;
      await applicant.save();

      console.log(`  Created application: ${applicantData.applicationData.businessName} (${applicantData.name})`);
    }

    // Seed a review
    console.log('\nSeeding test review...');
    let review = await Review.findOne({ reviewer: createdUsers.user._id, vendor: vendorProfile._id });

    if (!review) {
      review = await Review.create({
        vendor: vendorProfile._id,
        booking: testBooking._id,
        reviewer: createdUsers.user._id,
        ratings: {
          overall: 5,
          quality: 5,
          communication: 5,
          value: 4,
          professionalism: 5,
        },
        content: {
          title: 'Amazing Experience!',
          text: 'The photography team was absolutely wonderful. They captured every moment beautifully and were professional throughout. Highly recommended!',
          pros: ['Professional team', 'Beautiful photos', 'On-time delivery'],
          cons: [],
        },
        eventDetails: {
          type: 'Wedding',
          date: testBooking.eventDate,
          location: 'Lahore',
        },
        moderation: {
          status: 'approved',
          reviewedAt: new Date(),
        },
        isPublished: true,
        isVerifiedPurchase: true,
      });
      console.log(`  Created review: ${review._id}`);
    } else {
      console.log(`  Review already exists: ${review._id}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('  User:   testuser@example.com / TestPassword123!');
    console.log('  Vendor: testvendor@example.com / VendorPassword123!');
    console.log('  Admin:  admin@weddingjunction.com / AdminPassword123!');
    console.log('\nTest Data Created:');
    console.log('  - 5 Categories');
    console.log('  - 3 Users (user, vendor, admin)');
    console.log('  - 1 Vendor Profile (Premium Wedding Photography)');
    console.log('  - 2 Bookings (1 completed, 1 pending)');
    console.log('  - 1 Conversation with messages');
    console.log('  - 1 Approved review');
    console.log('  - 3 Pending Vendor Applications (Rahul, Ayesha, Ahmed)');
    console.log('\nPending Vendor Applications:');
    console.log('  - Rahul Sharma: Sharma Catering Services');
    console.log('  - Ayesha Khan: Elegant Decor Studio');
    console.log('  - Ahmed Ali: DJ Ahmed Entertainment');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
