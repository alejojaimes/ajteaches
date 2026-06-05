import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const exampleContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Hello, world 👋' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This is the first post on ',
        },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'ajteaches',
        },
        {
          type: 'text',
          text: '. Built with Next.js, Tiptap, Prisma, and a lot of coffee.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'What this blog is about' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Software engineering concepts explained clearly' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Tutorials with working code, not pseudocode' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Honest takes on tools and tradeoffs' }],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'A quick code example' }],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [
        {
          type: 'text',
          text: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("world"));',
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'The best code is the code you understand six months later.',
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Follow along — new posts every week.' }],
    },
  ],
};

async function main() {
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

  console.log('Owner:', owner.name);

  const post = await prisma.post.upsert({
    where: { slug: 'hello-world' },
    update: {
      contentJson: exampleContent,
    },
    create: {
      title: 'Hello world',
      slug: 'hello-world',
      excerpt: 'First post on ajteaches. Setting the tone.',
      contentJson: exampleContent,
      status: 'published',
      postType: 'blog',
      publishedAt: new Date(),
      readTimeMinutes: 2,
      authorId: owner.id,
    },
  });

  console.log('Post:', post.title, `(${post.status})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
