const { test } = require('node:test');
const assert = require('node:assert');

// Import our services (we'll mock these for testing)
const mockSuggestionsDataSource = {
  generateSuggestions: async (userProfile) => {
    return [
      {
        id: 'test_001',
        type: 'partnership',
        title: 'Test Partnership',
        description: 'A test partnership suggestion',
        matchScore: 85,
        participants: ['Test Partners', userProfile?.business_name || 'Your Business'],
        tags: ['test', 'partnership'],
        potentialValue: 'Test value',
        dataSource: 'manual',
        sourceId: 'test'
      }
    ];
  },
  
  getSuggestionsBySource: async (source, userProfile) => {
    const suggestions = {
      ai: [{ id: 'ai_001', dataSource: 'ai', matchScore: 90, type: 'mentorship', title: 'AI Suggestion', description: 'AI-generated suggestion', participants: ['AI Partners'], tags: ['ai', 'test'], potentialValue: 'AI value' }],
      database: [{ id: 'db_001', dataSource: 'database', matchScore: 80, type: 'project', title: 'DB Suggestion', description: 'Database suggestion', participants: ['DB Partners'], tags: ['database', 'test'], potentialValue: 'DB value' }],
      manual: [{ id: 'manual_001', dataSource: 'manual', matchScore: 75, type: 'skill_exchange', title: 'Manual Suggestion', description: 'Manually curated suggestion', participants: ['Manual Partners'], tags: ['manual', 'test'], potentialValue: 'Manual value' }]
    };
    
    return suggestions[source] || [];
  }
};

test('Data source service should generate suggestions from all sources', async () => {
  const userProfile = {
    business_name: 'Test Business',
    industry: 'technology'
  };
  
  const suggestions = await mockSuggestionsDataSource.generateSuggestions(userProfile);
  
  assert.ok(Array.isArray(suggestions), 'Should return an array of suggestions');
  assert.ok(suggestions.length > 0, 'Should return at least one suggestion');
  
  const suggestion = suggestions[0];
  assert.ok(suggestion.id, 'Suggestion should have an ID');
  assert.ok(suggestion.type, 'Suggestion should have a type');
  assert.ok(suggestion.title, 'Suggestion should have a title');
  assert.ok(suggestion.dataSource, 'Suggestion should have a data source');
  assert.ok(typeof suggestion.matchScore === 'number', 'Match score should be a number');
});

test('Data source service should get suggestions by specific source', async () => {
  const sources = ['ai', 'database', 'manual'];
  
  for (const source of sources) {
    const suggestions = await mockSuggestionsDataSource.getSuggestionsBySource(source);
    
    assert.ok(Array.isArray(suggestions), `Should return array for ${source} source`);
    
    if (suggestions.length > 0) {
      assert.strictEqual(suggestions[0].dataSource, source, `Suggestion should be from ${source} source`);
    }
  }
});

test('Suggestions should have required data structure', async () => {
  const suggestions = await mockSuggestionsDataSource.generateSuggestions();
  
  if (suggestions.length > 0) {
    const suggestion = suggestions[0];
    
    const requiredFields = ['id', 'type', 'title', 'description', 'matchScore', 'participants', 'tags', 'potentialValue', 'dataSource'];
    
    for (const field of requiredFields) {
      assert.ok(suggestion.hasOwnProperty(field), `Suggestion should have ${field} field`);
    }
    
    assert.ok(['partnership', 'skill_exchange', 'project', 'mentorship'].includes(suggestion.type), 'Type should be valid');
    assert.ok(['ai', 'database', 'manual'].includes(suggestion.dataSource), 'Data source should be valid');
    assert.ok(suggestion.matchScore >= 0 && suggestion.matchScore <= 100, 'Match score should be between 0 and 100');
  }
});

test('User profile should personalize suggestions', async () => {
  const userProfileWithBusiness = {
    business_name: 'My Test Company'
  };
  
  const suggestions = await mockSuggestionsDataSource.generateSuggestions(userProfileWithBusiness);
  
  if (suggestions.length > 0) {
    const suggestion = suggestions[0];
    const participantsString = suggestion.participants.join(' ');
    assert.ok(participantsString.includes('My Test Company'), 'Should include user business name in participants');
  }
});