import AppLayout from '@/components/AppLayout';
import TeamMemberCard, { TeamMember } from '@/components/TeamMemberCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  const { data, error } = await supabase.from('team_members').select('*');
  if (error) throw error;
  return data as TeamMember[];
};

const About = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['team_members'],
    queryFn: fetchTeamMembers,
  });

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Meet the Team</h1>
        {isLoading && <p>Loading team members...</p>}
        {error && <p>Failed to load team members.</p>}
        {data && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map(member => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default About;

