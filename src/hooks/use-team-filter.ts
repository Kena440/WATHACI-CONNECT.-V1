import { useState, useMemo } from 'react';
import type { TeamMember } from '@/data/team';

export function useTeamFilter(members: TeamMember[]) {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return members.filter(member => {
      const matchesQuery =
        member.name.toLowerCase().includes(lower) ||
        member.role.toLowerCase().includes(lower) ||
        member.expertise.some(exp => exp.toLowerCase().includes(lower));

      const matchesTags =
        tags.length === 0 ||
        tags.some(tag => member.role === tag || member.expertise.includes(tag));

      return matchesQuery && matchesTags;
    });
  }, [members, query, tags]);

  return { query, setQuery, tags, toggleTag, filteredMembers: filtered };
}

export default useTeamFilter;
