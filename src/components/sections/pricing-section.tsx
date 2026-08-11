import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SiteSettings } from "@/lib/site-content";
import { getDictionary, type Locale } from "@/lib/i18n";

export function PricingSection({ settings, locale }: { settings: SiteSettings; locale: Locale }) {
  const t = getDictionary(locale);
  const unit = locale === "en" ? "/ night" : "/ noapte";

  const plans = [
    {
      name: settings.priceNormalLabel,
      price: `${settings.priceNormal} lei`,
      unit,
      features: settings.priceNormalFeatures.split("\n").filter(Boolean),
      highlighted: false,
    },
    {
      name: settings.priceWeekendLabel,
      price: `${settings.priceWeekend} lei`,
      unit,
      features: settings.priceWeekendFeatures.split("\n").filter(Boolean),
      highlighted: true,
    },
    {
      name: settings.priceLongStayLabel,
      price: `${settings.priceLongStay} lei`,
      unit,
      features: settings.priceLongStayFeatures.split("\n").filter(Boolean),
      highlighted: false,
    },
  ];

  return (
    <section id="preturi" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold sm:text-4xl">{settings.pricingTitle}</h2>
        <p className="mt-3 text-muted-foreground">{settings.pricingSubtitle}</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? "border-primary ring-2 ring-primary/40" : ""}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-lg">{plan.name}</CardTitle>
                {plan.highlighted && <Badge>{t.pricing.popular}</Badge>}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.unit}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
