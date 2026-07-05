import 'dotenv/config';
import { auth } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { UserRole } from '../middlewares/auth';

async function seedAdmin() {
  try {
    const adminUser = {
      name: 'Admin Shaheb 1',
      email: 'adminshaheb2@gmail.com',
      password: '12345678',
      role: UserRole.ADMIN,
      emailVerified: true,
    };

    const alreadyExist = await prisma.user.findUnique({
      where: {
        email: adminUser.email,
      },
    });

    if (alreadyExist) {
      throw new Error('User already exists!');
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: adminUser.name,
        email: adminUser.email,
        password: adminUser.password,
        role: adminUser.role,
      },
    });

    await prisma.user.update({
      where: { email: adminUser.email },
      data: { emailVerified: true },
    });

    console.log('Admin user created successfully:', result.user);
  } catch (error) {
    console.error('Failed to seed admin user:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
