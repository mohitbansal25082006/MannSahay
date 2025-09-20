// E:\mannsahay\prisma\seed.ts
import { PrismaClient } from '@prisma/client';
import { BookingStatus, SessionType, VideoPlatform } from '../src/types';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding counselors...');

  // Create 10 counselors
  const counselors = [
    {
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@example.com',
      bio: 'Specializing in student mental health with a focus on academic stress and anxiety management. With 8 years of experience, Dr. Sharma has helped numerous students navigate the challenges of academic life.',
      specialties: ['Anxiety', 'Depression', 'Academic Stress'],
      languages: ['en', 'hi'],
      experience: 8,
      education: 'PhD in Clinical Psychology from Delhi University',
      approach: 'Cognitive Behavioral Therapy (CBT) and Mindfulness-based approaches',
      maxDailySessions: 8,
      bufferTimeMinutes: 15
    },
    {
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      bio: 'Expert in relationship counseling and career guidance for young adults. Dr. Kumar brings 12 years of experience in helping individuals build healthy relationships and make informed career decisions.',
      specialties: ['Relationship Issues', 'Self-Esteem', 'Career Guidance'],
      languages: ['en', 'ta'],
      experience: 12,
      education: 'Masters in Counseling Psychology from Anna University',
      approach: 'Person-Centered Therapy and Solution-Focused Brief Therapy',
      maxDailySessions: 6,
      bufferTimeMinutes: 15
    },
    {
      name: 'Dr. Ananya Reddy',
      email: 'ananya.reddy@example.com',
      bio: 'Compassionate therapist with expertise in trauma recovery and family therapy. Dr. Reddy has 10 years of experience working with individuals and families to heal from trauma and improve communication.',
      specialties: ['Trauma', 'Family Issues', 'Addiction'],
      languages: ['en', 'te', 'hi'],
      experience: 10,
      education: 'PhD in Clinical Psychology from Osmania University',
      approach: 'Trauma-Focused Cognitive Behavioral Therapy and Family Systems Therapy',
      maxDailySessions: 7,
      bufferTimeMinutes: 15
    },
    {
      name: 'Dr. Meera Patel',
      email: 'meera.patel@example.com',
      bio: 'Specializing in adolescent mental health and behavioral issues. Dr. Patel has 7 years of experience working with teenagers and their families to address challenges unique to adolescence.',
      specialties: ['Adolescent Issues', 'Behavioral Problems', 'Parenting'],
      languages: ['en', 'gu'],
      experience: 7,
      education: 'Masters in Child and Adolescent Psychology from Gujarat University',
      approach: 'Cognitive Behavioral Therapy and Family Therapy',
      maxDailySessions: 8,
      bufferTimeMinutes: 15
    },
    {
      name: 'Dr. Vikram Singh',
      email: 'vikram.singh@example.com',
      bio: 'Expert in stress management and workplace mental health. Dr. Singh has 15 years of experience helping professionals manage stress and improve work-life balance.',
      specialties: ['Stress Management', 'Workplace Issues', 'Burnout'],
      languages: ['en', 'hi'],
      experience: 15,
      education: 'PhD in Organizational Psychology from IIT Delhi',
      approach: 'Cognitive Behavioral Therapy and Mindfulness-Based Stress Reduction',
      maxDailySessions: 6,
      bufferTimeMinutes: 15
    },
    {
      name: 'Dr. Sneha Desai',
      email: 'sneha.desai@example.com',
      bio: 'Specializing in women\'s mental health and perinatal psychology. Dr. Desai has 9 years of experience supporting women through various life stages and challenges.',
      specialties: ['Women\'s Issues', 'Perinatal Mental Health', 'Postpartum Depression'],
      languages: ['en', 'mr', 'hi'],
      experience: 9,
      education: 'Masters in Clinical Psychology from Savitribai Phule Pune University',
      approach: 'Interpersonal Psychotherapy and Cognitive Behavioral Therapy',
      maxDailySessions: 7,
      bufferTimeMinutes: 15
    },
    {
      name: 'Dr. Arjun Nair',
      email: 'arjun.nair@example.com',
      bio: 'Expert in addiction counseling and recovery support. Dr. Nair has 11 years of experience helping individuals overcome substance abuse and behavioral addictions.',
      specialties: ['Addiction', 'Substance Abuse', 'Behavioral Addictions'],
      languages: ['en', 'ml', 'ta'],
      experience: 11,
      education: 'PhD in Addiction Psychology from NIMHANS',
      approach: 'Motivational Interviewing and Cognitive Behavioral Therapy',
      maxDailySessions: 6,
      bufferTimeMinutes: 15
    },
    {
      name: 'Dr. Kavita Joshi',
      email: 'kavita.joshi@example.com',
      bio: 'Specializing in grief counseling and loss. Dr. Joshi has 8 years of experience helping individuals navigate the complex emotions associated with loss and bereavement.',
      specialties: ['Grief Counseling', 'Loss', 'Bereavement'],
      languages: ['en', 'hi', 'mr'],
      experience: 8,
      education: 'Masters in Clinical Psychology from Mumbai University',
      approach: 'Grief Therapy and Cognitive Behavioral Therapy',
      maxDailySessions: 7,
      bufferTimeMinutes: 15
    },
    {
      name: 'Dr. Ramesh Iyer',
      email: 'ramesh.iyer@example.com',
      bio: 'Expert in geriatric mental health and dementia care. Dr. Iyer has 13 years of experience working with elderly individuals and their families.',
      specialties: ['Geriatric Mental Health', 'Dementia', 'Caregiver Stress'],
      languages: ['en', 'ta', 'ml'],
      experience: 13,
      education: 'PhD in Geriatric Psychology from Madras University',
      approach: 'Cognitive Stimulation Therapy and Supportive Therapy',
      maxDailySessions: 5,
      bufferTimeMinutes: 15
    },
    {
      name: 'Dr. Fatima Khan',
      email: 'fatima.khan@example.com',
      bio: 'Specializing in multicultural counseling and identity issues. Dr. Khan has 9 years of experience working with individuals from diverse cultural backgrounds.',
      specialties: ['Multicultural Issues', 'Identity Issues', 'Cultural Adjustment'],
      languages: ['en', 'ur', 'hi'],
      experience: 9,
      education: 'PhD in Cross-Cultural Psychology from Jamia Millia Islamia',
      approach: 'Multicultural Therapy and Narrative Therapy',
      maxDailySessions: 7,
      bufferTimeMinutes: 15
    }
  ];

  for (const counselor of counselors) {
    // Create counselor
    const createdCounselor = await prisma.counselor.create({
      data: counselor
    });

    console.log(`Created counselor: ${createdCounselor.name}`);

    // Create availability slots for each counselor (Monday to Friday, 9 AM to 5 PM)
    const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday
    const timeSlots = [
      { start: '09:00', end: '09:50' },
      { start: '10:00', end: '10:50' },
      { start: '11:00', end: '11:50' },
      { start: '14:00', end: '14:50' },
      { start: '15:00', end: '15:50' },
      { start: '16:00', end: '16:50' }
    ];

    for (const day of daysOfWeek) {
      for (const slot of timeSlots) {
        await prisma.availabilitySlot.create({
          data: {
            counselorId: createdCounselor.id,
            dayOfWeek: day,
            startTime: new Date(`2000-01-01T${slot.start}:00`),
            endTime: new Date(`2000-01-01T${slot.end}:00`)
          }
        });
      }
    }

    console.log(`Created availability slots for ${createdCounselor.name}`);
  }

  // Create some group sessions
  const groupSessions = [
    {
      title: 'Managing Academic Stress',
      description: 'Learn effective strategies to cope with academic pressure and exam stress. This session will provide practical tools for time management, study techniques, and stress reduction.',
      maxParticipants: 15,
      sessionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: 60,
      counselorEmail: 'priya.sharma@example.com'
    },
    {
      title: 'Building Healthy Relationships',
      description: 'Explore the foundations of healthy relationships and communication skills. This session will cover boundary setting, effective communication, and conflict resolution.',
      maxParticipants: 12,
      sessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      duration: 90,
      counselorEmail: 'rajesh.kumar@example.com'
    },
    {
      title: 'Mindfulness and Meditation',
      description: 'Introduction to mindfulness practices for stress reduction and mental wellness. Learn simple meditation techniques that can be incorporated into daily life.',
      maxParticipants: 20,
      sessionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      duration: 45,
      counselorEmail: 'ananya.reddy@example.com'
    },
    {
      title: 'Career Planning for Students',
      description: 'Guidance on making informed career decisions and planning for the future. This session will help students identify their strengths and explore career options.',
      maxParticipants: 15,
      sessionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      duration: 75,
      counselorEmail: 'rajesh.kumar@example.com'
    },
    {
      title: 'Overcoming Social Anxiety',
      description: 'Techniques to manage social anxiety in academic and social settings. This session will provide practical strategies for building confidence in social situations.',
      maxParticipants: 10,
      sessionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      duration: 60,
      counselorEmail: 'priya.sharma@example.com'
    }
  ];

  for (const session of groupSessions) {
    const counselor = await prisma.counselor.findUnique({
      where: { email: session.counselorEmail }
    });

    if (counselor) {
      await prisma.groupSession.create({
        data: {
          title: session.title,
          description: session.description,
          maxParticipants: session.maxParticipants,
          sessionDate: session.sessionDate,
          duration: session.duration,
          counselorId: counselor.id
        }
      });

      console.log(`Created group session: ${session.title}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });