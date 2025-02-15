'use client';

import React from 'react';
import { useStore } from '@/store';
import { RateCard, Level, LevelRate } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFormValidation } from '@/hooks/useFormValidation';
import { rateCardSchema } from '@/schemas';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../../components/ui/alert-dialog';
import { ArrowUpDown } from 'lucide-react';

interface NewRateCard {
  name: string;
  description: string;
  effectiveDate: string;
  levelRates: LevelRate[];
}

type RateCardWithDate = Omit<NewRateCard, 'effectiveDate'> & {
  effectiveDate: Date;
};

const emptyRateCard: NewRateCard = {
  name: '',
  description: '',
  effectiveDate: '',
  levelRates: [],
};

const formatDate = (date: Date) => {
  // Use UTC methods to ensure consistent formatting between server and client
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
};

type SortConfig = {
  key: keyof RateCard;
  direction: 'asc' | 'desc';
} | null;

export default function RateCardsPage() {
  const { rateCards, levels, addRateCard, updateRateCard, deleteRateCard } = useStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [selectedRateCard, setSelectedRateCard] = React.useState<RateCard | null>(null);
  const [newRateCard, setNewRateCard] = React.useState<NewRateCard>(emptyRateCard);
  const [isClient, setIsClient] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);

  React.useEffect(() => {
    setIsClient(true);
    // Set initial date only on client side
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, '0');
    const day = String(today.getUTCDate()).padStart(2, '0');
    setNewRateCard((prev: NewRateCard) => ({
      ...prev,
      effectiveDate: `${year}-${month}-${day}`
    }));
  }, []);

  const { validate, getFieldError, clearErrors } = useFormValidation(rateCardSchema);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(newRateCard)) return;

    const rateCard: RateCardWithDate = {
      name: newRateCard.name,
      description: newRateCard.description,
      levelRates: newRateCard.levelRates,
      effectiveDate: new Date(newRateCard.effectiveDate),
    };

    if (selectedRateCard) {
      updateRateCard(selectedRateCard.id, rateCard);
    } else {
      addRateCard(rateCard);
    }
    
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRateCard(null);
    setNewRateCard(emptyRateCard);
    clearErrors();
  };

  const handleEdit = (rateCard: RateCard) => {
    setSelectedRateCard(rateCard);
    setNewRateCard({
      name: rateCard.name,
      description: rateCard.description,
      effectiveDate: rateCard.effectiveDate.toISOString().split('T')[0],
      levelRates: rateCard.levelRates,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (rateCard: RateCard) => {
    setSelectedRateCard(rateCard);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRateCard) {
      deleteRateCard(selectedRateCard.id);
      setDeleteConfirmOpen(false);
      setSelectedRateCard(null);
    }
  };

  const handleLevelRateChange = (levelId: string, monthlyRate: number) => {
    const existingRateIndex = newRateCard.levelRates.findIndex(
      (rate: LevelRate) => rate.levelId === levelId
    );

    if (monthlyRate === 0 && existingRateIndex !== -1) {
      // Remove the level rate if the rate is set to 0
      setNewRateCard({
        ...newRateCard,
        levelRates: newRateCard.levelRates.filter((_: LevelRate, index: number) => index !== existingRateIndex),
      });
    } else if (existingRateIndex !== -1) {
      // Update existing level rate
      const updatedRates = [...newRateCard.levelRates];
      updatedRates[existingRateIndex] = { levelId, monthlyRate };
      setNewRateCard({
        ...newRateCard,
        levelRates: updatedRates,
      });
    } else if (monthlyRate > 0) {
      // Add new level rate
      setNewRateCard({
        ...newRateCard,
        levelRates: [...newRateCard.levelRates, { levelId, monthlyRate }],
      });
    }
  };

  const getLevelRate = (levelId: string) => {
    return newRateCard.levelRates.find((rate: LevelRate) => rate.levelId === levelId)?.monthlyRate || 0;
  };

  const getLevel = (levelId: string): Level | undefined => levels.find((l: Level) => l.id === levelId);

  const handleSort = (key: keyof RateCard) => {
    setSortConfig((currentConfig: SortConfig) => {
      if (currentConfig?.key === key) {
        return {
          key,
          direction: currentConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedRateCards = React.useMemo(() => {
    if (!sortConfig) return rateCards;

    return [...rateCards].sort((a, b) => {
      const key = sortConfig.key;
      if (key === 'effectiveDate') {
        return sortConfig.direction === 'asc' 
          ? a.effectiveDate.getTime() - b.effectiveDate.getTime()
          : b.effectiveDate.getTime() - a.effectiveDate.getTime();
      }
      
      const aValue = String(a[key]);
      const bValue = String(b[key]);
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [rateCards, sortConfig]);

  const SortableHeader = ({ column, label }: { column: keyof RateCard; label: string }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rate Cards Management</h1>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          Add Rate Card
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRateCard ? 'Edit Rate Card' : 'Add Rate Card'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Name"
                value={newRateCard.name}
                onChange={(e) => setNewRateCard({ ...newRateCard, name: e.target.value })}
                error={getFieldError('name')}
                required
              />
              <Input
                label="Description"
                value={newRateCard.description}
                onChange={(e) => setNewRateCard({ ...newRateCard, description: e.target.value })}
                error={getFieldError('description')}
                required
              />
              <Input
                label="Effective Date"
                type="date"
                value={newRateCard.effectiveDate}
                onChange={(e) => setNewRateCard({ ...newRateCard, effectiveDate: e.target.value })}
                error={getFieldError('effectiveDate')}
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Level Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {levels.map((level) => (
                  <div key={level.id} className="flex flex-col space-y-2">
                    <Input
                      label={level.name}
                      type="number"
                      value={getLevelRate(level.id)}
                      onChange={(e) =>
                        handleLevelRateChange(level.id, parseFloat(e.target.value))
                      }
                      min="0"
                      step="0.01"
                      placeholder="Monthly Rate (USD)"
                    />
                  </div>
                ))}
              </div>
              {getFieldError('levelRates') && (
                <p className="text-sm text-red-600">{getFieldError('levelRates')}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {selectedRateCard ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rate Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rate card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader column="name" label="Name" />
              <SortableHeader column="description" label="Description" />
              <SortableHeader column="effectiveDate" label="Effective Date" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level Rates
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isClient && sortedRateCards.map((rateCard: RateCard) => (
              <tr key={rateCard.id}>
                <td className="px-6 py-4 whitespace-nowrap">{rateCard.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{rateCard.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(rateCard.effectiveDate)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    {rateCard.levelRates.map((rate) => {
                      const level = getLevel(rate.levelId);
                      return level ? (
                        <div key={rate.levelId} className="flex justify-between">
                          <span className="font-medium">{level.name}:</span>
                          <span>{formatCurrency(rate.monthlyRate)}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => handleEdit(rateCard)}
                    variant="secondary"
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(rateCard)}
                    variant="danger"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 