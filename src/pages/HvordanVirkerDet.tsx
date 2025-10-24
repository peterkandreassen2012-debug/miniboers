import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { TrendingUp, Building2, CheckCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HvordanVirkerDet = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Hvordan virker <span className="text-primary">Minibørs</span>?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              En enkel plattform som kobler investorer med lovende norske bedrifter
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="space-y-6 p-8 rounded-2xl bg-card border border-border">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">For Investorer</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Registrer deg</h3>
                    <p className="text-muted-foreground">
                      Opprett en gratis investorkonto på bare noen minutter
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Utforsk aksjer</h3>
                    <p className="text-muted-foreground">
                      Bla gjennom godkjente aksjer fra norske småbedrifter
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Invester enkelt</h3>
                    <p className="text-muted-foreground">
                      Kjøp aksjer direkte gjennom plattformen med bare noen klikk
                    </p>
                  </div>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={() => navigate('/auth')}>
                Bli investor
              </Button>
            </div>

            <div className="space-y-6 p-8 rounded-2xl bg-card border border-border">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">For Bedrifter</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Registrer bedrift</h3>
                    <p className="text-muted-foreground">
                      Opprett en bedriftskonto og kom i gang med kapitalhenting
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Send aksjeforespørsel</h3>
                    <p className="text-muted-foreground">
                      Fyll ut informasjon om bedriften og aksjetilbudet ditt
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Godkjenning og publisering</h3>
                    <p className="text-muted-foreground">
                      Etter admin-godkjenning blir aksjene tilgjengelige for investorer
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-semibold text-primary">
                  Pris: 1500 kr per år
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  For å hoste aksjer på Minibørs
                </p>
              </div>
              <Button size="lg" variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                Registrer bedrift
              </Button>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-muted/30 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">Trygt og transparent</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Alle bedrifter som lister aksjer på Minibørs må godkjennes av admin. 
              Vi sikrer at investorer får tilgang til verifiserte og lovende bedrifter, 
              og at bedriftene får en profesjonell plattform for kapitalhenting. 
              Transaksjoner håndteres sikkert, og alle parter har full oversikt over sine investeringer og aksjeeiendommer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HvordanVirkerDet;
