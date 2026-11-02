import React from 'react';
import { X, CheckCircle2, ShieldAlert, Sparkles, Send, Award, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRoster } from '../../context/RosterContext';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ isOpen, onClose }) => {
  const {
    pods,
    employees,
    metadata,
    conflicts,
    togglePodApproval,
    publishRoster,
    unpublishRoster,
  } = useRoster();

  if (!isOpen) return null;

  const criticalConflicts = conflicts.filter(c => c.severity === 'CRITICAL');
  const allPodsApproved = pods.every(p => !!metadata.approvedByPodLeads[p.id]);
  const isPublished = metadata.status === 'PUBLISHED';

  const handlePublish = () => {
    publishRoster();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Roster Approval & Publishing Workflow
              </h2>
              <p className="text-xs text-slate-500">
                Pod Leads validation & Operations Manager publication sign-off
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Current Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isPublished
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Workflow Status
              </span>
              <span className="text-sm font-extrabold flex items-center gap-1.5 mt-0.5">
                {isPublished ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    PUBLISHED & ACTIVE
                  </>
                ) : (
                  'DRAFT / IN REVIEW'
                )}
              </span>
              {metadata.publishedAt && (
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Published: {new Date(metadata.publishedAt).toLocaleString()}
                </span>
              )}
            </div>

            {criticalConflicts.length > 0 ? (
              <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold">
                {criticalConflicts.length} Unresolved Gaps
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                Zero Gaps
              </span>
            )}
          </div>

          {/* Pod Leads Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Pod Leads Sign-Off Review:
            </h4>
            
            <div className="space-y-2">
              {pods.map(pod => {
                const lead = employees.find(e => e.id === pod.leadId);
                const isApproved = !!metadata.approvedByPodLeads[pod.id];

                return (
                  <div
                    key={pod.id}
                    onClick={() => togglePodApproval(pod.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isApproved
                        ? 'border-teal-300 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                        {pod.name}
                        <span className="text-slate-400 font-normal">· Lead: {lead?.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isApproved ? 'Approved by Pod Lead' : 'Click to approve this pod’s schedule'}
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      isApproved
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isApproved && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {criticalConflicts.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Note: Publishing with active gaps is permitted for emergency scheduling, but resolving gaps via the Conflicts tab is highly recommended first.
              </span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
          {isPublished ? (
            <button
              onClick={unpublishRoster}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Revert to Draft
            </button>
          ) : (
            <span className="text-xs text-slate-400">
              {allPodsApproved ? 'All pods approved!' : 'Pending some pod lead approvals'}
            </span>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Close
            </button>

            {!isPublished && (
              <button
                onClick={handlePublish}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                Publish Roster
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
