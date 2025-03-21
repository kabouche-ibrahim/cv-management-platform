import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

async function main() {
  try {
    const firstName = await question('Enter admin first name: ');
    const lastName = await question('Enter admin last name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const phoneNumber = await question('Enter admin phone number: ');
    const address = await question('Enter admin address: ');


    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      console.error('Error: Email already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        dateOfBirth: new Date(),
        address,
        phoneNumber,
      },
    });

    console.log('Created admin user:', admin);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();