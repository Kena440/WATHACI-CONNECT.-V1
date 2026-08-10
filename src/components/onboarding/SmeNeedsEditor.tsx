import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { businessCategories, urgencyOptions, SmeNeedInput } from '@/data/businessCategories';

interface SmeNeedsEditorProps {
  value: SmeNeedInput[];
  onChange: (needs: SmeNeedInput[]) => void;
}

const emptyNeed = (): SmeNeedInput => ({
  category: '',
  description: '',
  budget_range_min: null,
  budget_range_max: null,
  urgency: 'medium',
});

export function SmeNeedsEditor({ value, onChange }: SmeNeedsEditorProps) {
  const needs = value ?? [];

  const update = (index: number, patch: Partial<SmeNeedInput>) => {
    onChange(needs.map((n, i) => (i === index ? { ...n, ...patch } : n)));
  };

  const remove = (index: number) => onChange(needs.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {needs.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add each business need separately so professionals can offer help on the right one.
        </p>
      )}

      {needs.map((need, index) => (
        <Card key={need.id ?? index} className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <Label>Category *</Label>
              <Select value={need.category || ''} onValueChange={(v) => update(index, { category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {businessCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-8"
              onClick={() => remove(index)}
              aria-label="Remove need"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={2}
              placeholder="Briefly describe what you need help with..."
              value={need.description ?? ''}
              onChange={(e) => update(index, { description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Budget from (ZMW)</Label>
              <Input
                type="number"
                min="0"
                value={need.budget_range_min ?? ''}
                onChange={(e) =>
                  update(index, { budget_range_min: e.target.value === '' ? null : Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Budget to (ZMW)</Label>
              <Input
                type="number"
                min="0"
                value={need.budget_range_max ?? ''}
                onChange={(e) =>
                  update(index, { budget_range_max: e.target.value === '' ? null : Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Urgency</Label>
              <Select
                value={need.urgency}
                onValueChange={(v) => update(index, { urgency: v as SmeNeedInput['urgency'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={() => onChange([...needs, emptyNeed()])}>
        <Plus className="mr-2 h-4 w-4" />
        Add a need
      </Button>
    </div>
  );
}

export default SmeNeedsEditor;
