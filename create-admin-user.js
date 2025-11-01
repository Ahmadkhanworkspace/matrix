/**
 * Script to create admin and regular users for testing
 * 
 * Usage:
 *   node create-admin-user.js
 * 
 * Or with specific credentials:
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD=admin123 USER_USERNAME=user USER_PASSWORD=user123 node create-admin-user.js
 */

require('dotenv').config();

// Try to load Prisma and bcryptjs
let PrismaClient;
let bcrypt;

try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  console.error('❌ Prisma client not found. Please run: npx prisma generate');
  process.exit(1);
}

try {
  bcrypt = require('bcryptjs');
} catch (e) {
  console.error('❌ bcryptjs not found. Installing...');
  console.log('Please run: npm install bcryptjs');
  console.log('Or if in backend folder: cd backend && npm install bcryptjs');
  process.exit(1);
}

const prisma = new PrismaClient();

// Default credentials (can be overridden by environment variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@matrixmlm.com';

const USER_USERNAME = process.env.USER_USERNAME || 'user';
const USER_PASSWORD = process.env.USER_PASSWORD || 'user123';
const USER_EMAIL = process.env.USER_EMAIL || 'user@matrixmlm.com';

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: ADMIN_USERNAME },
          { email: ADMIN_EMAIL }
        ]
      }
    });
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists. Updating...');
      
      // Update existing user to admin
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: passwordHash,
          status: 'ACTIVE',
          memberType: 'PRO',
          email: ADMIN_EMAIL,
          firstName: 'Admin',
          lastName: 'User',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log('✅ Admin user updated successfully!');
      console.log(`   User ID: ${updated.id}`);
      return updated;
    }
    
    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        status: 'ACTIVE',
        memberType: 'PRO',
        isActive: true,
        emailVerified: true,
        totalEarnings: 0,
        paidEarnings: 0,
        unpaidEarnings: 0,
        bannerCredits: 0,
        textAdCredits: 0
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`   User ID: ${adminUser.id}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

async function createRegularUser() {
  try {
    console.log('\n👤 Creating regular user...');
    console.log(`   Username: ${USER_USERNAME}`);
    console.log(`   Email: ${USER_EMAIL}`);
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(USER_PASSWORD, saltRounds);
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: USER_USERNAME },
          { email: USER_EMAIL }
        ]
      }
    });
    
    if (existingUser) {
      console.log('⚠️  Regular user already exists. Updating...');
      
      // Update existing user
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: passwordHash,
          status: 'ACTIVE',
          memberType: 'FREE',
          email: USER_EMAIL,
          firstName: 'Regular',
          lastName: 'User',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log('✅ Regular user updated successfully!');
      console.log(`   User ID: ${updated.id}`);
      return updated;
    }
    
    // Create new regular user
    const regularUser = await prisma.user.create({
      data: {
        username: USER_USERNAME,
        email: USER_EMAIL,
        password: passwordHash,
        firstName: 'Regular',
        lastName: 'User',
        status: 'ACTIVE',
        memberType: 'FREE',
        isActive: true,
        emailVerified: true,
        totalEarnings: 0,
        paidEarnings: 0,
        unpaidEarnings: 0,
        bannerCredits: 0,
        textAdCredits: 0
      }
    });
    
    console.log('✅ Regular user created successfully!');
    console.log(`   User ID: ${regularUser.id}`);
    console.log(`   Username: ${regularUser.username}`);
    console.log(`   Email: ${regularUser.email}`);
    
    return regularUser;
  } catch (error) {
    console.error('❌ Error creating regular user:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting user creation script...\n');
    console.log('═══════════════════════════════════════════════════');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to database\n');
    
    // Create admin user
    const adminUser = await createAdminUser();
    
    // Create regular user
    const regularUser = await createRegularUser();
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ All users created successfully!\n');
    
    console.log('📋 Login Credentials:');
    console.log('───────────────────────────────────────────────────');
    console.log('🔑 ADMIN USER (Admin Panel & User Panel):');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log('');
    console.log('👤 REGULAR USER (User Panel):');
    console.log(`   Username: ${USER_USERNAME}`);
    console.log(`   Password: ${USER_PASSWORD}`);
    console.log(`   Email: ${USER_EMAIL}`);
    console.log('');
    console.log('🌐 URLs:');
    console.log(`   Admin Panel: https://admin-panel-phi-hazel.vercel.app`);
    console.log(`   User Panel: https://userpanel-lac.vercel.app`);
    console.log(`   Backend API: https://considerate-adventure-production.up.railway.app/api`);
    console.log('───────────────────────────────────────────────────\n');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();

