import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Edit, BarChart3 } from "lucide-react";

const TUTORIAL_STORAGE_KEY = "custos-plus-tutorial-completed";

export function WelcomeTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const tutorialCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!tutorialCompleted) {
      // Mostrar tutorial após um pequeno delay
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const steps = [
    {
      icon: Plus,
      title: "Crie Referências",
      description: "Adicione seus produtos e referências de confecção no sistema.",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Edit,
      title: "Insira Custos",
      description: "Registre todas as despesas de produção: mão-de-obra e matéria-prima.",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: BarChart3,
      title: "Visualize KPIs",
      description: "Acompanhe custos médios, análises por família e gráficos em tempo real.",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

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

  const handleSkip = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleComplete = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bem-vindo ao Custos Plus!</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <span className="text-3xl">💡</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Bem-vindo ao Custos Plus!
            </h2>
            <p className="text-muted-foreground">
              Aprenda a usar o sistema em 3 passos simples
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={index}
                  className={`text-center transition-all ${
                    isActive ? "scale-105" : "opacity-60"
                  }`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all ${
                      isActive ? step.bgColor : "bg-muted"
                    }`}
                  >
                    <div className="relative">
                      <Icon
                        className={`h-10 w-10 ${
                          isActive ? step.color : "text-muted-foreground"
                        }`}
                      />
                      <div
                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isCompleted
                            ? "bg-green-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-primary w-8"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={handleSkip}>
              Pular Tutorial
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Anterior
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep < steps.length - 1 ? "Próximo" : "Começar"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
