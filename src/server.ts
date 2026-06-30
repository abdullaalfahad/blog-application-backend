import app from './app';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT || 8000;

async function main() {
  try {
    const connect = await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}

main();
