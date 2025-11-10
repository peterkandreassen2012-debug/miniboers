import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="pt-20 md:pt-32 pb-8 md:pb-20 px-4" data-tutorial="hero">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 border border-primary/20 text-xs md:text-sm font-medium text-primary">
              <Zap className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="whitespace-nowrap text-center">Norges største marked for private aksjer</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight px-2">
              Invester i fremtidens{" "}
              <span className="text-primary">vinnere</span>
            </h1>

            <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Få tilgang til eksklusive private aksjer og invester i lovende norske bedrifter før de blir børsnotert.
            </p>

            <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap px-4">
              <Button size="default" className="text-xs md:text-base px-4 md:px-8 touch-manipulation h-10 md:h-12" onClick={() => navigate('/auth')}>
                Kom i gang
              </Button>
              <Button size="default" variant="outline" className="text-xs md:text-base px-4 md:px-8 touch-manipulation h-10 md:h-12" onClick={() => {
                document.getElementById('aksjer')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Se aksjer
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 pt-6 md:pt-12 max-w-3xl mx-auto px-4">
              <div className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-xl bg-card border border-border touch-manipulation hover:border-primary/50 transition-colors">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm md:text-base">Høy avkastning</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center">
                  Invester tidlig i vekstbedrifter
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-xl bg-card border border-border">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm md:text-base">Trygt & sikkert</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center">
                  Alle bedrifter er godkjent av admin
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-xl bg-card border border-border">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm md:text-base">Enkelt å bruke</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center">
                  Kjøp aksjer med bare noen klikk
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="hvordan" className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 px-2">
            Hvordan virker det?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-3 md:space-y-4 p-4 md:p-6 rounded-xl bg-card border border-border">
              <h3 className="text-lg md:text-2xl font-semibold text-primary">For Investorer</h3>
              <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
                Registrer deg som investor og få tilgang til et utvalg av spennende aksjer fra norske småbedrifter. 
                Invester enkelt og trygt gjennom vår plattform.
              </p>
            </div>
            <div className="space-y-3 md:space-y-4 p-4 md:p-6 rounded-xl bg-card border border-border">
              <h3 className="text-lg md:text-2xl font-semibold text-primary">For Bedrifter</h3>
              <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
                Er du en bedrift som ønsker å hente inn kapital? Registrer deg som bedrift og send inn en aksjeforespørsel. 
                <span className="font-semibold text-foreground"> Bedrifter betaler 1500 kr per år</span> for å hoste aksjer på Minibørs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
