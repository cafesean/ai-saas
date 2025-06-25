import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';
import { env } from '../../env.mjs';
import { users, orgs } from '../schema/org';
import { roles, userRoles } from '../schema/rbac';

/**
 * Initial User & Organization Seeding Script
 * 
 * This script creates:
 * 1. Initial organization (Acme)
 * 2. Initial admin user
 * 3. User-org relationship with admin role
 * 4. User role assignment
 */

async function seedInitialUserOrg() {
  console.log('🚀 Starting initial user & organization seeding...');

  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client);

  try {
    // 1. Create Organization
    console.log('🏢 Creating organization...');
    
    const existingOrg = await db.select().from(orgs).where(eq(orgs.name, 'Acme'));
    let orgId: number;
    
    if (existingOrg.length === 0) {
      const [newOrg] = await db.insert(orgs).values({
        name: 'Acme',
        description: 'Initial organization',
        slug: 'acme',
        isActive: true,
      }).returning({ id: orgs.id });
      
      orgId = newOrg!.id;
      console.log(`✅ Created organization "Acme" with ID: ${orgId}`);
    } else {
      orgId = existingOrg[0]!.id;
      console.log(`ℹ️  Organization "Acme" already exists with ID: ${orgId}`);
    }

    // 2. Create User
    console.log('👤 Creating user...');
    
    const existingUser = await db.select().from(users).where(eq(users.email, 'admin@jetdevs.com'));
    let userId: number;
    
    if (existingUser.length === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash('gYu8D-REQHq3', 10);
      
      // Create orgData structure as specified
      const orgData = {
        currentOrgId: orgId,
        orgs: [{
          role: "admin",
          orgId: orgId,
          isActive: true,
          joinedAt: "2025-06-16T00:09:26.408491+08:00"
        }]
      };
      
      const [newUser] = await db.insert(users).values({
        name: 'Test User',
        email: 'admin@jetdevs.com',
        password: hashedPassword,
        isActive: true,
        orgData: orgData,
      }).returning({ id: users.id });
      
      userId = newUser!.id;
      console.log(`✅ Created user "Test User" with ID: ${userId}`);
    } else {
      userId = existingUser[0]!.id;
      console.log(`ℹ️  User "admin@jetdevs.com" already exists with ID: ${userId}`);
    }

    // 3. Assign Admin Role
    console.log('🔐 Assigning admin role...');
    
    // Get the admin role ID
    const adminRole = await db.select().from(roles).where(eq(roles.name, 'Admin'));
    
    if (adminRole.length === 0) {
      console.error('❌ Admin role not found. Please run RBAC seeding first.');
      throw new Error('Admin role not found');
    }
    
    const adminRoleId = adminRole[0]!.id;
    
    // Check if user role assignment already exists
    const existingUserRole = await db.select().from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.orgId, orgId), eq(userRoles.roleId, adminRoleId)));
    
    if (existingUserRole.length === 0) {
      await db.insert(userRoles).values({
        userId: userId,
        orgId: orgId,
        roleId: adminRoleId,
        isActive: true,
        assignedBy: userId, // Self-assigned for initial admin
      });
      console.log(`✅ Assigned Admin role to user ${userId} in org ${orgId}`);
    } else {
      console.log(`ℹ️  User ${userId} already has Admin role in org ${orgId}`);
    }

    // 4. Validation Summary
    console.log('\n📊 Initial Seeding Summary:');
    
    const finalUser = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      orgData: users.orgData,
    }).from(users).where(eq(users.id, userId));
    
    const finalOrg = await db.select({
      id: orgs.id,
      name: orgs.name,
      slug: orgs.slug,
    }).from(orgs).where(eq(orgs.id, orgId));
    
    const finalUserRole = await db.select({
      userId: userRoles.userId,
      orgId: userRoles.orgId,
      roleId: userRoles.roleId,
      roleName: roles.name,
    }).from(userRoles)
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(userRoles.userId, userId), eq(userRoles.orgId, orgId)));
    
    console.log('\n   📋 Created User:');
    console.log(`      • ID: ${finalUser[0]!.id}`);
    console.log(`      • Name: ${finalUser[0]!.name}`);
    console.log(`      • Email: ${finalUser[0]!.email}`);
    console.log(`      • Org Data:`, JSON.stringify(finalUser[0]!.orgData, null, 2));
    
    console.log('\n   🏢 Created Organization:');
    console.log(`      • ID: ${finalOrg[0]!.id}`);
    console.log(`      • Name: ${finalOrg[0]!.name}`);
    console.log(`      • Slug: ${finalOrg[0]!.slug}`);
    
    console.log('\n   🔐 Role Assignment:');
    console.log(`      • User ${finalUserRole[0]!.userId} has role "${finalUserRole[0]!.roleName}" in org ${finalUserRole[0]!.orgId}`);
    
    console.log('\n✅ Initial user & organization seeding completed successfully!');
    console.log('\n🎯 Login Credentials:');
    console.log('   • Email: admin@jetdevs.com');
    console.log('   • Password: gYu8D-REQHq3');

  } catch (error) {
    console.error('❌ Error during initial user & organization seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedInitialUserOrg()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedInitialUserOrg }; 