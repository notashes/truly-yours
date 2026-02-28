import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { protocols } from '@/protocols';
import { useProtocolRunner } from '@/engine/useProtocolRunner';
import { useHistory } from '@/hooks/useHistory';
import { Header } from '@/components/layout/Header';
import { InfoNodeComponent } from '@/components/nodes/InfoNode';
import { InstructionNodeComponent } from '@/components/nodes/InstructionNode';
import { QuestionNodeComponent } from '@/components/nodes/QuestionNode';
import { ChecklistNodeComponent } from '@/components/nodes/ChecklistNode';
import { TimerNodeComponent } from '@/components/nodes/TimerNode';
import { WeatherNodeComponent } from '@/components/nodes/WeatherNode';
import type { InfoNode, InstructionNode, QuestionNode, ChecklistNode, TimerNode, WeatherQuestionNode } from '@/types/protocol';

export function ProtocolRunnerPage() {
  const { protocolId } = useParams<{ protocolId: string }>();
  const navigate = useNavigate();
  const { addRun } = useHistory();

  const runner = useProtocolRunner(protocols);

  useEffect(() => {
    if (protocolId && runner.status === 'idle') {
      runner.start(protocolId);
    }
  }, [protocolId, runner.status]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (!runner.currentNode) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-warm-gray">Loading...</p>
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
      </div>
    </div>
  );
}
