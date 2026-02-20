"use client"
import React, { useState, useMemo } from 'react';
import Link from "next/link";
import { Locale, localeToIntl, slugs, tiers, ui } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';
import { Info, TrendingUp, Users, Home, AlertCircle, FileText, Banknote } from 'lucide-react';

const GREECE_TIERS = [

  {
    id: 'tier-250',
    label: 'Conversion/Restoration',
    subtitle: 'Nationwide',
    minInvestment: 250000,
    description: 'Commercial-to-residential conversion or listed building restoration.'
  },
  {
    id: 'tier-400',
    label: 'Standard Zone',
    subtitle: 'Rest of Greece',
    minInvestment: 400000,
    description: 'Regional mainland and small islands. Single property ≥ 120sqm.'
  },
  {
    id: 'tier-800',
    label: 'Prime Zone',
    subtitle: 'Athens, Thessaloniki, Mykonos, Santorini',
    minInvestment: 800000,
    description: 'Includes islands > 3,100 residents. Single property ≥ 120sqm.'
  },

];

const VAT_RATE = 0.24;

const FEE_RATES = {
  // Property Acquisition (all based on property price)
  TRANSFER_TAX: 0.0309,                    // 3.09%
  REAL_ESTATE_CONSULTANCY: 0.02,          // 2%
  NOTARY_FEE: 0.01,                       // 1% + 24% VAT
  LAWYER_PROPERTY_FEE: 0.01,              // 1% + 24% VAT
  GOVERNMENT_REGISTRATION: 0.008,         // 0.8%

  // Residence Permit Costs
  PERMIT_APPLICATION_PREP: 2000,          // Legal service fee
  PERMIT_CARD_MAIN: 2016,                 // Main applicant card
  PERMIT_CARD_CHILD_15_PLUS: 150,         // Per child (15+)
  PERMIT_CARD_CHILD_UNDER_15: 16,         // Per child (<15)
  HEALTH_INSURANCE_MIN: 80,               // Per person (age-based: €80-110)
  HEALTH_INSURANCE_MAX: 110,
  TRANSLATION_COSTS: 300,

  // Additional Costs
  BANK_ACCOUNT_TAX_NUMBER: 300,
  LEGAL_CHECK_FEE: 150,                   // Only if property not suitable
  POWER_OF_ATTORNEY_MIN: 150,             // €150-200
  POWER_OF_ATTORNEY_MAX: 200,

  // Optional
  EXPRESS_PROCESSING: 3000,               // Optional faster processing
};

const COLORS = [
  '#1E3A8A',
  '#2563EB',
  '#7C3AED',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#0EA5E9',
];

type Props = {
  locale: Locale;
};

