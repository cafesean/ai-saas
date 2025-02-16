'use client';

import React from 'react';
import type { RateCardView, LevelView, LevelRateView } from '@/types';
import type { DbRateCard, DbLevel, DbLevelRate } from '@/db/types';
import type { Row } from '@tanstack/react-table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useFormValidation } from '@/hooks/useFormValidation';
import { rateCardSchema } from '@/schemas';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { ArrowUpDown } from 'lucide-react';
import { RateCardDetails } from '@/app/(admin)/rate-cards/components/RateCardDetail';
import { DataTable } from '@/components/ui/table/DataTable';
import { useTableColumns } from '@/hooks/useTableColumn';
import { api, useUtils } from '@/utils/trpc';
import type { AsyncStatus } from '@/types/asyncStatus';
import { dbToAppRateCard, dbToAppLevel } from '@/types';

interface LevelRate {
  id: string;
  level_id: number;
  monthly_rate: number;
  level: LevelView;
}

interface NewRateCard {
  name: string;
  description: string;
  effective_date: string;
  expire_date: string;
  level_rates: LevelRate[];
}

type RateCardWithDate = Omit<NewRateCard, 'effective_date' | 'expire_date'> & {
  effective_date: Date;
  expire_date: Date;
};

const emptyRateCard: NewRateCard = {
  name: '',
  description: '',
  effective_date: '',
  expire_date: '',
  level_rates: [],
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
  key: keyof RateCardView;
  direction: 'asc' | 'desc';
} | null;

