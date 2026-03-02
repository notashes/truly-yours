import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContentStore } from '@/store/useContentStore';
import { useProtocolRunner, getSavedRunnerProtocolId } from '@/engine/useProtocolRunner';
import { useHistory } from '@/hooks/useHistory';
import { Header } from '@/components/layout/Header';
import { InfoNodeComponent } from '@/components/nodes/InfoNode';
import { InstructionNodeComponent } from '@/components/nodes/InstructionNode';
import { QuestionNodeComponent } from '@/components/nodes/QuestionNode';
import { ChecklistNodeComponent } from '@/components/nodes/ChecklistNode';
import { TimerNodeComponent } from '@/components/nodes/TimerNode';
import { WeatherNodeComponent } from '@/components/nodes/WeatherNode';
import { ReferenceListLinkNodeComponent } from '@/components/nodes/ReferenceListLinkNode';
import type { InfoNode, InstructionNode, QuestionNode, ChecklistNode, TimerNode, WeatherQuestionNode, ReferenceListLinkNode } from '@/types/protocol';

export function ProtocolRunnerPage() {
  const { protocolId } = useParams<{ protocolId: string }>();
  const navigate = useNavigate();
  const { addRun } = useHistory();
  const { allProtocols, allReferenceLists } = useContentStore();

  const runner = useProtocolRunner(allProtocols);
  const [showResume, setShowResume] = useState<boolean | null>(null);

  // Check for saved state on mount
  useEffect(() => {
    if (protocolId && runner.status === 'idle' && showResume === null) {
      const savedId = getSavedRunnerProtocolId();
      if (savedId === protocolId) {
        setShowResume(true);
      } else {
        setShowResume(false);
        runner.start(protocolId);
      }
    }
  }, [protocolId, runner.status, showResume]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (runner.status === 'completed' || runner.status === 'stopped') {
      const run = runner.getRun();
      if (run) addRun(run);

      if (runner.status === 'completed') {
        navigate(`/protocol/${protocolId}/done`, { replace: true });
      } else {
        navigate(`/protocol/${protocolId}/stopped`, { replace: true });
      }
      runner.reset();
    }
  }, [runner.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resume prompt
  if (showResume) {
    const protocol = protocolId ? allProtocols[protocolId] : null;
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 bg-surface">
        <div className="animate-fade-in text-center max-w-sm">
          <div className="text-5xl mb-5">{protocol?.emoji ?? '📋'}</div>
          <h2 className="text-xl font-semibold text-on-surface mb-2">Welcome back</h2>
          <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
            You were in the middle of <span className="font-medium text-on-surface">{protocol?.name ?? 'this protocol'}</span>. Pick up where you left off?
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => { setShowResume(false); runner.resume(); }}
              className="w-full py-3.5 rounded-2xl bg-primary text-on-primary text-sm font-semibold
                transition-all active:scale-[0.97]"
            >
              Continue where I left off
            </button>
            <button
              onClick={() => { setShowResume(false); if (protocolId) runner.start(protocolId); }}
              className="w-full py-3.5 rounded-2xl bg-surface-container-low text-on-surface text-sm font-medium
                transition-all active:scale-[0.97]"
            >
              Start fresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!runner.currentNode) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  const handleStopEarly = () => {
    runner.stopEarly();
  };

  const handleBack = () => {
    runner.stopEarly();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-full">
      <Header
        title={runner.currentProtocolName}
        progress={runner.progress}
        onStopEarly={handleStopEarly}
        onBack={handleBack}
      />

      <div className="max-w-lg mx-auto" key={runner.currentNode.id}>
        {runner.currentNode.type === 'info' && (
          <InfoNodeComponent node={runner.currentNode as InfoNode} onComplete={runner.completeInfo} />
        )}
        {runner.currentNode.type === 'instruction' && (
          <InstructionNodeComponent node={runner.currentNode as InstructionNode} onComplete={runner.completeInstruction} />
        )}
        {runner.currentNode.type === 'question' && (
          <QuestionNodeComponent node={runner.currentNode as QuestionNode} onSelect={runner.selectOption} />
        )}
        {runner.currentNode.type === 'checklist' && (
          <ChecklistNodeComponent
            node={runner.currentNode as ChecklistNode}
            results={runner.checklistResults}
            onToggle={runner.toggleChecklistItem}
            onComplete={runner.completeChecklist}
          />
        )}
        {runner.currentNode.type === 'timer' && (
          <TimerNodeComponent node={runner.currentNode as TimerNode} onComplete={runner.completeTimer} />
        )}
        {runner.currentNode.type === 'weather-question' && (
          <WeatherNodeComponent node={runner.currentNode as WeatherQuestionNode} onSelect={runner.selectWeatherOption} />
        )}
        {runner.currentNode.type === 'reference-list-link' && (
          <ReferenceListLinkNodeComponent
            node={runner.currentNode as ReferenceListLinkNode}
            referenceList={allReferenceLists[(runner.currentNode as ReferenceListLinkNode).referenceListId]}
            onComplete={runner.completeReferenceListLink}
          />
        )}
      </div>
    </div>
  );
}
