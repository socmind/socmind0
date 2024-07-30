import { PrismaClient, MemberType, MessageType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding process...');

  // Seeding Members
  const flynn = await prisma.member.upsert({
    where: { id: 'flynn' },
    update: {},
    create: {
      id: 'flynn',
      name: 'Flynn',
      username: 'flynn',
      email: 'flynn@encom.com',
      type: MemberType.USER,
    },
  });

  const charles = await prisma.member.upsert({
    where: { id: 'gpt-4o' },
    update: {},
    create: {
      id: 'gpt-4o',
      name: 'Charles',
      username: 'gpt-4o',
      systemMessage:
        'Your name is Charles. Prepend "Charles: " to all of your replies.',
      type: MemberType.PROGRAM,
    },
  });

  const claudia = await prisma.member.upsert({
    where: { id: 'claude-3.5' },
    update: {},
    create: {
      id: 'claude-3.5',
      name: 'Claudia',
      username: 'claude-3.5',
      systemMessage:
        'Your name is Claudia. Prepend "Claudia: " to all of your replies.',
      type: MemberType.PROGRAM,
    },
  });

  const george = await prisma.member.upsert({
    where: { id: 'gemini-1.5' },
    update: {},
    create: {
      id: 'gemini-1.5',
      name: 'George',
      username: 'gemini-1.5',
      systemMessage:
        'Your name is George. Prepend "George: " to all of your replies.',
      type: MemberType.PROGRAM,
    },
  });

  console.log('Seeded members:');
  console.log('Flynn:', flynn);
  console.log('Charles:', charles);
  console.log('Claudia:', claudia);
  console.log('George:', george);

  // Seeding Chats
  const chat1 = await prisma.chat.create({
    data: {
      name: 'First Chat',
      context: 'Hello all.',
      members: {
        create: [
          { memberId: flynn.id },
          { memberId: charles.id },
          { memberId: claudia.id },
          { memberId: george.id },
        ],
      },
      messages: {
        create: [
          {
            content: { text: 'Please introduce yourselves.' },
            type: MessageType.SYSTEM,
          },
        ],
      },
    },
    include: {
      members: true,
      messages: true,
    },
  });

  console.log(`Created new chat: ${chat1.id}`);
  console.log(`Added ${chat1.members.length} members to the chat`);
  console.log(`Added ${chat1.messages.length} message(s) to the chat`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
