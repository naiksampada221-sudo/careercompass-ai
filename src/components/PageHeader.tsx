import AnimatedSection from "./AnimatedSection";

export default function PageHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <AnimatedSection className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-btn mb-4">
        {icon}
      </div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">{title}</h1>
      <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
    </AnimatedSection>
  );
}
