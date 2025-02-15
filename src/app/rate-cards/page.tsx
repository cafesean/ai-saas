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
import { ArrowUpDown } from 'lucide-react';
import { RateCardDetails } from '@/components/rate-card-details';

interface NewRateCard {
  name: string;
  description: string;
  effectiveDate: string;
  expireDate: string;
  levelRates: LevelRate[];
}

type RateCardWithDate = Omit<NewRateCard, 'effectiveDate' | 'expireDate'> & {
  effectiveDate: Date;
  expireDate: Date;
};

const emptyRateCard: NewRateCard = {
  name: '',
  description: '',
  effectiveDate: '',
  expireDate: '',
  levelRates: [],
};

const formatDate = (date: Date) => {
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  
  return utcDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
  });
};

type SortConfig = {
  key: keyof RateCard;
  direction: 'asc' | 'desc';
} | null;

export default function RateCardsPage() {
  const { rateCards, levels, addRateCard, updateRateCard, deleteRateCard } = useStore();
  const [isClient, setIsClient] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [selectedRateCard, setSelectedRateCard] = React.useState<RateCard | null>(null);
  const [viewingRateCard, setViewingRateCard] = React.useState<RateCard | null>(null);
  const [newRateCard, setNewRateCard] = React.useState<NewRateCard>(emptyRateCard);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);

  // Move initial date setup to a function
  const getInitialDate = () => {
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, '0');
    const day = String(today.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDefaultRateCardName = () => {
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month} Rates`;
  };

  React.useEffect(() => {
    if (!isClient) {
      setIsClient(true);
      const today = getInitialDate();
      // Set default expire date to one year from today
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const expireDate = nextYear.toISOString().split('T')[0];
      
      setNewRateCard((prev: NewRateCard) => ({
        ...prev,
        name: getDefaultRateCardName(),
        effectiveDate: today,
        expireDate: expireDate,
      }));
    }
  }, [isClient]);

  const { validate, getFieldError, clearErrors } = useFormValidation(rateCardSchema);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(newRateCard)) return;
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    const rateCard: RateCardWithDate = {
      name: newRateCard.name,
      description: newRateCard.description,
      levelRates: newRateCard.levelRates,
      effectiveDate: new Date(newRateCard.effectiveDate),
      expireDate: new Date(newRateCard.expireDate),
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
    const today = getInitialDate();
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const expireDate = nextYear.toISOString().split('T')[0];
    
    setNewRateCard({
      ...emptyRateCard,
      name: getDefaultRateCardName(),
      effectiveDate: today,
      expireDate: expireDate,
    });
    setIsConfirming(false);
    clearErrors();
  };

  const handleEdit = (rateCard: RateCard) => {
    setSelectedRateCard(rateCard);
    setNewRateCard({
      name: rateCard.name,
      description: rateCard.description,
      effectiveDate: rateCard.effectiveDate.toISOString().split('T')[0],
      expireDate: rateCard.expireDate.toISOString().split('T')[0],
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
      
      const aValue = String(a[key as keyof RateCard]);
      const bValue = String(b[key as keyof RateCard]);
      
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
      scope="col"
      className="px-4 py-2 text-left text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown 
          className={`h-3 w-3 ${
            sortConfig?.key === column 
              ? 'text-primary' 
              : 'text-gray-400'
          } ${
            sortConfig?.key === column && sortConfig.direction === 'desc'
              ? 'rotate-180'
              : ''
          }`}
        />
      </div>
    </th>
  );

  const handleViewRateCard = (rateCard: RateCard) => {
    setViewingRateCard(rateCard);
  };

  const handleSaveRateCard = (rateCardData: Omit<RateCard, 'id'>) => {
    if (viewingRateCard) {
      updateRateCard(viewingRateCard.id, rateCardData);
      setViewingRateCard(null);
    }
  };

  return (
    <div className="space-y-4 max-w-[100vw] px-4 md:px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Rate Cards Management</h1>
        {isClient && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Add Rate Card
          </Button>
        )}
      </div>

      {isClient ? (
        <>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="p-8">
              <DialogHeader>
                <DialogTitle className="mb-8">
                  {isConfirming 
                    ? 'Confirm Rate Card Details' 
                    : selectedRateCard 
                      ? `Edit ${selectedRateCard.name}`
                      : 'Add New Rate Card'
                  }
                </DialogTitle>
              </DialogHeader>
              {isConfirming ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{newRateCard.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Description</h3>
                    <p className="mt-1 text-sm text-gray-900">{newRateCard.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Effective Date</h3>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(new Date(newRateCard.effectiveDate))}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Expire Date</h3>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(new Date(newRateCard.expireDate))}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Level Rates (USD)</h3>
                    <div className="mt-2 space-y-2">
                      {levels.map((level) => {
                        const rate = newRateCard.levelRates.find((r: LevelRate) => r.levelId === level.id);
                        if (!rate) return null;
                        return (
                          <div key={level.id} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-900">{level.name}</span>
                            <span className="text-gray-600">{formatCurrency(rate.monthlyRate)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsConfirming(false)}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleConfirm}
                    >
                      {selectedRateCard ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
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
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Effective Date"
                        type="date"
                        value={newRateCard.effectiveDate}
                        onChange={(e) => setNewRateCard({ ...newRateCard, effectiveDate: e.target.value })}
                        error={getFieldError('effectiveDate')}
                        required
                      />
                      <Input
                        label="Expire Date"
                        type="date"
                        value={newRateCard.expireDate}
                        onChange={(e) => setNewRateCard({ ...newRateCard, expireDate: e.target.value })}
                        error={getFieldError('expireDate')}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Level Rates (USD)</h3>
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
                      {selectedRateCard ? 'Next' : 'Continue'}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Rate Card</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this rate card? This action cannot be undone.
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <RateCardDetails
            rateCard={viewingRateCard}
            levels={levels}
            onOpenChange={(open) => setViewingRateCard(open ? viewingRateCard : null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSave={handleSaveRateCard}
          />

          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader column="name" label="Name" />
                    <SortableHeader column="description" label="Description" />
                    <SortableHeader column="effectiveDate" label="Effective Date" />
                    <th scope="col" className="px-4 py-2 text-right text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRateCards.map((rateCard: RateCard) => (
                    <tr key={rateCard.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        <button 
                          onClick={() => handleViewRateCard(rateCard)}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {rateCard.name}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-gray-600 line-clamp-2">{rateCard.description}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600">{formatDate(rateCard.effectiveDate)}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => handleEdit(rateCard)}
                            variant="secondary"
                            className="h-7 px-2 text-xs font-bold"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(rateCard)}
                            variant="danger"
                            className="h-7 px-2 text-xs font-bold"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 