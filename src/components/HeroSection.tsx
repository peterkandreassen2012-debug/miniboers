import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            <span>Norges største marked for private aksjer</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Invester i fremtidens{" "}
            <span className="text-primary">vinnere</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Få tilgang til eksklusive private aksjer og invester i lovende norske bedrifter før de blir børsnotert.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="text-base px-8" onClick={() => navigate('/auth')}>
              Kom i gang
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" onClick={() => {
              document.getElementById('aksjer')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Se aksjer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
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
  );
};
