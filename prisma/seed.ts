import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Author owner (tú)
  const owner = await prisma.author.upsert({
    where: { username: 'ajteaches' },
    update: {},
    create: {
      name: 'Alejandro Jaimes',
      username: 'ajteaches',
      bio: 'Software engineer & educator. I build things and teach how they work.',
      email: 'hello@ajteaches.dev',
      githubUrl: 'https://github.com/alejojaimes',
      linkedinUrl: 'https://linkedin.com/in/alejocjaimes31',
      location: 'Remote, Colombia',
      isOwner: true,
    },
  });

  console.log('Owner created:', owner.name);

  // Post de ejemplo
  const post = await prisma.post.create({
    data: {
      title: 'Hello world',
      slug: 'hello-world',
      excerpt: 'First post on ajteaches. Setting the tone.',
      status: 'published',
      postType: 'blog',
      publishedAt: new Date(),
      readTimeMinutes: 2,
      authorId: owner.id,
    },
  });

  console.log('Post created:', post.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
