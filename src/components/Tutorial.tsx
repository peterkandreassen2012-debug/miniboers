import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DialogTitle } from '@/components/ui/dialog';

interface TutorialProps {
  onComplete: () => void;
}

interface TutorialStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  route?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    target: '[data-tutorial="logo"]',
    title: 'Velkommen til Minibørs!',
    description: 'Dette er din hovednavigasjon. Klikk på logoen for å komme tilbake til forsiden.',
    position: 'bottom',
  },
  {
    target: '[data-tutorial="marketplace"]',
    title: 'Markedsplass',
    description: 'Her finner du alle tilgjengelige aksjer du kan investere i.',
    position: 'bottom',
  },
  {
    target: '[data-tutorial="auth"]',
    title: 'Logg inn eller Registrer deg',
    description: 'Opprett en konto for å begynne å investere og følge din portefølje.',
    position: 'bottom',
  },
  {
    target: '[data-tutorial="hero"]',
    title: 'Investeringsplattform',
    description: 'Se dagens toppaksjer og markedsoversikt direkte på forsiden.',
    position: 'bottom',
  },
  {
    target: '[data-tutorial="stocks"]',
    title: 'Aksjeoversikt',
    description: 'Bla gjennom alle aksjer, se detaljer og analyser. Klikk på en aksje for mer informasjon.',
    position: 'top',
  },
];

export const Tutorial = ({ onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const step = tutorialSteps[currentStep];
    
    // Navigate if step requires a different route
    if (step.route) {
      navigate(step.route);
    }

    // Wait a bit for navigation and rendering
    const timer = setTimeout(() => {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Calculate tooltip position based on step position
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'bottom':
            top = rect.bottom + scrollY + 20;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case 'top':
            top = rect.top + scrollY - 20;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case 'left':
            top = rect.top + scrollY + rect.height / 2;
            left = rect.left + scrollX - 20;
            break;
          case 'right':
            top = rect.top + scrollY + rect.height / 2;
            left = rect.right + scrollX + 20;
            break;
        }

        setTooltipPosition({ top, left });

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentStep, navigate]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!highlightedElement) return null;

  const rect = highlightedElement.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Dark overlay with cutout */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="highlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={rect.left + scrollX - 8}
                y={rect.top + scrollY - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="hsl(var(--background))"
            opacity="0.9"
            mask="url(#highlight-mask)"
          />
        </svg>

        {/* Highlight border */}
        <div
          className="absolute border-4 border-primary rounded-xl animate-pulse"
          style={{
            top: rect.top + scrollY - 8,
            left: rect.left + scrollX - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[101] pointer-events-auto px-4"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: tutorialSteps[currentStep].position === 'top' 
            ? 'translate(-50%, -100%)' 
            : tutorialSteps[currentStep].position === 'bottom'
            ? 'translate(-50%, 0)'
            : tutorialSteps[currentStep].position === 'left'
            ? 'translate(-100%, -50%)'
            : 'translate(0, -50%)',
        }}
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl p-4 md:p-6 max-w-[90vw] md:max-w-sm animate-scale-in">
          <DialogTitle className="sr-only">Tutorial Steg {currentStep + 1}</DialogTitle>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-foreground mb-2 break-words">
                {tutorialSteps[currentStep].title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground break-words">
                {tutorialSteps[currentStep].description}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors touch-manipulation"
              aria-label="Hopp over"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 gap-4">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {currentStep + 1} av {tutorialSteps.length}
            </span>
            <Button onClick={handleNext} size="sm" className="gap-1 md:gap-2 touch-manipulation">
              <span className="text-xs md:text-sm">{currentStep === tutorialSteps.length - 1 ? 'Fullfør' : 'Neste'}</span>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
