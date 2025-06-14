import { db } from '../src/db/config';
import { users } from '../src/db/schema';
import bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      console.log('Test user already exists:', email);
      return;
    }

    // Create test user
    const result = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
    }).returning();

    const newUser = result[0];
    if (newUser) {
      console.log('Test user created successfully:', {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      });
    }

    console.log('\nYou can now test login with:');
    console.log('Email:', email);
    console.log('Password:', password);

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser(); 