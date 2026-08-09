import { MessageCenter } from '@/components/messaging/MessageCenter';
import { NeedOffers } from '@/components/sme/NeedOffers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/AppLayout';
import PageHero from '@/components/PageHero';
import heroMessages from '@/assets/hero-messages.jpg';

const Messages = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <PageHero
          title="Messages"
          description="Connect and communicate with other users on the platform"
          backgroundImage={heroMessages}
        />

        <div className="max-w-6xl mx-auto px-6 py-8">
          <Tabs defaultValue="conversations">
            <TabsList className="mb-6">
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="offers">Offers to Help</TabsTrigger>
            </TabsList>
            <TabsContent value="conversations">
              <MessageCenter />
            </TabsContent>
            <TabsContent value="offers">
              <NeedOffers />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Messages;
