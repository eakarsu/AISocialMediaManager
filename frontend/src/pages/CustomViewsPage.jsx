import { TrendingUp } from 'lucide-react';
import EngagementTimeline from '../components/EngagementTimeline';
import FollowerGrowth from '../components/FollowerGrowth';
import PostScheduler from '../components/PostScheduler';
import ContentApprovalQueue from '../components/ContentApprovalQueue';

export default function CustomViewsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-purple-400" /> Social Analytics
        </h1>
        <p className="text-slate-400 mt-1">
          Bespoke views: per-platform engagement trends and cumulative follower growth.
        </p>
      </div>

      <EngagementTimeline />
      <FollowerGrowth />
      <PostScheduler />
      <ContentApprovalQueue />
    </div>
  );
}
