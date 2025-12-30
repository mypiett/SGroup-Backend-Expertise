import { AppDataSource } from '../config/data-source';
import { List } from '../common/entities/list.entity';
import { Card } from '../common/entities/card.entity';
import { Board } from '../common/entities/board.entity';

const TARGET_BOARD_ID = 'b2a6b4ea-74db-45e5-91c2-55b23a9b13c3'; // Thay đổi ID này theo board muốn seed dữ liệu vào
const listsData = [
  {
    title: 'To Do',
    position: 0,
    cards: [
      {
        title: 'Setup project repository',
        description: 'Initialize Git repository and setup remote origin',
        position: 0,
      },
      {
        title: 'Design database schema',
        description: 'Create ERD diagram for all entities and relationships',
        position: 1,
      },
      {
        title: 'Write API documentation',
        description: 'Document all REST endpoints with Swagger/OpenAPI',
        position: 2,
      },
      {
        title: 'Setup CI/CD pipeline',
        description:
          'Configure GitHub Actions for automated testing and deployment',
        position: 3,
      },
      {
        title: 'Create unit tests',
        description: 'Write unit tests for core business logic',
        position: 4,
      },
    ],
  },
  {
    title: 'In Progress',
    position: 1,
    cards: [
      {
        title: 'Implement user authentication',
        description: 'Build JWT-based auth system with refresh tokens',
        position: 0,
      },
      {
        title: 'Create board CRUD operations',
        description: 'Implement create, read, update, delete for boards',
        position: 1,
      },
      {
        title: 'Build list management features',
        description: 'Add archive, move, copy list functionality',
        position: 2,
      },
      {
        title: 'Optimize database queries',
        description:
          'Add indexes and use bulk operations for better performance',
        position: 3,
      },
      {
        title: 'Implement RBAC system',
        description:
          'Role-based access control with workspace/board/card levels',
        position: 4,
      },
      {
        title: 'Setup Redis caching',
        description: 'Configure Redis for session management and query caching',
        position: 5,
      },
    ],
  },
  {
    title: 'In Review',
    position: 2,
    cards: [
      {
        title: 'Card drag and drop feature',
        description:
          'Frontend implementation for reordering cards within lists',
        position: 0,
      },
      {
        title: 'Email notification system',
        description: 'Send emails for card assignments and due date reminders',
        position: 1,
      },
      {
        title: 'File attachment support',
        description: 'Allow users to upload and attach files to cards',
        position: 2,
      },
      {
        title: 'Real-time updates with WebSocket',
        description: 'Implement Socket.io for live board synchronization',
        position: 3,
      },
    ],
  },
  {
    title: 'Done',
    position: 3,
    cards: [
      {
        title: 'Project initialization',
        description: 'Setup Node.js, TypeScript, Express framework',
        position: 0,
      },
      {
        title: 'Database setup',
        description: 'Configure PostgreSQL and TypeORM migrations',
        position: 1,
      },
      {
        title: 'Basic workspace CRUD',
        description: 'Create, read, update, delete workspace functionality',
        position: 2,
      },
      {
        title: 'User registration and login',
        description: 'Basic auth endpoints with password hashing',
        position: 3,
      },
      {
        title: 'Workspace member management',
        description: 'Add/remove members, assign roles, send invitations',
        position: 4,
      },
      {
        title: 'Board visibility settings',
        description: 'Implement public, private, and workspace visibility',
        position: 5,
      },
      {
        title: 'Card comment system',
        description: 'Allow users to add comments and mentions on cards',
        position: 6,
      },
      {
        title: 'Search functionality',
        description: 'Search cards by title, description, and labels',
        position: 7,
      },
    ],
  },
];

// ============================================
// SEED FUNCTION
// ============================================
async function seedListsAndCards() {
  try {
    console.log('🌱 Starting Lists and Cards seeding...\n');

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection initialized\n');
    }

    const listRepository = AppDataSource.getRepository(List);
    const cardRepository = AppDataSource.getRepository(Card);
    const boardRepository = AppDataSource.getRepository(Board);

    // Validate board exists
    console.log(`🔍 Checking if board with ID "${TARGET_BOARD_ID}" exists...`);
    const board = await boardRepository.findOne({
      where: { id: TARGET_BOARD_ID },
    });

    if (!board) {
      console.error(`❌ Board with ID "${TARGET_BOARD_ID}" not found!`);
      console.log('\n💡 Steps to fix:');
      console.log('1. Create a board first or use existing board');
      console.log('2. Update TARGET_BOARD_ID constant in this file');
      console.log('3. Run this seed script again\n');
      process.exit(1);
    }

    console.log(`✅ Board found: "${board.title}"\n`);

    // Clear existing lists and cards for this board
    console.log('🗑️  Cleaning existing lists and cards...');
    const existingLists = await listRepository.find({
      where: { board: { id: TARGET_BOARD_ID } },
    });

    if (existingLists.length > 0) {
      await listRepository.remove(existingLists);
      console.log(`✅ Removed ${existingLists.length} existing lists\n`);
    }

    // Seed lists and cards
    console.log('📝 Creating lists and cards...\n');
    let totalCards = 0;

    for (const listData of listsData) {
      // Create list
      const list = listRepository.create({
        title: listData.title,
        position: listData.position,
        board: board,
        isArchived: false,
      });

      const savedList = await listRepository.save(list);
      console.log(`  📋 Created list: "${savedList.title}"`);

      // Create cards for this list
      const cards = listData.cards.map((cardData) =>
        cardRepository.create({
          title: cardData.title,
          description: cardData.description,
          position: cardData.position,
          list: savedList,
          board: board, // thêm board relation
          isArchived: false,
        })
      );

      await cardRepository.save(cards);
      console.log(`     ├─ Added ${cards.length} cards`);
      totalCards += cards.length;
    }

    console.log('\n✅ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Board: ${board.title}`);
    console.log(`   • Lists created: ${listsData.length}`);
    console.log(`   • Cards created: ${totalCards}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run seeder
seedListsAndCards();
