import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { businessCategories, FreelancerServiceInput } from '@/data/businessCategories';

interface FreelancerServicesEditorProps {
  value: FreelancerServiceInput[];
  onChange: (services: FreelancerServiceInput[]) => void;
}

const emptyService = (): FreelancerServiceInput => ({
  category: '',
  title: '',
  deliverable: '',
  price: null,
  currency: 'ZMW',
});

export function FreelancerServicesEditor({ value, onChange }: FreelancerServicesEditorProps) {
  const services = value ?? [];

  const update = (index: number, patch: Partial<FreelancerServiceInput>) => {
    onChange(services.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const remove = (index: number) => onChange(services.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {services.length === 0 && (
        <p className="text-sm text-muted-foreground">
          List each service separately with a category so businesses can find the exact help they need.
        </p>
      )}

      {services.map((service, index) => (
        <Card key={service.id ?? index} className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={service.category || ''} onValueChange={(v) => update(index, { category: v })}>
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
              <div className="space-y-2">
                <Label>Service title *</Label>
                <Input
                  placeholder="e.g. Monthly bookkeeping"
                  value={service.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-8"
              onClick={() => remove(index)}
              aria-label="Remove service"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Deliverable (one line)</Label>
            <Textarea
              rows={2}
              placeholder="What the client receives, e.g. Reconciled monthly accounts + ZRA-ready reports"
              value={service.deliverable ?? ''}
              onChange={(e) => update(index, { deliverable: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                min="0"
                value={service.price ?? ''}
                onChange={(e) => update(index, { price: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={service.currency} onValueChange={(v) => update(index, { currency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZMW">ZMW</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={() => onChange([...services, emptyService()])}>
        <Plus className="mr-2 h-4 w-4" />
        Add a service
      </Button>
    </div>
  );
}

export default FreelancerServicesEditor;