export default function RateCardsPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [selectedRateCard, setSelectedRateCard] = React.useState<RateCardView | null>(null);
  const [viewingRateCard, setViewingRateCard] = React.useState<RateCardView | null>(null);
  const [newRateCard, setNewRateCard] = React.useState<NewRateCard>(emptyRateCard);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);

  // tRPC hooks
  const utils = useUtils();
  const { data: rateCards, isLoading: isLoadingRateCards } = api.rateCard.getAll.useQuery(undefined, {
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });
  const { data: levels, isLoading: isLoadingLevels } = api.level.getAll.useQuery(undefined, {
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });
  const createRateCard = api.rateCard.create.useMutation({
    onSuccess: () => {
      utils.rateCard.getAll.invalidate();
    },
  });
  const updateRateCard = api.rateCard.update.useMutation({
    onSuccess: () => {
      utils.rateCard.getAll.invalidate();
    },
  });
  const deleteRateCard = api.rateCard.delete.useMutation({
    onSuccess: () => {
      utils.rateCard.getAll.invalidate();
    },
  });

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
        effective_date: today,
        expire_date: expireDate,
      }));
    }
  }, [isClient]);

  const { validate, getFieldError, clearErrors } = useFormValidation(rateCardSchema._def.schema);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      name: newRateCard.name,
      description: newRateCard.description,
      effective_date: new Date(newRateCard.effective_date + 'T00:00:00Z'),
      expire_date: newRateCard.expire_date ? new Date(newRateCard.expire_date + 'T00:00:00Z') : null,
      level_rates: newRateCard.level_rates.map((rate: LevelRate) => ({
        level_id: rate.level_id,
        monthly_rate: rate.monthly_rate,
      })),
    };
    // Check for duplicate names
    if (rateCards?.some(card => 
      card.name.toLowerCase() === newRateCard.name.toLowerCase() && 
      (!selectedRateCard || card.id !== selectedRateCard.id)
    )) {
      validate({ ...formData, name: '' }); // Trigger validation error
      return;
    }
    if (!validate(formData)) return;
    setIsConfirming(true);
  };

  const handleConfirm = async () => {
    try {
      const rateCardData = {
        name: newRateCard.name,
        description: newRateCard.description,
        effective_date: new Date(newRateCard.effective_date + 'T00:00:00Z'),
        expire_date: newRateCard.expire_date ? new Date(newRateCard.expire_date + 'T00:00:00Z') : null,
        level_rates: newRateCard.level_rates.map((rate: LevelRate) => ({
          level_id: rate.level_id,
          monthly_rate: rate.monthly_rate,
        })),
      };

      if (selectedRateCard) {
        await updateRateCard.mutateAsync({
          id: selectedRateCard.id,
          data: rateCardData,
        });
      } else {
        await createRateCard.mutateAsync(rateCardData);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving rate card:', error);
    }
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
      effective_date: today,
      expire_date: expireDate,
    });
    setIsConfirming(false);
    clearErrors();
  };

  const handleEdit = (rateCard: RateCardView) => {
    setSelectedRateCard(rateCard);
    setNewRateCard({
      name: rateCard.name,
      description: rateCard.description ?? '',
      effective_date: rateCard.effectiveDate.toISOString().split('T')[0],
      expire_date: rateCard.expireDate?.toISOString().split('T')[0] ?? '',
      level_rates: rateCard.levelRates.map(rate => ({
        id: rate.id.toString(),
        level_id: rate.level.id,
        monthly_rate: rate.monthlyRate,
        level: rate.level,
      })),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (rateCard: RateCardView) => {
    setSelectedRateCard(rateCard);
    setDeleteConfirmOpen(true);
  };

  const handleViewDetail = (rateCard: RateCardView) => {
    setViewingRateCard(rateCard);
  };

  const confirmDelete = async () => {
    if (selectedRateCard) {
      try {
        await deleteRateCard.mutateAsync(selectedRateCard.id);
        setDeleteConfirmOpen(false);
        setSelectedRateCard(null);
      } catch (error) {
        console.error('Error deleting rate card:', error);
      }
    }
  };

  const handleLevelRateChange = (levelId: number, monthlyRate: number) => {
    const existingRateIndex = newRateCard.level_rates.findIndex(
      (rate: LevelRate) => rate.level_id === levelId
    );

    if (monthlyRate === 0 && existingRateIndex !== -1) {
      setNewRateCard({
        ...newRateCard,
        level_rates: newRateCard.level_rates.filter((_: LevelRate, index: number) => index !== existingRateIndex),
      });
    } else if (existingRateIndex !== -1) {
      const updatedRates = [...newRateCard.level_rates];
      updatedRates[existingRateIndex] = {
        ...updatedRates[existingRateIndex],
        monthly_rate: monthlyRate,
      };
      setNewRateCard({
        ...newRateCard,
        level_rates: updatedRates,
      });
    } else if (monthlyRate > 0 && levels) {
      const level = levels.find(l => l.id === levelId);
      if (!level) return;
      
      const appLevel = dbToAppLevel({ ...level, roles: [] });
      setNewRateCard({
        ...newRateCard,
        level_rates: [...newRateCard.level_rates, {
          id: `temp-${levelId}`,
          level_id: levelId,
          monthly_rate: monthlyRate,
          level: appLevel,
        }],
      });
    }
  };

  const getLevelRate = (levelId: number): number => {
    const rate = newRateCard.level_rates.find((rate: LevelRate) => rate.level_id === levelId);
    return rate ? rate.monthly_rate : 0;
  };

  const getLevel = (levelId: number): LevelView | undefined => {
    if (!levels) return undefined;
    const level = levels.find(l => l.id === levelId);
    return level ? dbToAppLevel({ ...level, roles: [] }) : undefined;
  };

  const handleSort = (key: keyof RateCardView) => {
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
    if (!sortConfig || !rateCards) return [];

    return [...rateCards].map(card => {
      const rateCardWithRefs: DbRateCard & {
        level_rates?: Array<DbLevelRate & { level: DbLevel; rate_card: DbRateCard }>;
      } = {
        ...card,
        level_rates: card.level_rates?.map(rate => ({
          ...rate,
          rate_card: card,
          level: {
            ...rate.level,
            roles: [],
          },
        })),
      };
      return dbToAppRateCard(rateCardWithRefs);
    }).sort((a, b) => {
      const key = sortConfig.key as keyof RateCardView;
      if (key === 'effectiveDate') {
        return sortConfig.direction === 'asc'
          ? a.effectiveDate.getTime() - b.effectiveDate.getTime()
          : b.effectiveDate.getTime() - a.effectiveDate.getTime();
      }

      const aValue = String(a[key] ?? '');
      const bValue = String(b[key] ?? '');

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [rateCards, sortConfig]);

  const columns = useTableColumns<RateCardView>({
    columns: [
      {
        key: 'name',
        header: 'Name',
        cell: ({ getValue }) => {
          const name = getValue() as string;
          const dbRateCard = rateCards?.find(rc => rc.name === name);
          if (!dbRateCard) return null;
          const rateCard = dbToAppRateCard({
            ...dbRateCard,
            level_rates: dbRateCard.level_rates?.map(rate => ({
              ...rate,
              rate_card: dbRateCard,
              level: {
                ...rate.level,
                roles: [],
              },
            })),
          });
          return (
            <button
              onClick={() => handleViewDetail(rateCard)}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {name}
            </button>
          );
        },
      },
      {
        key: 'effectiveDate',
        header: 'Effective Date',
        cell: ({ getValue }) => {
          const date = getValue() as Date;
          return <span className="text-xs text-gray-600">{formatDate(date)}</span>;
        },
      },
      {
        key: 'expireDate',
        header: 'Expire Date',
        cell: ({ getValue }) => {
          const date = getValue() as Date | null;
          return date ? (
            <span className="text-xs text-gray-600">{formatDate(date)}</span>
          ) : null;
        },
      },
      {
        key: 'id',
        header: 'Actions',
        cell: ({ getValue }) => {
          const id = getValue() as number;
          const dbRateCard = rateCards?.find(rc => rc.id === id);
          if (!dbRateCard) return null;
          const rateCard = dbToAppRateCard({
            ...dbRateCard,
            level_rates: dbRateCard.level_rates?.map(rate => ({
              ...rate,
              rate_card: dbRateCard,
              level: {
                ...rate.level,
                roles: [],
              },
            })),
          });
          return (
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => handleEdit(rateCard)}
                variant="secondary"
                className="modal-button"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(rateCard)}
                variant="danger"
                className="modal-button"
              >
                Delete
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
  });

  if (isLoadingRateCards || isLoadingLevels) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (rateCards && levels) {
    return (
      <div className="space-y-4 max-w-[100vw] px-4 md:px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Rate Cards</h1>
          {isClient && (
            <Button onClick={() => setIsModalOpen(true)} variant="primary">
              Add Rate Card
            </Button>
          )}
        </div>

        {isClient && (
          <>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="modal-content">
                <DialogHeader className="modal-header">
                  <DialogTitle className="modal-title">
                    {isConfirming
                      ? 'Confirm Rate Card Details'
                      : selectedRateCard
                        ? `Edit ${selectedRateCard.name}`
                        : 'Add New Rate Card'
                    }
                  </DialogTitle>
                </DialogHeader>
                {isConfirming ? (
                  <div className="modal-section">
                    <div>
                      <h2 className="modal-section-title">Name</h2>
                      <p className="modal-value">{newRateCard.name}</p>
                    </div>

                    <div>
                      <h2 className="modal-section-title">Description</h2>
                      <p className="modal-value">{newRateCard.description}</p>
                    </div>

                    <div>
                      <h2 className="modal-section-title">Effective Date</h2>
                      <p className="modal-value">{formatDate(new Date(newRateCard.effective_date))}</p>
                    </div>

                    <div>
                      <h2 className="modal-section-title">Expire Date</h2>
                      <p className="modal-value">{formatDate(new Date(newRateCard.expire_date))}</p>
                    </div>

                    <div>
                      <h2 className="modal-section-title">Level Rates</h2>
                      <div className="space-y-2">
                        {newRateCard.level_rates.map((rate: LevelRate) => {
                          const level = getLevel(rate.level_id);
                          if (!level) return null;
                          return (
                            <div key={rate.level_id} className="flex justify-between">
                              <span>{level.name}</span>
                              <span>{formatCurrency(rate.monthly_rate)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <DialogFooter className="modal-footer">
                      <Button
                        type="button"
                        variant="secondary"
                        className="modal-button"
                        onClick={() => setIsConfirming(false)}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        className="modal-button"
                        onClick={handleConfirm}
                      >
                        {selectedRateCard ? 'Update' : 'Create'} Rate Card
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 p-4">
                      <Input
                        {...{
                          id: "name",
                          type: "text",
                          label: "Name",
                          value: newRateCard.name,
                          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewRateCard({ ...newRateCard, name: e.target.value }),
                          error: getFieldError('name'),
                          required: true,
                          className: "text-sm"
                        }}
                      />
                      <Input
                        {...{
                          id: "description",
                          type: "text",
                          label: "Description",
                          value: newRateCard.description,
                          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewRateCard({ ...newRateCard, description: e.target.value }),
                          error: getFieldError('description'),
                          className: "text-sm"
                        }}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          {...{
                            id: "effective_date",
                            type: "date",
                            label: "Effective Date",
                            value: newRateCard.effective_date,
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewRateCard({ ...newRateCard, effective_date: e.target.value }),
                            error: getFieldError('effective_date'),
                            required: true,
                            className: "text-sm"
                          }}
                        />
                        <Input
                          {...{
                            id: "expire_date",
                            type: "date",
                            label: "Expire Date",
                            value: newRateCard.expire_date,
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewRateCard({ ...newRateCard, expire_date: e.target.value }),
                            error: getFieldError('expire_date'),
                            className: "text-sm"
                          }}
                        />
                      </div>

                      <div className="space-y-3">
                        <h2 className="text-sm font-medium text-gray-900">Level Rates</h2>
                        <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto bg-gray-50 p-3 rounded-lg">
                          {levels.map((dbLevel) => {
                            const level = dbToAppLevel({ ...dbLevel, roles: [] });
                            return (
                              <div key={level.id} className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-gray-100">
                                <span className="flex-1 text-sm font-medium text-gray-700">{level.name}</span>
                                <Input
                                  {...{
                                    id: `rate-${level.id}`,
                                    type: "number",
                                    min: "0",
                                    step: "0.01",
                                    value: getLevelRate(level.id),
                                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleLevelRateChange(level.id, Number(e.target.value)),
                                    className: "w-32 text-right text-sm"
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="modal-footer px-6 py-4 bg-gray-50">
                      <Button type="button" variant="secondary" className="modal-button" onClick={handleCloseModal}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" className="modal-button">
                        {selectedRateCard ? 'Next' : 'Continue'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
              <DialogContent className="modal-content">
                <DialogHeader className="modal-header">
                  <DialogTitle className="modal-title">Delete Rate Card</DialogTitle>
                </DialogHeader>
                <div className="modal-section">
                  <p className="modal-text">
                    Are you sure you want to delete this rate card? This action cannot be undone.
                  </p>
                </div>
                <DialogFooter className="modal-footer">
                  <Button
                    type="button"
                    variant="secondary"
                    className="modal-button"
                    onClick={() => setDeleteConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    className="modal-button"
                    onClick={confirmDelete}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <RateCardDetails
              rateCard={viewingRateCard}
              onOpenChange={(open) => setViewingRateCard(open ? viewingRateCard : null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              levels={levels.map(dbLevel => dbToAppLevel({ ...dbLevel, roles: [] }))}
              onSave={async (rateCardData: Omit<RateCardView, "id">) => {
                if (viewingRateCard) {
                  try {
                    await updateRateCard.mutateAsync({
                      id: viewingRateCard.id,
                      data: {
                        name: rateCardData.name,
                        description: rateCardData.description,
                        effective_date: rateCardData.effectiveDate,
                        expire_date: rateCardData.expireDate,
                        level_rates: rateCardData.levelRates.map((rate) => ({
                          level_id: rate.level.id,
                          monthly_rate: rate.monthlyRate
                        }))
                      }
                    });
                    setViewingRateCard(null);
                  } catch (error) {
                    console.error('Error updating rate card:', error);
                  }
                }
              }}
            />

            <DataTable
              data={rateCards?.map(card => dbToAppRateCard({
                ...card,
                level_rates: card.level_rates?.map(rate => ({
                  ...rate,
                  rate_card: card,
                  level: {
                    ...rate.level,
                    roles: [],
                  },
                })),
              })) ?? []}
              columns={columns}
              searchPlaceholder="Search rate cards..."
              searchableColumns={['name']}
              enableSearch={true}
              enableFilters={true}
              filename="rate-cards"
              className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200"
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="text-red-500">
      Error loading rate cards or levels
    </div>
  );
} 