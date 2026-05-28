import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear any existing data to start fresh
  console.log('Clearing existing data...');
  await prisma.savedCollege.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.placement.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.college.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding relational database for College Discovery platform...');

  // 1. Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Vikash Kumar',
      password: hashedPassword
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'aanya@example.com',
      name: 'Aanya Sharma',
      password: hashedPassword
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'rohit@example.com',
      name: 'Rohit Mehta',
      password: hashedPassword
    }
  });

  console.log(`Created test users: ${user1.email}, ${user2.email}, ${user3.email}`);

  // 2. Create colleges with courses, placements, and reviews
  
  // College 1: IIT Bombay
  await prisma.college.create({
    data: {
      name: 'Indian Institute of Technology (IIT), Bombay',
      location: 'Mumbai',
      state: 'Maharashtra',
      fees: 220000,
      rating: 4.9,
      overview: 'IIT Bombay is a leading public technical and research university located in Powai, Mumbai. Established in 1958, it is renowned globally for its world-class engineering education, state-of-the-art research facilities, and a stellar placement track record.',
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&auto=format&fit=crop&q=60',
      bannerUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
      courses: {
        create: [
          { name: 'B.Tech Computer Science and Engineering', duration: 4, fees: 220000 },
          { name: 'B.Tech Electrical Engineering', duration: 4, fees: 215000 },
          { name: 'M.Tech Data Science & AI', duration: 2, fees: 180000 },
        ],
      },
      placements: {
        create: [
          { year: 2024, highestPackage: 120.0, averagePackage: 24.5 },
          { year: 2025, highestPackage: 150.0, averagePackage: 28.2 },
        ],
      },
      reviews: {
        create: [
          {
            userId: user1.id,
            rating: 5.0,
            comment: 'Absolutely unmatched peer network and academic rigor. The research culture and campus life in Powai are phenomenal.'
          },
          {
            userId: user2.id,
            rating: 4.8,
            comment: 'Excellent placement opportunities and professors. Academic workload can be intense, but the exposure is world-class.'
          }
        ]
      }
    },
  });

  // College 2: BITS Pilani
  await prisma.college.create({
    data: {
      name: 'Birla Institute of Technology and Science (BITS), Pilani',
      location: 'Pilani',
      state: 'Rajasthan',
      fees: 550000,
      rating: 4.7,
      overview: 'BITS Pilani is a premier private university focused on science, engineering, and management education. BITS is celebrated for its zero-attendance policy, robust industry linkages (Practice School), and a massive global alumni network.',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&auto=format&fit=crop&q=60',
      bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
      courses: {
        create: [
          { name: 'B.E. Computer Science', duration: 4, fees: 550000 },
          { name: 'B.E. Electronics and Communication', duration: 4, fees: 530000 },
          { name: 'M.Sc Physics (Dual Degree)', duration: 5, fees: 480000 },
        ],
      },
      placements: {
        create: [
          { year: 2024, highestPackage: 60.0, averagePackage: 20.1 },
          { year: 2025, highestPackage: 72.0, averagePackage: 22.4 },
        ],
      },
      reviews: {
        create: [
          {
            userId: user3.id,
            rating: 4.7,
            comment: 'The zero-attendance policy lets you explore your startup ideas and coding interests freely. Extremely expensive, but the brand pays off.'
          }
        ]
      }
    },
  });

  // College 3: RV College of Engineering
  await prisma.college.create({
    data: {
      name: 'RV College of Engineering (RVCE)',
      location: 'Bangalore',
      state: 'Karnataka',
      fees: 380000,
      rating: 4.4,
      overview: 'RVCE Bangalore is a top-tier private technical institute. Because of its strategic location in Bangalore, the Silicon Valley of India, it maintains stellar tech placement records, attracting major global MNCs.',
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&auto=format&fit=crop&q=60',
      bannerUrl: 'https://images.unsplash.com/photo-1498243691581-b148c5c3ef71?w=1200&auto=format&fit=crop&q=80',
      courses: {
        create: [
          { name: 'B.E. Computer Science and Engineering', duration: 4, fees: 380000 },
          { name: 'B.E. Information Science and Engineering', duration: 4, fees: 380000 },
          { name: 'B.E. Electronics & Telecommunication', duration: 4, fees: 320000 },
        ],
      },
      placements: {
        create: [
          { year: 2024, highestPackage: 50.0, averagePackage: 10.8 },
          { year: 2025, highestPackage: 62.0, averagePackage: 12.1 },
        ],
      },
      reviews: {
        create: [
          {
            userId: user1.id,
            rating: 4.5,
            comment: 'Top-notch coding culture and fantastic placements. The campus is green and located in a very accessible area of Bangalore.'
          }
        ]
      }
    },
  });

  // College 4: Delhi University - Sri Venkateswara College
  await prisma.college.create({
    data: {
      name: 'Delhi University (DU) - Sri Venkateswara College',
      location: 'New Delhi',
      state: 'Delhi',
      fees: 18000,
      rating: 4.2,
      overview: 'A premier constituent college of the University of Delhi offering stellar undergraduate degrees in Arts, Science, and Commerce. SVC is highly regarded for its active campus societies, high-quality faculty, and vibrant student community.',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&auto=format&fit=crop&q=60',
      bannerUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
      courses: {
        create: [
          { name: 'B.Sc Computer Science Honours', duration: 3, fees: 18000 },
          { name: 'B.Com Honours', duration: 3, fees: 15000 },
          { name: 'B.A. Economics Honours', duration: 3, fees: 15000 },
        ],
      },
      placements: {
        create: [
          { year: 2024, highestPackage: 15.0, averagePackage: 6.2 },
          { year: 2025, highestPackage: 21.5, averagePackage: 7.1 },
        ],
      },
      reviews: {
        create: [
          {
            userId: user2.id,
            rating: 4.0,
            comment: 'Loved the campus vibes and active cultural societies. Placements for Economics and Commerce are excellent, though engineering/tech streams are limited.'
          }
        ]
      }
    },
  });

  // College 5: Vellore Institute of Technology
  await prisma.college.create({
    data: {
      name: 'Vellore Institute of Technology (VIT)',
      location: 'Vellore',
      state: 'Tamil Nadu',
      fees: 198000,
      rating: 4.1,
      overview: 'Vellore Institute of Technology is a highly progressive private research university. Boasting one of the largest engineering student cohorts in India, it features state-of-the-art laboratory infrastructure and diverse global study programs.',
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&auto=format&fit=crop&q=60',
      bannerUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&auto=format&fit=crop&q=80',
      courses: {
        create: [
          { name: 'B.Tech Computer Science and Engineering', duration: 4, fees: 198000 },
          { name: 'B.Tech Bio-Technology', duration: 4, fees: 175000 },
          { name: 'B.Tech Mechanical Engineering', duration: 4, fees: 170000 },
        ],
      },
      placements: {
        create: [
          { year: 2024, highestPackage: 44.0, averagePackage: 8.5 },
          { year: 2025, highestPackage: 50.0, averagePackage: 9.2 },
        ],
      },
      reviews: {
        create: [
          {
            userId: user1.id,
            rating: 4.2,
            comment: 'Huge campus with incredible computing labs and clubs. Hostels and mess systems are very structured. Academic rules are a bit strict.'
          }
        ]
      }
    },
  });

  // College 6: Symbiosis Institute of Business Management
  await prisma.college.create({
    data: {
      name: 'Symbiosis Institute of Business Management (SIBM)',
      location: 'Pune',
      state: 'Maharashtra',
      fees: 1100000,
      rating: 4.5,
      overview: 'SIBM Pune is a premier management institute renowned for its MBA programs. Nestled in the scenic hills of Lavale, Pune, SIBM offers industry-aligned curricula, outstanding international exposure, and highly lucrative placements.',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&auto=format&fit=crop&q=60',
      bannerUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&auto=format&fit=crop&q=80',
      courses: {
        create: [
          { name: 'MBA Marketing', duration: 2, fees: 1100000 },
          { name: 'MBA Finance', duration: 2, fees: 1100000 },
          { name: 'MBA Human Resources', duration: 2, fees: 1050000 },
        ],
      },
      placements: {
        create: [
          { year: 2024, highestPackage: 35.0, averagePackage: 22.1 },
          { year: 2025, highestPackage: 39.0, averagePackage: 24.8 },
        ],
      },
      reviews: {
        create: [
          {
            userId: user3.id,
            rating: 4.5,
            comment: 'Breathtaking hilltop campus. The MBA learning experience is extremely hands-on with excellent guest lectures from corporate leaders.'
          }
        ]
      }
    },
  });

  console.log('Seeding complete! Data loaded successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });