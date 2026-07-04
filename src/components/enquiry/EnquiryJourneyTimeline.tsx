import React from 'react';
import { 
  Globe, Eye, FileText, CheckCircle2, Inbox, UserCheck, 
  Clock, MapPin, Clipboard, Sparkles, Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface TimelineEvent {
  id: string;
  timestamp: string;
  stage: string;
  message: string;
}

interface EnquiryJourneyTimelineProps {
  timeline: TimelineEvent[];
  currentStatus: string;
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  'Visited Homepage': <Globe className="w-4 h-4 text-blue-500" />,
  'Viewed Catalog': <Eye className="w-4 h-4 text-purple-500" />,
  'Opened form': <FileText className="w-4 h-4 text-amber-500" />,
  'Submitted Form': <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  'Enquiry Created': <Inbox className="w-4 h-4 text-indigo-500" />,
  'Assignment History': <UserCheck className="w-4 h-4 text-violet-500" />,
  'Follow-up History': <Clock className="w-4 h-4 text-pink-500" />,
  'Site visits': <MapPin className="w-4 h-4 text-red-500" />,
  'Notes': <Clipboard className="w-4 h-4 text-slate-500" />,
  'Lead conversion': <Sparkles className="w-4 h-4 text-cyan-500" />,
  'Customer conversion': <Award className="w-4 h-4 text-yellow-500" />
};

export default function EnquiryJourneyTimeline({ timeline, currentStatus }: EnquiryJourneyTimelineProps) {
  // Normalize the timeline elements to make sure we render them sequentially.
  const sortedTimeline = [...timeline].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  // Funnel steps list for visual checkout header
  const funnelSteps = [
    { name: 'Arrive', completed: true },
    { name: 'Form Sub', completed: true },
    { name: 'Assigned', completed: ['Assigned', 'Contacted', 'Follow-up', 'Interested', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Converted to Lead', 'Converted to Customer'].includes(currentStatus) },
    { name: 'Contacted', completed: ['Contacted', 'Follow-up', 'Interested', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Converted to Lead', 'Converted to Customer'].includes(currentStatus) },
    { name: 'Site Visit', completed: ['Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Converted to Lead', 'Converted to Customer'].includes(currentStatus) },
    { name: 'CRM Lead', completed: ['Converted to Lead', 'Converted to Customer'].includes(currentStatus) },
    { name: 'Customer', completed: currentStatus === 'Converted to Customer' }
  ];

  return (
    <div className="space-y-6" id="enquiry-journey-timeline">
      {/* 1. Header Funnel Stage Tracker */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-500 mb-3 tracking-wider uppercase font-mono">
          Customer funnels stage
        </h4>
        <div className="flex items-center justify-between">
          {funnelSteps.map((step, idx) => (
            <React.Fragment key={step.name}>
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.completed 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {idx + 1}
                </div>
                <span className="text-[9px] font-medium text-slate-500 mt-1">{step.name}</span>
              </div>
              {idx < funnelSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${
                  funnelSteps[idx+1].completed ? 'bg-blue-600' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2. Chronological Vertical Timeline Feed */}
      <div className="relative pl-6 space-y-6 border-l border-slate-200 ml-4 py-2">
        {sortedTimeline.length === 0 ? (
          <div className="text-center py-4 text-slate-400">
            No activities recorded in user journey yet.
          </div>
        ) : (
          sortedTimeline.map((item, idx) => {
            const icon = STAGE_ICONS[item.stage] || STAGE_ICONS['Notes'];
            const formattedDate = new Date(item.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="relative group"
              >
                {/* Node indicator */}
                <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                  {icon}
                </div>

                {/* Content block */}
                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs hover:border-slate-300 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold tracking-wider rounded-md uppercase font-mono mb-1">
                        {item.stage}
                      </span>
                      <h5 className="text-[11px] font-semibold text-slate-800 leading-relaxed">
                        {item.message}
                      </h5>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap pt-1">
                      {formattedDate}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
