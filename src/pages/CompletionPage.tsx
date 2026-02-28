import { useNavigate, useParams } from 'react-router-dom';
import { Celebration } from '@/components/ui/Celebration';
import { BigButton } from '@/components/ui/BigButton';
import { protocols } from '@/protocols';

export function CompletionPage() {
  const navigate = useNavigate();
  const { protocolId } = useParams<{ protocolId: string }>();
  const protocol = protocolId ? protocols[protocolId] : null;

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 bg-surface">
      <Celebration message={`Amazing! You completed ${protocol?.name ?? 'the protocol'}!`} />

      <div className="mt-80 w-full max-w-sm z-10">
        <BigButton onClick={() => navigate('/', { replace: true })}>
          Back to home
        </BigButton>
      </div>
    </div>
  );
}

export function StoppedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 text-center bg-surface">
      <div className="animate-fade-in">
        <div className="text-5xl mb-6">💛</div>
        <h2 className="text-[22px] font-semibold text-on-surface mb-3">That's okay</h2>
        <p className="text-base text-on-surface-variant mb-8 max-w-sm leading-relaxed">
          You showed up, and that's what matters most. You can always come back whenever you're ready.
        </p>
      </div>

      <div className="w-full max-w-sm">
        <BigButton onClick={() => navigate('/', { replace: true })}>
          Back to home
        </BigButton>
      </div>
    </div>
  );
}
