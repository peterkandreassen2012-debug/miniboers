import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 safe-top" data-tutorial="hero">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 border border-primary/20 text-xs md:text-sm font-medium text-primary">
              <Zap className="h-3 w-3 md:h-4 md:w-4" />
              <span className="whitespace-nowrap">Norges største marked for private aksjer</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
              Invester i fremtidens{" "}
              <span className="text-primary">vinnere</span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Få tilgang til eksklusive private aksjer og invester i lovende norske bedrifter før de blir børsnotert.
            </p>

            <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap px-4">
              <Button size="lg" className="text-sm md:text-base px-6 md:px-8 touch-manipulation h-12" onClick={() => navigate('/auth')}>
                Kom i gang
              </Button>
              <Button size="lg" variant="outline" className="text-sm md:text-base px-6 md:px-8 touch-manipulation h-12" onClick={() => {
                document.getElementById('aksjer')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Se aksjer
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-8 md:pt-12 max-w-3xl mx-auto px-4">
              <div className="flex flex-col items-center gap-3 p-4 md:p-6 rounded-xl bg-card border border-border touch-manipulation hover:border-primary/50 transition-colors">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Høy avkastning</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Invester tidlig i vekstbedrifter
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Trygt & sikkert</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Alle bedrifter er godkjent av admin
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Enkelt å bruke</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Kjøp aksjer med bare noen klikk
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="hvordan" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Hvordan virker det?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4 p-6 rounded-xl bg-card border border-border">
              <h3 className="text-2xl font-semibold text-primary">For Investorer</h3>
              <p className="text-muted-foreground leading-relaxed">
                Registrer deg som investor og få tilgang til et utvalg av spennende aksjer fra norske småbedrifter. 
                Invester enkelt og trygt gjennom vår plattform.
              </p>
            </div>
            <div className="space-y-4 p-6 rounded-xl bg-card border border-border">
              <h3 className="text-2xl font-semibold text-primary">For Bedrifter</h3>
              <p className="text-muted-foreground leading-relaxed">
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
