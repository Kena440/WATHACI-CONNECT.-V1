import { useEffect, useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const FeedbackWidget = () => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('bug');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (user?.email) {
        setEmail(user.email);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let attachmentUrl: string | null = null;
      if (file) {
        const ext = file.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('feedback-attachments')
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from('feedback-attachments')
          .getPublicUrl(filePath);
        attachmentUrl = data.publicUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('feedback').insert({
        category,
        message,
        attachment_url: attachmentUrl,
        user_id: user?.id,
        user_email: email || user?.email,
      });
      if (error) throw error;
      toast({ title: 'Feedback submitted' });
      setOpen(false);
      setCategory('bug');
      setMessage('');
      setFile(null);
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="sr-only">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              We value your feedback. Let us know your thoughts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment</Label>
            <Input
              id="attachment"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackWidget;

