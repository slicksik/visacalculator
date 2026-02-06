"use client"
import React, { useState, useMemo } from 'react';
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
  PERMIT_CARD_DEPENDENT: 166,             // Per family member
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

const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#10b981', '#f59e0b', '#ef4444'];

export default function GreeceGoldenVisaCalculator() {
  const [tierId, setTierId] = useState(GREECE_TIERS[0].id);
  const [adults, setAdults] = useState(1);
  const [minors, setMinors] = useState(0);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [expressProcessing, setExpressProcessing] = useState(false);
  const [powerOfAttorney, setPowerOfAttorney] = useState(false);
  const [useMaxHealthInsurance, setUseMaxHealthInsurance] = useState(false);

  const stats = useMemo(() => {
    const tier = GREECE_TIERS.find(t => t.id === tierId)!;
    const purchasePrice = customPrice && Number(customPrice) > 0
      ? Math.max(Number(customPrice), tier.minInvestment)
      : tier.minInvestment;

    // === PROPERTY ACQUISITION COSTS ===
    const transferTax = purchasePrice * FEE_RATES.TRANSFER_TAX;
    const realEstateConsultancy = purchasePrice * FEE_RATES.REAL_ESTATE_CONSULTANCY;

    // Notary fee (1% + 24% VAT)
    const notaryFeeBase = purchasePrice * FEE_RATES.NOTARY_FEE;
    const notaryVAT = notaryFeeBase * VAT_RATE;
    const notaryFeeTotal = notaryFeeBase + notaryVAT;

    // Lawyer's property purchase service fee (1% + 24% VAT)
    const lawyerFeeBase = purchasePrice * FEE_RATES.LAWYER_PROPERTY_FEE;
    const lawyerVAT = lawyerFeeBase * VAT_RATE;
    const lawyerFeeTotal = lawyerFeeBase + lawyerVAT;

    const governmentRegistration = purchasePrice * FEE_RATES.GOVERNMENT_REGISTRATION;

    const totalPropertyCosts = transferTax + realEstateConsultancy + notaryFeeTotal +
      lawyerFeeTotal + governmentRegistration;

    // === RESIDENCE PERMIT COSTS ===
    const permitApplicationPrep = FEE_RATES.PERMIT_APPLICATION_PREP;
    const permitCardMain = FEE_RATES.PERMIT_CARD_MAIN;
    const totalFamilyMembers = adults + minors;
    const permitCardDependents = FEE_RATES.PERMIT_CARD_DEPENDENT * Math.max(0, totalFamilyMembers - 1);

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
      { name: 'Property Purchase', value: purchasePrice },
      { name: 'Transfer Tax (3.09%)', value: transferTax },
      { name: 'Professional Fees', value: realEstateConsultancy + notaryFeeTotal + lawyerFeeTotal },
      { name: 'Gov Registration (0.8%)', value: governmentRegistration },
      { name: 'Permit & Cards', value: permitApplicationPrep + permitCardMain + permitCardDependents + expressProcessingFee },
      { name: 'Health & Translation', value: healthInsurance + translationCosts },
      { name: 'Additional Costs', value: totalAdditionalCosts },
    ].filter(item => item.value > 0);

    const breakdown = {
      property: {
        purchasePrice,
        transferTax,
        realEstateConsultancy,
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
      purchasePrice,
      totalPropertyCosts,
      totalPermitCosts,
      totalAdditionalCosts,
      grandTotal,
      chartData,
      breakdown,
      totalFamilyMembers,
    };
  }, [tierId, adults, minors, customPrice, expressProcessing, powerOfAttorney, useMaxHealthInsurance]);

  const handlePriceChange = (value: string) => {
    if (value === '' || !isNaN(Number(value))) {
      setCustomPrice(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Law 5100/2024 Compliant
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Greece Golden Visa Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete cost breakdown for Greek residency by investment. All fees included.
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
                  Investment Details
                </CardTitle>
                <CardDescription>Select your investment zone and property price</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Investment Zone</Label>
                  <Select value={tierId} onValueChange={setTierId}>
                    <SelectTrigger className="h-auto py-3">
                      <div className="text-left">
                        <div className="font-semibold">{stats.tier.label}</div>
                        <div className="text-xs text-muted-foreground">{stats.tier.subtitle}</div>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {GREECE_TIERS.map(t => (
                        <SelectItem key={t.id} value={t.id} className="py-3">
                          <div className="space-y-1">
                            <div className="font-semibold">{t.label}</div>
                            <div className="text-xs text-muted-foreground">{t.subtitle}</div>
                            <div className="text-sm font-medium text-blue-600">
                              Min: €{t.minInvestment.toLocaleString()}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-900">{stats.tier.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Property Purchase Price (€)</Label>
                  <Input
                    type="text"
                    placeholder={`Min: €${stats.tier.minInvestment.toLocaleString()}`}
                    value={customPrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="h-12 text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the actual property price. Must meet minimum: €{stats.tier.minInvestment.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Family Members
                </CardTitle>
                <CardDescription>Number of applicants for the visa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Adult Applicants (18+)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={adults}
                      onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">Includes main applicant</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Minor Children (Under 18)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={minors}
                      onChange={(e) => setMinors(Math.max(0, Number(e.target.value)))}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">€166 per permit card</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                  <span className="text-sm font-medium">Total family members:</span>
                  <Badge variant="secondary" className="text-base">{stats.totalFamilyMembers}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Optional Services
                </CardTitle>
                <CardDescription>Select additional services if needed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                  <Checkbox
                    id="express"
                    checked={expressProcessing}
                    onChange={(e) => setExpressProcessing(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="express" className="cursor-pointer font-medium">
                      Express Processing
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Faster residence permit processing for all family members (+€3,000)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                  <Checkbox
                    id="poa"
                    checked={powerOfAttorney}
                    onChange={(e) => setPowerOfAttorney(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="poa" className="cursor-pointer font-medium">
                      Power of Attorney
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Grant someone power to act on your behalf (€150-200 + 24% VAT)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                  <Checkbox
                    id="health"
                    checked={useMaxHealthInsurance}
                    onChange={(e) => setUseMaxHealthInsurance(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="health" className="cursor-pointer font-medium">
                      Premium Health Insurance
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use maximum rate (€110 vs €80 per person, age-dependent)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900">
                <strong>Important:</strong> Short-term rentals (Airbnb, booking platforms) are prohibited for Golden Visa properties under Law 5100/2024.
              </AlertDescription>
            </Alert>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-xl border-2 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Total Investment Required
                </CardTitle>
                <div className="text-5xl font-bold text-primary pt-2">
                  €{stats.grandTotal.toLocaleString()}
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
                        formatter={(value: number) => `€${value.toLocaleString()}`}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {stats.chartData.map((item, i) => (
                    <div key={item.name} className="flex justify-between items-center p-2 rounded hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">€{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Detailed Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="property" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="property">Property</TabsTrigger>
                    <TabsTrigger value="permit">Permit</TabsTrigger>
                    <TabsTrigger value="additional">Additional</TabsTrigger>
                  </TabsList>

                  <TabsContent value="property" className="space-y-3 pt-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm font-semibold bg-slate-100 p-2 rounded">
                        <span>Property Purchase</span>
                        <span>€{stats.breakdown.property.purchasePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transfer Tax (3.09%)</span>
                        <span className="font-medium">€{stats.breakdown.property.transferTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Real Estate Consultancy (2%)</span>
                        <span className="font-medium">€{stats.breakdown.property.realEstateConsultancy.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Notary Fee (1% + VAT)</span>
                        <span className="font-medium">€{stats.breakdown.property.notaryFee.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lawyer Fee (1% + VAT)</span>
                        <span className="font-medium">€{stats.breakdown.property.lawyerFee.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gov Registration (0.8%)</span>
                        <span className="font-medium">€{stats.breakdown.property.governmentRegistration.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-blue-600">
                        <span>Total Property Costs</span>
                        <span>€{stats.breakdown.property.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="permit" className="space-y-3 pt-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Application Preparation</span>
                        <span className="font-medium">€{stats.breakdown.permit.permitApplicationPrep.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Main Applicant Card</span>
                        <span className="font-medium">€{stats.breakdown.permit.permitCardMain.toLocaleString()}</span>
                      </div>
                      {stats.breakdown.permit.permitCardDependents > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dependent Cards ({stats.totalFamilyMembers - 1})</span>
                          <span className="font-medium">€{stats.breakdown.permit.permitCardDependents.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Health Insurance ({stats.totalFamilyMembers})</span>
                        <span className="font-medium">€{stats.breakdown.permit.healthInsurance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Translation Costs</span>
                        <span className="font-medium">€{stats.breakdown.permit.translationCosts.toLocaleString()}</span>
                      </div>
                      {stats.breakdown.permit.expressProcessingFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Express Processing</span>
                          <span className="font-medium">€{stats.breakdown.permit.expressProcessingFee.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-blue-600">
                        <span>Total Permit Costs</span>
                        <span>€{stats.breakdown.permit.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="additional" className="space-y-3 pt-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bank Account & Tax Number</span>
                        <span className="font-medium">€{stats.breakdown.additional.bankAccountTaxNumber.toLocaleString()}</span>
                      </div>
                      {stats.breakdown.additional.powerOfAttorneyFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Power of Attorney (+ VAT)</span>
                          <span className="font-medium">€{stats.breakdown.additional.powerOfAttorneyFee.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-blue-600">
                        <span>Total Additional Costs</span>
                        <span>€{stats.breakdown.additional.total.toLocaleString()}</span>
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
                        <p className="font-medium mb-1">Not Included:</p>
                        <ul className="text-xs space-y-1">
                          <li>• Legal check fee (€150) - only if property not suitable</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-slate-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Property & Acquisition</span>
                  <span className="font-bold">€{(stats.purchasePrice + stats.totalPropertyCosts).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Residence Permit Process</span>
                  <span className="font-bold">€{stats.totalPermitCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Additional Services</span>
                  <span className="font-bold">€{stats.totalAdditionalCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 bg-primary/10 px-3 rounded-lg mt-2">
                  <span className="font-bold text-lg">GRAND TOTAL</span>
                  <span className="font-bold text-lg text-primary">€{stats.grandTotal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Information */}
        <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-blue-50">
          <CardHeader>
            <CardTitle>Key Information & Benefits</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Visa Benefits</h4>
              <ul className="text-sm space-y-1.5 list-disc list-inside text-slate-700">
                <li>5-year renewable residency permit</li>
                <li>Visa-free Schengen travel</li>
                <li>No minimum stay requirement</li>
                <li>Family inclusion (spouse, children under 21)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Property Requirements</h4>
              <ul className="text-sm space-y-1.5 list-disc list-inside text-slate-700">
                <li>Single property ≥ 120sqm required</li>
                <li>Must be held for duration of permit</li>
                <li>No short-term rental allowed</li>
                <li>Can be resold after permit granted</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Processing & Timeline</h4>
              <ul className="text-sm space-y-1.5 list-disc list-inside text-slate-700">
                <li>Processing: 6-8 months typically</li>
                <li>Express option available (+€3,000)</li>
                <li>No work rights (investments allowed)</li>
                <li>Tax residency: 183+ days/year</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground pb-8 space-y-2">
          <p className="font-medium">All fees based on official Law 5100/2024 and current market rates (2026).</p>
          <p>This calculator provides detailed estimates. Consult with our team of licensed immigration attorneys and tax advisors for personalized guidance.</p>
        </div>
      </div>
    </div>
  );
}
