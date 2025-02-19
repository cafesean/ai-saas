'use client';

import { type RouterOutputs } from '@/utils/trpc';
import { Card } from '@/components/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/form/Select2';
import { Input } from '@/components/form/Input';
import Label from '@/components/Label';
import { Button } from '@/components/form/Button';import { Trash } from 'lucide-react';
import { usePricingStore } from '../store/usePricingStore';
import { api } from '@/utils/trpc';
import { formatCurrency } from '@/framework/lib/utils';
import React, { useEffect, useCallback, ChangeEvent } from 'react';
import { debounce } from 'lodash';
import { useRateCardPrices } from '../hooks/useRateCardPrices';

type PricingRole = RouterOutputs['pricing']['getByCode']['pricing_roles'][number];
type Role = RouterOutputs['role']['getAll'][number];
type Level = RouterOutputs['level']['getAll'][number];

interface RoleLevelPricingRowProps {
  role: PricingRole;
  roles: Role[];
  levels: Level[];
  onUpdate: (id: number, updates: any) => void;
}

export const RoleLevelPricingRow = ({ role, roles, levels, onUpdate }: RoleLevelPricingRowProps) => {
  const { updatePricingRole, removePricingRole } = usePricingStore();
  const { getRateCardPrice } = useRateCardPrices();
  const utils = api.useUtils();
  const { mutate: updateRole } = api.pricing.updateRole.useMutation({
    onSuccess: () => {
      utils.pricing.getAll.invalidate();
    },
  });

  const handleUpdateRole = useCallback(
    debounce((updates: any) => {
      // Skip API updates for temporary roles (negative IDs)
      if (role.id < 0) return;

      // Convert empty strings to undefined for optional fields
      const sanitizedUpdates = {
        ...updates,
        override_price:
          updates.override_price === ''
            ? undefined
            : Number(updates.override_price),
        discountRate:
          updates.discountRate === '' ? undefined : Number(updates.discountRate),
        quantity: updates.quantity === '' ? undefined : Number(updates.quantity),
      };

      updateRole({
        id: role.id,
        ...sanitizedUpdates,
      });
    }, 500),
    [role.id, updateRole]
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      const selectedRole = roles.find((r) => r.id === Number(value));
      if (!selectedRole) return;

      const updates = {
        roleId: selectedRole.id,
        role: selectedRole,
      };

      onUpdate(role.id, updates);
      handleUpdateRole(updates);
    },
    [roles, role.id, onUpdate, handleUpdateRole]
  );

  const handleLevelChange = useCallback(
    (value: string) => {
      const selectedLevel = levels.find((l) => l.id === Number(value));
      if (!selectedLevel) return;

      // Get base price from rate card for the selected level
      const basePrice = getRateCardPrice(selectedLevel.id) ?? '0';

      const updates = {
        levelId: selectedLevel.id,
        level: selectedLevel,
        base_price: basePrice,
        final_price: basePrice, // Initially same as base price
      };

      onUpdate(role.id, updates);
      handleUpdateRole(updates);
    },
    [levels, role.id, onUpdate, handleUpdateRole, getRateCardPrice]
  );

  const handleQuantityChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const updates = { quantity: value };
      onUpdate(role.id, updates);
      handleUpdateRole(updates);
    },
    [role.id, onUpdate, handleUpdateRole]
  );

  const handleOverridePriceChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const updates = { override_price: value };
      onUpdate(role.id, updates);
      handleUpdateRole(updates);
    },
    [role.id, onUpdate, handleUpdateRole]
  );

  const handleDiscountRateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const updates = { discountRate: value };
      onUpdate(role.id, updates);
      handleUpdateRole(updates);
    },
    [role.id, onUpdate, handleUpdateRole]
  );

  // Update base price when component mounts or when level changes
  useEffect(() => {
    const basePrice = getRateCardPrice(role.level_id ?? 0) ?? '0';
    if (basePrice !== role.base_price) {
      onUpdate(role.id, {
        base_price: basePrice,
        final_price: basePrice, // Update final price as well
      });
    }
  }, [role.level_id, role.base_price, role.id, getRateCardPrice, onUpdate]);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-6 gap-4">
        <div>
          <Label>Role</Label>
          <Select value={String(role.role_id)} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Level</Label>
          <Select value={String(role.level_id)} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            placeholder="Quantity"
            value={role.quantity ?? ''}
            onChange={handleQuantityChange}
          />
        </div>

        <div>
          <Label>Base Price</Label>
          <Input value={formatCurrency(Number(role.base_price))} disabled />
        </div>

        <div>
          <Label>Override Price</Label>
          <Input
            type="number"
            placeholder="Override price"
            value={role.override_price ?? ''}
            onChange={handleOverridePriceChange}
          />
        </div>

        <div>
          <Label>Discount Rate (%)</Label>
          <Input
            type="number"
            placeholder="Discount rate"
            value={role.discount_rate ?? ''}
            onChange={handleDiscountRateChange}
          />
        </div>

        <div>
          <Label>Final Price</Label>
          <Input value={formatCurrency(Number(role.final_price))} disabled />
        </div>

        <div className="flex items-end">
          <Button
            variant="primary"
            size="lg"
            onClick={() => removePricingRole(role.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}; 