export default function GreeceGoldenVisaCalculator({ locale }: Props) {
  const t = ui[locale];
  const tierText = tiers[locale];
  const numberLocale = localeToIntl[locale];
  const formatNumber = (value: number) => value.toLocaleString(numberLocale);

  const [tierId, setTierId] = useState(GREECE_TIERS[0].id);
  const [adults, setAdults] = useState(1);
  const [children15Plus, setChildren15Plus] = useState(0);
  const [childrenUnder15, setChildrenUnder15] = useState(0);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [expressProcessing, setExpressProcessing] = useState(false);
  const [powerOfAttorney, setPowerOfAttorney] = useState(false);
  const [useMaxHealthInsurance, setUseMaxHealthInsurance] = useState(false);

  const stats = useMemo(() => {
    const tier = GREECE_TIERS.find(t => t.id === tierId)!;
    const tierIndex = GREECE_TIERS.findIndex(t => t.id === tierId);
    const text = tierText[tierIndex] ?? tierText[0];
    const purchasePrice = customPrice && Number(customPrice) > 0
      ? Math.max(Number(customPrice), tier.minInvestment)
      : tier.minInvestment;

    // === PROPERTY ACQUISITION COSTS ===
    const transferTax = purchasePrice * FEE_RATES.TRANSFER_TAX;

    // Real Estate Consultancy (2% + 24% VAT)
    const realEstateConsultancyBase = purchasePrice * FEE_RATES.REAL_ESTATE_CONSULTANCY;
    const realEstateConsultancyVAT = realEstateConsultancyBase * VAT_RATE;
    const realEstateConsultancyTotal = realEstateConsultancyBase + realEstateConsultancyVAT;

    // Notary fee (1% + 24% VAT)
    const notaryFeeBase = purchasePrice * FEE_RATES.NOTARY_FEE;
    const notaryVAT = notaryFeeBase * VAT_RATE;
    const notaryFeeTotal = notaryFeeBase + notaryVAT;

    // Lawyer's property purchase service fee (1% + 24% VAT)
    const lawyerFeeBase = purchasePrice * FEE_RATES.LAWYER_PROPERTY_FEE;
    const lawyerVAT = lawyerFeeBase * VAT_RATE;
    const lawyerFeeTotal = lawyerFeeBase + lawyerVAT;

    const governmentRegistration = purchasePrice * FEE_RATES.GOVERNMENT_REGISTRATION;

    const totalPropertyCosts = transferTax + realEstateConsultancyTotal + notaryFeeTotal +
      lawyerFeeTotal + governmentRegistration;

    // === RESIDENCE PERMIT COSTS ===
    const permitApplicationPrep = FEE_RATES.PERMIT_APPLICATION_PREP;
    const permitCardMain = FEE_RATES.PERMIT_CARD_MAIN;
    const totalFamilyMembers = adults + children15Plus + childrenUnder15;
    const permitCardDependents = (children15Plus * FEE_RATES.PERMIT_CARD_CHILD_15_PLUS) +
      (childrenUnder15 * FEE_RATES.PERMIT_CARD_CHILD_UNDER_15);

    const healthInsuranceRate = useMaxHealthInsurance
      ? FEE_RATES.HEALTH_INSURANCE_MAX
      : FEE_RATES.HEALTH_INSURANCE_MIN;
    const healthInsurance = healthInsuranceRate * totalFamilyMembers;

    const translationCosts = FEE_RATES.TRANSLATION_COSTS;
    const expressProcessingFee = expressProcessing ? FEE_RATES.EXPRESS_PROCESSING : 0;

    const totalPermitCosts = permitApplicationPrep + permitCardMain + permitCardDependents +
      healthInsurance + translationCosts + expressProcessingFee;

    // === ADDITIONAL COSTS ===
    const bankAccountTaxNumber = FEE_RATES.BANK_ACCOUNT_TAX_NUMBER;

    let powerOfAttorneyFee = 0;
    if (powerOfAttorney) {
      const poaBase = FEE_RATES.POWER_OF_ATTORNEY_MAX; // Using max value
      const poaVAT = poaBase * VAT_RATE; // 24% VAT if paid via bank transfer
      powerOfAttorneyFee = poaBase + poaVAT;
    }

    const totalAdditionalCosts = bankAccountTaxNumber + powerOfAttorneyFee;

    // === GRAND TOTAL ===
    const grandTotal = purchasePrice + totalPropertyCosts + totalPermitCosts + totalAdditionalCosts;

    // Chart data
    const chartData = [
      { name: t.propertyPurchase, value: purchasePrice },
      { name: t.transferTax, value: transferTax },
      { name: t.professionalFees, value: realEstateConsultancyTotal + notaryFeeTotal + lawyerFeeTotal },
      { name: t.govRegistration, value: governmentRegistration },
      { name: t.permitAndCards, value: permitApplicationPrep + permitCardMain + permitCardDependents + expressProcessingFee },
      { name: t.healthAndTranslation, value: healthInsurance + translationCosts },
      { name: t.totalAdditional, value: totalAdditionalCosts },
    ].filter(item => item.value > 0);

    const breakdown = {
      property: {
        purchasePrice,
        transferTax,
        realEstateConsultancy: { base: realEstateConsultancyBase, vat: realEstateConsultancyVAT, total: realEstateConsultancyTotal },
        notaryFee: { base: notaryFeeBase, vat: notaryVAT, total: notaryFeeTotal },
        lawyerFee: { base: lawyerFeeBase, vat: lawyerVAT, total: lawyerFeeTotal },
        governmentRegistration,
        total: totalPropertyCosts,
      },
      permit: {
        permitApplicationPrep,
        permitCardMain,
        permitCardDependents,
        healthInsurance,
        translationCosts,
        expressProcessingFee,
        total: totalPermitCosts,
      },
      additional: {
        bankAccountTaxNumber,
        powerOfAttorneyFee,
        total: totalAdditionalCosts,
      },
    };

    return {
      tier,
      tierText: text,
      purchasePrice,
      totalPropertyCosts,
      totalPermitCosts,
      totalAdditionalCosts,
      grandTotal,
      chartData,
      breakdown,
      totalFamilyMembers,
    };
  }, [tierId, adults, children15Plus, childrenUnder15, customPrice, expressProcessing, powerOfAttorney, useMaxHealthInsurance, tierText]);

  const handlePriceChange = (value: string) => {
    if (value === '' || !isNaN(Number(value))) {
      setCustomPrice(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {t.badgeLaw}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t.language}</span>
              <div className="flex items-center gap-2">
                {(["en", "tr", "el"] as Locale[]).map((lang) => (
                  <Link
                    key={lang}
                    href={`/${lang}/${slugs[lang]}`}
                    className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${
                      lang === locale
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-accent border-border text-foreground"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Main Calculator Grid */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  {t.investmentDetails}
                </CardTitle>
                <CardDescription>{t.investmentDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">{t.investmentZone}</Label>
                  <Select value={tierId} onValueChange={setTierId}>
                    <SelectTrigger className="h-auto py-3">
                      <div className="text-left">
                        <div className="font-semibold">{stats.tierText.label}</div>
                        <div className="text-xs text-muted-foreground">{stats.tierText.subtitle}</div>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {GREECE_TIERS.map((tier, index) => (
                        <SelectItem key={tier.id} value={tier.id} className="py-3">
                          <div className="space-y-1">
                            <div className="font-semibold">{tierText[index]?.label ?? tier.label}</div>
                            <div className="text-xs text-muted-foreground">{tierText[index]?.subtitle ?? tier.subtitle}</div>
                            <div className="text-sm font-medium text-primary">
                              {`${ui[locale].minLabel}: €${formatNumber(tier.minInvestment)}`}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg border border-border">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{stats.tierText.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">{t.propertyPrice}</Label>
                  <Input
                    type="text"
                    placeholder={`${t.minLabel}: €${formatNumber(stats.tier.minInvestment)}`}
                    value={customPrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="h-12 text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.propertyHintPrefix} €{formatNumber(stats.tier.minInvestment)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t.familyTitle}
                </CardTitle>
                <CardDescription>{t.familyDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t.adultsLabel}</Label>
                    <Input
                      type="number"
                      min={1}
                      value={adults}
                      onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">{t.adultsHint}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.children15PlusLabel}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={children15Plus}
                      onChange={(e) => setChildren15Plus(Math.max(0, Number(e.target.value)))}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">{t.children15PlusHint}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.childrenUnder15Label}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={childrenUnder15}
                      onChange={(e) => setChildrenUnder15(Math.max(0, Number(e.target.value)))}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">{t.childrenUnder15Hint}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">{t.totalFamily}</span>
                  <Badge variant="secondary" className="text-base">{stats.totalFamilyMembers}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t.optionalTitle}
                </CardTitle>
                <CardDescription>{t.optionalDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                  <Checkbox
                    id="express"
                    checked={expressProcessing}
                    onChange={(e) => setExpressProcessing(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="express" className="cursor-pointer font-medium">
                      {t.expressTitle}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t.expressDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                  <Checkbox
                    id="poa"
                    checked={powerOfAttorney}
                    onChange={(e) => setPowerOfAttorney(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="poa" className="cursor-pointer font-medium">
                      {t.poaTitle}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t.poaDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                  <Checkbox
                    id="health"
                    checked={useMaxHealthInsurance}
                    onChange={(e) => setUseMaxHealthInsurance(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="health" className="cursor-pointer font-medium">
                      {t.healthTitle}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t.healthDesc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-border bg-muted">
              <AlertCircle className="h-4 w-4 text-foreground" />
              <AlertDescription className="text-foreground">
                <strong>{t.alertTitle}</strong> {t.alertBody}
              </AlertDescription>
            </Alert>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-xl border-2 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t.totalInvestment}
                </CardTitle>
                <div className="text-5xl font-bold text-primary pt-2">
                  €{formatNumber(stats.grandTotal)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.chartData}
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {stats.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        formatter={(value: number) => `€${formatNumber(value)}`}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--background))',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {stats.chartData.map((item, i) => (
                    <div key={item.name} className="flex justify-between items-center p-2 rounded hover:bg-accent transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-foreground">€{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{t.breakdownTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="property" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="property">{t.tabProperty}</TabsTrigger>
                    <TabsTrigger value="permit">{t.tabPermit}</TabsTrigger>
                    <TabsTrigger value="additional">{t.tabAdditional}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="property" className="space-y-3 pt-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm font-semibold bg-muted p-2 rounded">
                        <span>{t.propertyPurchase}</span>
                        <span>€{formatNumber(stats.breakdown.property.purchasePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.transferTax}</span>
                        <span className="font-medium">€{formatNumber(stats.breakdown.property.transferTax)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.consultancy}</span>
                        <span className="font-medium">€{formatNumber(stats.breakdown.property.realEstateConsultancy.total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.notaryFee}</span>
                        <span className="font-medium">€{formatNumber(stats.breakdown.property.notaryFee.total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.lawyerFee}</span>
                        <span className="font-medium">€{formatNumber(stats.breakdown.property.lawyerFee.total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.govRegistration}</span>
                        <span className="font-medium">€{formatNumber(stats.breakdown.property.governmentRegistration)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-primary">
                        <span>{t.totalProperty}</span>
                        <span>€{formatNumber(stats.breakdown.property.total)}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="permit" className="space-y-3 pt-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.applicationPrep}</span>
                        <span className="font-medium">€{formatNumber(stats.breakdown.permit.permitApplicationPrep)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.mainCard}</span>
                        <span className="font-medium">€{formatNumber(stats.breakdown.permit.permitCardMain)}</span>
                      </div>
                      {stats.breakdown.permit.permitCardDependents > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t.childrenCards} ({children15Plus + childrenUnder15})
                          </span>
                          <span className="font-medium">€{formatNumber(stats.breakdown.permit.permitCardDependents)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.healthInsurance} ({stats.totalFamilyMembers})</span>
                        <span className="font-medium">€{formatNumber(stats.breakdown.permit.healthInsurance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.translationCosts}</span>
                        <span className="font-medium">€{formatNumber(stats.breakdown.permit.translationCosts)}</span>
                      </div>
                      {stats.breakdown.permit.expressProcessingFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.expressProcessing}</span>
                          <span className="font-medium">€{formatNumber(stats.breakdown.permit.expressProcessingFee)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-primary">
                        <span>{t.totalPermit}</span>
                        <span>€{formatNumber(stats.breakdown.permit.total)}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="additional" className="space-y-3 pt-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.bankAccount}</span>
                        <span className="font-medium">€{formatNumber(stats.breakdown.additional.bankAccountTaxNumber)}</span>
                      </div>
                      {stats.breakdown.additional.powerOfAttorneyFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.powerOfAttorney}</span>
                          <span className="font-medium">€{formatNumber(stats.breakdown.additional.powerOfAttorneyFee)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-primary">
                        <span>{t.totalAdditional}</span>
                        <span>€{formatNumber(stats.breakdown.additional.total)}</span>
                      </div>
                      <div className="mt-3 p-3 bg-muted rounded-lg text-sm text-foreground">
                        <p className="font-medium mb-1">{t.notIncluded}</p>
                        <ul className="text-xs space-y-1">
                          <li>• {t.legalCheck}</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  {t.costSummary}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">{t.propertyAndAcquisition}</span>
                  <span className="font-bold">€{formatNumber(stats.purchasePrice + stats.totalPropertyCosts)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">{t.residencePermitProcess}</span>
                  <span className="font-bold">€{formatNumber(stats.totalPermitCosts)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">{t.additionalServices}</span>
                  <span className="font-bold">€{formatNumber(stats.totalAdditionalCosts)}</span>
                </div>
                <div className="flex justify-between py-3 bg-primary/10 px-3 rounded-lg mt-2">
                  <span className="font-bold text-lg">{t.grandTotal}</span>
                  <span className="font-bold text-lg text-primary">€{formatNumber(stats.grandTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Information */}
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle>{t.keyInfo}</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t.visaBenefits}</h4>
              <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                {t.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t.propertyReqs}</h4>
              <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                {t.propertyReqList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t.processingTimeline}</h4>
              <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                {t.processingList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground pb-8 space-y-2">
          <p className="font-medium">{t.footerLaw}</p>
          <p>{t.footerDisclaimer}</p>
        </div>
      </div>
    </div>
  );
}
