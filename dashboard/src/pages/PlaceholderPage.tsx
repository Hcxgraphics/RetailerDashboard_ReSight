import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Construction className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground max-w-md">{description}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
