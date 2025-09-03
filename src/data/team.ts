export interface TeamMember {
  name: string;
  role: string;
  expertise: string[];
  image?: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: 'Alice Mwila',
    role: 'CEO',
    expertise: ['Leadership', 'Strategy'],
  },
  {
    name: 'Brian Zulu',
    role: 'CTO',
    expertise: ['Frontend', 'Backend', 'DevOps'],
  },
  {
    name: 'Chipo Banda',
    role: 'Designer',
    expertise: ['UI', 'UX', 'Frontend'],
  },
  {
    name: 'Diana Phiri',
    role: 'Marketing',
    expertise: ['Marketing', 'Content'],
  },
];

export default teamMembers;
