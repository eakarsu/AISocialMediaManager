import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import Accounts from './pages/Accounts';
import Campaigns from './pages/Campaigns';
import Hashtags from './pages/Hashtags';
import Templates from './pages/Templates';
import AnalyticsPage from './pages/AnalyticsPage';
import Competitors from './pages/Competitors';
import BrandVoice from './pages/BrandVoice';
import AutoReplies from './pages/AutoReplies';
import Team from './pages/Team';
import Reports from './pages/Reports';
import Calendar from './pages/Calendar';
import AIGenerator from './pages/AIGenerator';
import ContentCalendar from './pages/ContentCalendar';
import ScheduledPosts from './pages/ScheduledPosts';
import PerformanceAnalytics from './pages/PerformanceAnalytics';
import AIInsights from './pages/AIInsights';

// === Batch 07 Gaps & Frontend Mounts ===
import CfAgenticSocialManager from './pages/CfAgenticSocialManager';
import CfCrossplatformContentAdaptation from './pages/CfCrossplatformContentAdaptation';
import CfViralPotentialScoring from './pages/CfViralPotentialScoring';
import CfCompetitorBenchmarking from './pages/CfCompetitorBenchmarking';
import CfMicroinfluencerMatching from './pages/CfMicroinfluencerMatching';
import CfSentimentdrivenResponse from './pages/CfSentimentdrivenResponse';
import GapNoPostingtimeoptimizerEngagementbased from './pages/GapNoPostingtimeoptimizerEngagementbased';
import GapNoContentmixrecommender from './pages/GapNoContentmixrecommender';
import GapNoCompetitorcontentswipeTopperformingAnal from './pages/GapNoCompetitorcontentswipeTopperformingAnal';
import GapNoInfluencerfinder from './pages/GapNoInfluencerfinder';
import GapNoAudiencesentimentanalysisAggregatePerce from './pages/GapNoAudiencesentimentanalysisAggregatePerce';
import GapNoPlatformApiIntegrationToActuallyPubl from './pages/GapNoPlatformApiIntegrationToActuallyPubl';
import GapNoCommentdmManagementRoutes from './pages/GapNoCommentdmManagementRoutes';
import GapNoEmployeeAdvocacyProgram from './pages/GapNoEmployeeAdvocacyProgram';
import GapNoPaidAdvertisingManagement from './pages/GapNoPaidAdvertisingManagement';
import GapNoInfluencerOutreachWorkflow from './pages/GapNoInfluencerOutreachWorkflow';
import GapNoCrisisDetectionalertsOnSocialListenin from './pages/GapNoCrisisDetectionalertsOnSocialListenin';
// === End Batch 07 ===


function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<Posts />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="hashtags" element={<Hashtags />} />
        <Route path="templates" element={<Templates />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="brand-voice" element={<BrandVoice />} />
        <Route path="auto-replies" element={<AutoReplies />} />
        <Route path="team" element={<Team />} />
        <Route path="reports" element={<Reports />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="ai-generator" element={<AIGenerator />} />
        <Route path="content-calendar" element={<ContentCalendar />} />
        <Route path="scheduled-posts" element={<ScheduledPosts />} />
        <Route path="performance-analytics" element={<PerformanceAnalytics />} />
        <Route path="ai-insights" element={<AIInsights />} />
      </Route>
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-agentic-social-manager' element={<CfAgenticSocialManager />} />
          <Route path='/cf-crossplatform-content-adaptation' element={<CfCrossplatformContentAdaptation />} />
          <Route path='/cf-viral-potential-scoring' element={<CfViralPotentialScoring />} />
          <Route path='/cf-competitor-benchmarking' element={<CfCompetitorBenchmarking />} />
          <Route path='/cf-microinfluencer-matching' element={<CfMicroinfluencerMatching />} />
          <Route path='/cf-sentimentdriven-response' element={<CfSentimentdrivenResponse />} />
          <Route path='/gap-no-postingtimeoptimizer-engagementbased' element={<GapNoPostingtimeoptimizerEngagementbased />} />
          <Route path='/gap-no-contentmixrecommender' element={<GapNoContentmixrecommender />} />
          <Route path='/gap-no-competitorcontentswipe-topperforming-anal' element={<GapNoCompetitorcontentswipeTopperformingAnal />} />
          <Route path='/gap-no-influencerfinder' element={<GapNoInfluencerfinder />} />
          <Route path='/gap-no-audiencesentimentanalysis-aggregate-perce' element={<GapNoAudiencesentimentanalysisAggregatePerce />} />
          <Route path='/gap-no-platform-api-integration-to-actually-publ' element={<GapNoPlatformApiIntegrationToActuallyPubl />} />
          <Route path='/gap-no-commentdm-management-routes' element={<GapNoCommentdmManagementRoutes />} />
          <Route path='/gap-no-employee-advocacy-program' element={<GapNoEmployeeAdvocacyProgram />} />
          <Route path='/gap-no-paid-advertising-management' element={<GapNoPaidAdvertisingManagement />} />
          <Route path='/gap-no-influencer-outreach-workflow' element={<GapNoInfluencerOutreachWorkflow />} />
          <Route path='/gap-no-crisis-detectionalerts-on-social-listenin' element={<GapNoCrisisDetectionalertsOnSocialListenin />} />
          // === End Batch 07 ===
    </Routes>
  );
}
