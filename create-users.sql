-- SQL Script to Create Admin and User Accounts
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb/sql/new

-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- Password: admin123 (bcrypt hashed)

INSERT INTO users (
  id,
  username,
  email,
  "firstName",
  "lastName",
  password,
  status,
  "memberType",
  "isActive",
  "emailVerified",
  "totalEarnings",
  "paidEarnings",
  "unpaidEarnings",
  "bannerCredits",
  "textAdCredits",
  "createdAt",
  "updatedAt"
) VALUES (
  'clx' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
  'admin',
  'admin@matrixmlm.com',
  'Admin',
  'User',
  '$2b$10$lmB5en1gqaII7mBrNUF4E.DxziK1i8NjmbV0LZiN8RniFq66Jfbj2',
  'ACTIVE',
  'PRO',
  true,
  true,
  0,
  0,
  0,
  0,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  status = EXCLUDED.status,
  "memberType" = EXCLUDED."memberType",
  "isActive" = EXCLUDED."isActive",
  "emailVerified" = EXCLUDED."emailVerified",
  "updatedAt" = NOW();

-- ============================================
-- CREATE REGULAR USER
-- ============================================
-- Password: user123 (bcrypt hashed)

INSERT INTO users (
  id,
  username,
  email,
  "firstName",
  "lastName",
  password,
  status,
  "memberType",
  "isActive",
  "emailVerified",
  "totalEarnings",
  "paidEarnings",
  "unpaidEarnings",
  "bannerCredits",
  "textAdCredits",
  "createdAt",
  "updatedAt"
) VALUES (
  'clx' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
  'user',
  'user@matrixmlm.com',
  'Regular',
  'User',
  '$2b$10$M61V1zYcru6/GKpAAtxpy.24SN8lF8syK6f3cGYeQ5rd0t3eDJtxa',
  'ACTIVE',
  'FREE',
  true,
  true,
  0,
  0,
  0,
  0,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  status = EXCLUDED.status,
  "memberType" = EXCLUDED."memberType",
  "isActive" = EXCLUDED."isActive",
  "emailVerified" = EXCLUDED."emailVerified",
  "updatedAt" = NOW();

-- ============================================
-- VERIFY USERS WERE CREATED
-- ============================================
SELECT 
  id,
  username,
  email,
  "firstName",
  "lastName",
  status,
  "memberType",
  "isActive",
  "emailVerified",
  "createdAt",
  "joinDate"
FROM users
WHERE username IN ('admin', 'user')
ORDER BY username;
