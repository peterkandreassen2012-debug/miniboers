import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, TrendingUp, Search, Wallet, Building2, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Velkommen til Minibørs!',
    description: 'Norges største marked for private aksjer. Her kan du investere i fremtidens vinnere og få tilgang til eksklusive investeringsmuligheter.',
    icon: TrendingUp,
    color: 'text-primary',
  },
  {
    title: 'Utforsk aksjer',
    description: 'Bla gjennom hundrevis av spennende norske bedrifter. Se detaljert informasjon, priser, historikk og sektorer.',
    icon: Search,
    color: 'text-blue-500',
  },
  {
    title: 'Invester enkelt',
    description: 'Kjøp aksjer med bare noen få klikk. Velg hvor mange aksjer du vil kjøpe og bekreft - så enkelt er det!',
    icon: Wallet,
    color: 'text-green-500',
  },
  {
    title: 'Følg din portefølje',
    description: 'Se verdien av dine investeringer i sanntid. Få oversikt over gevinst/tap og sammenlign deg med andre investorer.',
    icon: TrendingUp,
    color: 'text-purple-500',
  },
  {
    title: 'Er du en bedrift?',
    description: 'Registrer din bedrift og få tilgang til kapital fra private investorer. Søk om å bli listet på Minibørs!',
    icon: Building2,
    color: 'text-orange-500',
  },
];

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      localStorage.setItem('startTutorial', 'true');
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isVisible} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 border-0 max-h-[90vh] overflow-y-auto">
        <div className="relative bg-gradient-to-br from-primary/10 via-background to-background">
          <DialogTitle className="sr-only">Velkommen til Minibørs - Steg {currentStep + 1} av {steps.length}</DialogTitle>
          
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2 rounded-full hover:bg-background/50 transition-colors touch-manipulation"
            aria-label="Hopp over"
          >
            <X className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          </button>

          {/* Progress bar */}
          <div className="px-4 md:px-8 pt-6 pb-2">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {currentStep + 1} av {steps.length}
            </p>
          </div>

          {/* Content */}
          <div className="px-4 md:px-8 py-8 md:py-12 text-center min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center">
            <div className={`mb-6 md:mb-8 p-4 md:p-6 rounded-full bg-background shadow-lg ${currentStepData.color}`}>
              <Icon className="h-12 w-12 md:h-16 md:w-16" />
            </div>

            <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4 animate-fade-in px-2">
              {currentStepData.title}
            </h2>
            
            <p className="text-sm md:text-lg text-muted-foreground max-w-md animate-fade-in px-4">
              {currentStepData.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 md:px-8 pb-6 md:pb-8 gap-2 md:gap-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-1 md:gap-2 text-xs md:text-sm touch-manipulation"
              size="sm"
            >
              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Tilbake</span>
            </Button>

            {/* Dots indicator */}
            <div className="flex gap-1.5 md:gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-1.5 md:h-2 rounded-full transition-all touch-manipulation ${
                    index === currentStep
                      ? 'w-6 md:w-8 bg-primary'
                      : 'w-1.5 md:w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Gå til steg ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="gap-1 md:gap-2 text-xs md:text-sm touch-manipulation"
              size="sm"
            >
              <span>{currentStep === steps.length - 1 ? 'Start' : 'Neste'}</span>
              {currentStep !== steps.length - 1 && <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
