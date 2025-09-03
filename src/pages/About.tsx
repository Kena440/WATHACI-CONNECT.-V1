import React from 'react';
import TeamMemberCard from '@/components/team/TeamMemberCard';

const teamMembers = [
  {
    avatarUrl: '/placeholder.svg',
    name: 'Alice Smith',
    role: 'CEO',
    bio: 'Leads company strategy and operations.',
    expertise: ['Leadership', 'Vision']
  },
  {
    avatarUrl: '/placeholder.svg',
    name: 'Bob Johnson',
    role: 'CTO',
    bio: 'Oversees technology and product development.',
    expertise: ['Engineering', 'Architecture']
  },
  {
    avatarUrl: '/placeholder.svg',
    name: 'Carol Williams',
    role: 'COO',
    bio: 'Ensures efficient business processes.',
    expertise: ['Operations', 'Management']
  }
];

export default function About() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl space-y-12">
      <section aria-labelledby="mission-heading">
        <h1 className="text-3xl font-bold mb-6 text-center">About Us</h1>
        <h2 id="mission-heading" className="text-2xl font-semibold mb-2">Mission</h2>
        <p className="text-sm leading-relaxed">
          Our mission is to empower businesses and professionals through
          innovative solutions and collaborative opportunities.
        </p>
      </section>

      <section aria-labelledby="vision-heading">
        <h2 id="vision-heading" className="text-2xl font-semibold mb-2">Vision</h2>
        <p className="text-sm leading-relaxed">
          We envision a connected ecosystem where ideas and expertise flow freely
          to drive sustainable growth and success.
        </p>
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-2xl font-semibold mb-2">History</h2>
        <p className="text-sm leading-relaxed">
          Founded on a passion for collaboration, our platform has evolved from a
          small community initiative into a comprehensive network supporting
          enterprises across the region.
        </p>
      </section>

      <section aria-labelledby="team-heading">
        <h2 id="team-heading" className="text-2xl font-semibold mb-4">
          Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.name} {...member} />
          ))}
        </div>
      </section>
    </main>
  );
}

