import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecommendationTable } from '@/components/dashboard/RecommendationTable';
import { Button } from '@/components/ui/button';

const Recommendations = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">All Recommendations</h1>
        </div>
        <RecommendationTable showAll hideViewAll />
      </div>
    </DashboardLayout>
  );
};

export default Recommendations;