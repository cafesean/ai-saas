# Role Level Pricing Implementation Plan

## User Flow
1. Rate Card Selection
   - User selects rate card from dropdown
   - Rate card details are displayed
   - "Next" button appears
   - Click "Next" → Role Level Pricing page

2. Role Level Pricing
   - Table shows with base prices from rate card
   - User can add/edit/remove roles
   - Each role shows calculated prices
   - "Save Pricing" button at bottom

3. Save & Return
   - Click "Save Pricing"
   - Create pricing record
   - Return to pricing list
   - Show new pricing in table

## Implementation Tasks

### 1. Rate Card Selection Page ⚡️ CURRENT FOCUS
- [ ] Update page structure:
  ```typescript
  // src/app/(admin)/pricing/new/page.tsx
  export default function NewPricingPage() {
    return (
      <Tabs defaultValue="ratecard">
        <TabsList>
          <TabsTrigger value="ratecard">Rate Card</TabsTrigger>
          <TabsTrigger value="roles" disabled={!hasRateCard}>Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="ratecard">
          <RateCardSelection onComplete={handleRateCardSelect} />
        </TabsContent>
        <TabsContent value="roles">
          <RoleLevelPricing />
        </TabsContent>
      </Tabs>
    );
  }
  ```

- [ ] Update RateCardSelection:
  ```typescript
  interface RateCardSelectionProps {
    onComplete: (rateCardId: number) => void;
  }
  ```
  - [ ] Show Next button after selection
  - [ ] Load rate card prices on selection
  - [ ] Store selection in Zustand

### 2. Role Level Pricing Table
- [ ] Fix current issues:
  - [ ] Type mismatch in updatePricingRole
  - [ ] Validation state tracking
  - [ ] Pending changes handling

- [ ] Add price calculations:
  ```typescript
  interface CalculatedPrices {
    basePrice: number;
    finalPrice: number;
    discount: number | null;
  }

  const calculatePrices = (row: TableRow): CalculatedPrices => {
    const base = row.base_price * row.quantity;
    const override = row.override_price;
    const discount = row.discount_rate;
    // ... calculation logic
  }
  ```

### 3. Save Flow
- [ ] Add SaveButton component:
  ```typescript
  const SaveButton = () => {
    const isDirty = usePricingStore(s => s.isDirty);
    const isValid = usePricingStore(s => s.isValid);
    
    return (
      <Button 
        disabled={!isDirty || !isValid}
        onClick={handleSave}
      >
        Save Pricing
      </Button>
    );
  }
  ```

- [ ] Implement save handler:
  ```typescript
  const handleSave = async () => {
    try {
      await createPricing.mutateAsync({
        ratecard_id: selectedRateCard,
        pricing_roles: transformedRoles,
        // ... other data
      });
      
      router.push('/pricing');
      toast.success('Pricing created successfully');
    } catch (error) {
      toast.error('Failed to create pricing');
    }
  }
  ```

### 4. Store Updates
- [ ] Update usePricingStore:
  ```typescript
  interface PricingStore {
    // New fields
    selectedRateCard: number | null;
    baseRates: Record<number, string>;
    isDirty: boolean;
    isValid: boolean;

    // New actions
    setSelectedRateCard: (id: number) => void;
    setBaseRates: (rates: Record<number, string>) => void;
    validateAll: () => boolean;
  }
  ```

### 5. Navigation
- [ ] Add proper routing:
  ```typescript
  // src/app/(admin)/pricing/new/layout.tsx
  export default function NewPricingLayout({
    children
  }: {
    children: React.ReactNode
  }) {
    return (
      <div>
        <Breadcrumb />
        <Progress />
        {children}
      </div>
    );
  }
  ```

## Next Steps
1. Update RateCardSelection to show Next button
2. Fix validation in role level pricing table
3. Add proper price calculations
4. Implement save flow
5. Add navigation and UX improvements

## Current Focus
Fixing the RateCardSelection component to enable proper flow to the role level pricing page. 