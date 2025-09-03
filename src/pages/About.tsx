import AppLayout from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import teamMembers from '@/data/team';
import { useTeamFilter } from '@/hooks/use-team-filter';

const allTags = Array.from(
  new Set(teamMembers.flatMap(m => [m.role, ...m.expertise]))
);

const About = () => {
  const {
    query,
    setQuery,
    tags,
    toggleTag,
    filteredMembers,
  } = useTeamFilter(teamMembers);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>

        <div className="space-y-6 mb-8">
          <Input
            placeholder="Search team members..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={tags.includes(tag) ? 'default' : 'outline'}
                onClick={() => toggleTag(tag)}
                className="cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <div key={member.name} className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{member.role}</p>
              <div className="flex flex-wrap gap-1">
                {member.expertise.map(exp => (
                  <Badge key={exp} variant="secondary">
                    {exp}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No team members found.
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default About;
