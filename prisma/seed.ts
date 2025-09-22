// E:\mannsahay\prisma\seed.ts
import { PrismaClient } from '@prisma/client';
import { BookingStatus, SessionType, VideoPlatform } from '../src/types';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with comprehensive data...');

  // Create 12 counselors
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
    },
    {
      name: 'Mohit',
      email: 'mohitsuper1@gmail.com',
      bio: 'Specializing in youth counseling with a focus on digital wellness and online behavior. With 5 years of experience, Mohit helps young people navigate the challenges of the digital age.',
      specialties: ['Digital Wellness', 'Online Behavior', 'Youth Counseling'],
      languages: ['en', 'hi'],
      experience: 5,
      education: 'Masters in Counseling Psychology from Amity University',
      approach: 'Digital Cognitive Behavioral Therapy and Positive Psychology',
      maxDailySessions: 6,
      bufferTimeMinutes: 15
    },
    {
      name: 'Mohit Bansal',
      email: 'mohitbansal25082006@gmail.com',
      bio: 'Expert in student counseling with a focus on career guidance and academic performance. Mohit has 4 years of experience helping students achieve their academic and career goals.',
      specialties: ['Career Guidance', 'Academic Performance', 'Student Counseling'],
      languages: ['en', 'hi'],
      experience: 4,
      education: 'Masters in Educational Psychology from Delhi University',
      approach: 'Solution-Focused Therapy and Career Assessment',
      maxDailySessions: 7,
      bufferTimeMinutes: 15
    }
  ];

  const createdCounselors = [];
  for (const counselor of counselors) {
    // Create counselor
    const createdCounselor = await prisma.counselor.create({
      data: counselor
    });

    createdCounselors.push(createdCounselor);
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

  // Create test users
  const testUsers = [
    { name: 'Alex Johnson', email: 'alex@example.com', hashedId: 'alex123' },
    { name: 'Sam Smith', email: 'sam@example.com', hashedId: 'sam123' },
    { name: 'Taylor Brown', email: 'taylor@example.com', hashedId: 'taylor123' },
    { name: 'Jordan Lee', email: 'jordan@example.com', hashedId: 'jordan123' },
    { name: 'Casey Davis', email: 'casey@example.com', hashedId: 'casey123' }
  ];

  const createdUsers = [];
  for (const user of testUsers) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
    createdUsers.push(createdUser);
    console.log(`Created user: ${createdUser.name}`);
  }

  // Create bookings with realistic data
  const bookings = [
    // Alex's bookings with Dr. Priya Sharma
    {
      userId: createdUsers[0].id, // Alex
      counselorId: createdCounselors[0].id, // Dr. Priya Sharma
      slotTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      status: BookingStatus.CONFIRMED,
      sessionType: SessionType.ONE_ON_ONE,
      notes: 'Struggling with exam anxiety'
    },
    {
      userId: createdUsers[0].id, // Alex
      counselorId: createdCounselors[0].id, // Dr. Priya Sharma
      slotTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      status: BookingStatus.COMPLETED,
      sessionType: SessionType.ONE_ON_ONE,
      notes: 'Initial anxiety assessment'
    },
    {
      userId: createdUsers[0].id, // Alex
      counselorId: createdCounselors[0].id, // Dr. Priya Sharma
      slotTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      endTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      status: BookingStatus.COMPLETED,
      sessionType: SessionType.ONE_ON_ONE,
      notes: 'Follow-up session, showing improvement'
    },
    
    // Sam's bookings with Dr. Rajesh Kumar
    {
      userId: createdUsers[1].id, // Sam
      counselorId: createdCounselors[1].id, // Dr. Rajesh Kumar
      slotTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      status: BookingStatus.CONFIRMED,
      sessionType: SessionType.ONE_ON_ONE,
      notes: 'Relationship issues with family'
    },
    {
      userId: createdUsers[1].id, // Sam
      counselorId: createdCounselors[1].id, // Dr. Rajesh Kumar
      slotTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      status: BookingStatus.COMPLETED,
      sessionType: SessionType.ONE_ON_ONE,
      notes: 'Career counseling session'
    },
    
    // Taylor's bookings with Dr. Ananya Reddy
    {
      userId: createdUsers[2].id, // Taylor
      counselorId: createdCounselors[2].id, // Dr. Ananya Reddy
      slotTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      status: BookingStatus.CONFIRMED,
      sessionType: SessionType.ONE_ON_ONE,
      notes: 'Trauma recovery session'
    },
    {
      userId: createdUsers[2].id, // Taylor
      counselorId: createdCounselors[2].id, // Dr. Ananya Reddy
      slotTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      status: BookingStatus.COMPLETED,
      sessionType: SessionType.ONE_ON_ONE,
      notes: 'Depression symptoms improving'
    },
    
    // Jordan's bookings with Dr. Mohit (Digital Wellness)
    {
      userId: createdUsers[3].id, // Jordan
      counselorId: createdCounselors[10].id, // Mohit
      slotTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      status: BookingStatus.CONFIRMED,
      sessionType: SessionType.ONE_ON_ONE,
      notes: 'Social media addiction concerns'
    },
    
    // Casey's bookings with Dr. Mohit Bansal (Career Guidance)
    {
      userId: createdUsers[4].id, // Casey
      counselorId: createdCounselors[11].id, // Mohit Bansal
      slotTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      status: BookingStatus.CONFIRMED,
      sessionType: SessionType.ONE_ON_ONE,
      notes: 'Career planning confusion'
    }
  ];

  const createdBookings = [];
  for (const booking of bookings) {
    const createdBooking = await prisma.booking.create({ data: booking });
    createdBookings.push(createdBooking);
    console.log(`Created booking for user ${booking.userId} with counselor ${booking.counselorId}`);
  }

  // Create mood entries with realistic data showing different trends
  await prisma.moodEntry.createMany({
    data: [
      // Alex's mood entries (improving trend)
      { mood: 4, userId: createdUsers[0].id, bookingId: createdBookings[1].id }, // Initial anxiety
      { mood: 5, userId: createdUsers[0].id, bookingId: createdBookings[2].id }, // Slight improvement
      { mood: 6, userId: createdUsers[0].id, bookingId: createdBookings[0].id }, // Current improvement
      { mood: 7, userId: createdUsers[0].id }, // Latest mood
      
      // Sam's mood entries (stable with slight improvement)
      { mood: 6, userId: createdUsers[1].id, bookingId: createdBookings[4].id }, // Career stress
      { mood: 7, userId: createdUsers[1].id, bookingId: createdBookings[3].id }, // Relationship session
      { mood: 7, userId: createdUsers[1].id }, // Stable mood
      
      // Taylor's mood entries (declining then improving)
      { mood: 5, userId: createdUsers[2].id, bookingId: createdBookings[6].id }, // Depression symptoms
      { mood: 4, userId: createdUsers[2].id }, // Before last session
      { mood: 5, userId: createdUsers[2].id, bookingId: createdBookings[5].id }, // After session
      
      // Jordan's mood entries (concerned about digital wellness)
      { mood: 5, userId: createdUsers[3].id }, // Initial mood
      { mood: 4, userId: createdUsers[3].id }, // Worsening
      
      // Casey's mood entries (confused about career)
      { mood: 6, userId: createdUsers[4].id }, // Initial mood
      { mood: 5, userId: createdUsers[4].id }  // Slightly concerned
    ]
  });

  // Create session notes with realistic content
  await prisma.sessionNote.createMany({
    data: [
      {
        content: 'Client shows significant anxiety related to upcoming exams. Recommended breathing exercises and study schedule adjustments. Noted improvement in self-awareness.',
        userId: createdUsers[0].id,
        counselorId: createdCounselors[0].id,
        bookingId: createdBookings[0].id,
        isPrivate: false
      },
      {
        content: 'Family conflicts causing stress. Suggested communication strategies and boundary setting. Client seems receptive to advice.',
        userId: createdUsers[1].id,
        counselorId: createdCounselors[1].id,
        bookingId: createdBookings[3].id,
        isPrivate: true
      },
      {
        content: 'Depression symptoms showing improvement. Client reports better sleep and appetite. Continue current treatment plan and monitor progress.',
        userId: createdUsers[2].id,
        counselorId: createdCounselors[2].id,
        bookingId: createdBookings[5].id,
        isPrivate: false
      },
      {
        content: 'Initial assessment completed. Client experiencing trauma symptoms. Will begin trauma-focused CBT in next session.',
        userId: createdUsers[2].id,
        counselorId: createdCounselors[2].id,
        bookingId: createdBookings[6].id,
        isPrivate: true
      },
      {
        content: 'Social media usage affecting daily functioning. Discussed digital detox strategies and healthy online habits.',
        userId: createdUsers[3].id,
        counselorId: createdCounselors[10].id,
        bookingId: createdBookings[7].id,
        isPrivate: false
      },
      {
        content: 'Client confused about career path. Administered career assessment test. Will review results in next session.',
        userId: createdUsers[4].id,
        counselorId: createdCounselors[11].id,
        bookingId: createdBookings[8].id,
        isPrivate: false
      }
    ]
  });

  // Create feedback with realistic comments
  await prisma.feedback.createMany({
    data: [
      {
        rating: 4,
        content: 'Very helpful session. Practical techniques for managing anxiety. Dr. Sharma is very understanding.',
        userId: createdUsers[0].id,
        bookingId: createdBookings[0].id
      },
      {
        rating: 5,
        content: 'Excellent counselor. Really understands my situation and provides actionable advice.',
        userId: createdUsers[1].id,
        bookingId: createdBookings[3].id
      },
      {
        rating: 5,
        content: 'Feeling much better after our sessions. Dr. Reddy is compassionate and professional.',
        userId: createdUsers[2].id,
        bookingId: createdBookings[5].id
      },
      {
        rating: 4,
        content: 'Good session, would like more practical exercises for digital wellness.',
        userId: createdUsers[3].id,
        bookingId: createdBookings[7].id
      },
      {
        rating: 5,
        content: 'Mohit Bansal provided great career insights. Feeling more confident about my path now.',
        userId: createdUsers[4].id,
        bookingId: createdBookings[8].id
      }
    ]
  });

  // Create video sessions for all bookings
  for (const booking of createdBookings) {
    await prisma.videoSession.create({
      data: {
        platform: VideoPlatform.GOOGLE_MEET,
        bookingId: booking.id,
        meetingUrl: `https://meet.google.com/abc-defg-hij-${booking.id}`
      }
    });
  }

  // Create group sessions with different counselors
  const groupSessions = [
    {
      title: 'Managing Academic Stress',
      description: 'Learn effective strategies to cope with academic pressure and exam stress. This session will provide practical tools for time management, study techniques, and stress reduction.',
      maxParticipants: 15,
      sessionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: 60,
      counselorId: createdCounselors[0].id // Dr. Priya Sharma
    },
    {
      title: 'Building Healthy Relationships',
      description: 'Explore the foundations of healthy relationships and communication skills. This session will cover boundary setting, effective communication, and conflict resolution.',
      maxParticipants: 12,
      sessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      duration: 90,
      counselorId: createdCounselors[1].id // Dr. Rajesh Kumar
    },
    {
      title: 'Digital Wellness Workshop',
      description: 'Learn how to maintain a healthy relationship with technology and social media. This workshop will cover digital detox strategies and healthy online habits.',
      maxParticipants: 20,
      sessionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      duration: 60,
      counselorId: createdCounselors[10].id // Mohit
    },
    {
      title: 'Career Planning for Students',
      description: 'Guidance on making informed career decisions and planning for the future. This session will help students identify their strengths and explore career options.',
      maxParticipants: 15,
      sessionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      duration: 75,
      counselorId: createdCounselors[11].id // Mohit Bansal
    },
    {
      title: 'Trauma Recovery Support Group',
      description: 'A supportive space for individuals recovering from trauma. This session will focus on healing strategies and building resilience.',
      maxParticipants: 10,
      sessionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      duration: 90,
      counselorId: createdCounselors[2].id // Dr. Ananya Reddy
    },
    {
      title: 'Women\'s Mental Health Circle',
      description: 'A safe space for women to discuss mental health challenges unique to their experiences. This session will focus on empowerment and support.',
      maxParticipants: 12,
      sessionDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      duration: 75,
      counselorId: createdCounselors[5].id // Dr. Sneha Desai
    }
  ];

  const createdGroupSessions = [];
  for (const session of groupSessions) {
    const createdGroupSession = await prisma.groupSession.create({
      data: session
    });
    createdGroupSessions.push(createdGroupSession);
    console.log(`Created group session: ${session.title}`);
  }

  // Add participants to group sessions
  for (let i = 0; i < Math.min(createdGroupSessions.length, createdUsers.length); i++) {
    // Add first 3 users to first group session
    if (i < 3) {
      await prisma.groupSessionParticipant.create({
        data: {
          groupSessionId: createdGroupSessions[0].id,
          userId: createdUsers[i].id
        }
      });
    }
    
    // Add users 1, 2, 3 to second group session
    if (i < 3 && i > 0) {
      await prisma.groupSessionParticipant.create({
        data: {
          groupSessionId: createdGroupSessions[1].id,
          userId: createdUsers[i].id
        }
      });
    }
    
    // Add users 0, 3, 4 to third group session (Digital Wellness)
    if (i === 0 || i === 3 || i === 4) {
      await prisma.groupSessionParticipant.create({
        data: {
          groupSessionId: createdGroupSessions[2].id,
          userId: createdUsers[i].id
        }
      });
    }
  }

  // Create notifications for users
  await prisma.notification.createMany({
    data: [
      {
        title: 'Booking Confirmed',
        message: 'Your session with Dr. Priya Sharma has been confirmed for next week',
        type: 'BOOKING_CONFIRMED',
        userId: createdUsers[0].id,
        metadata: { bookingId: createdBookings[0].id }
      },
      {
        title: 'Group Session Reminder',
        message: 'Reminder: Digital Wellness Workshop starts in 2 days',
        type: 'GROUP_SESSION_REMINDER',
        userId: createdUsers[0].id,
        metadata: { groupSessionId: createdGroupSessions[2].id }
      },
      {
        title: 'Session Feedback Request',
        message: 'Please rate your recent session with Dr. Rajesh Kumar',
        type: 'FEEDBACK_REQUEST',
        userId: createdUsers[1].id,
        metadata: { bookingId: createdBookings[3].id }
      }
    ]
  });

  console.log('Seeding completed successfully!');
  console.log(`Created ${createdCounselors.length} counselors`);
  console.log(`Created ${createdUsers.length} users`);
  console.log(`Created ${createdBookings.length} bookings`);
  console.log(`Created ${createdGroupSessions.length} group sessions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });