'use client';

import React from 'react';
import type { RateCardView, LevelView } from '@/framework/types';
import type { Row } from '@tanstack/react-table';
import { Button } from '@/components/form/Button';
import { formatCurrency } from '@/framework/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import { RateCardDetails } from '@/app/(admin)/rate-cards/components/RateCardDetail';
import { DataTable } from '@/components/ui/table/DataTable';
import { useTableColumns } from '@/framework/hooks/useTableColumn';
import { api, useUtils } from '@/utils/trpc';
import { ManageRateCard } from './modals/ManageRateCard';
import { ConfirmSave } from './modals/ConfirmSave';
import { ConfirmDelete } from './modals/ConfirmDelete';
import { useRateCardState } from './hooks/useRateCardState';
import { dbToAppLevel, dbToAppRateCard } from '@/framework/types';

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

type SortConfig = {
  key: keyof RateCardView;
  direction: 'asc' | 'desc';
} | null;

export default function RateCardsPage() {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);
  const {
    isModalOpen,
    setIsModalOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    selectedRateCard,
    setSelectedRateCard,
    viewingRateCard,
    setViewingRateCard,
    newRateCard,
    setNewRateCard,
    isConfirming,
    setIsConfirming,
    handleRateCardChange,
    handleLevelRateChange,
    getLevelRate,
    resetForm,
  } = useRateCardState();

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
      return;
    }

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
    resetForm();
  };

  const handleEdit = (rateCard: RateCardView) => {
    setSelectedRateCard(rateCard);
    const newCard = {
      name: rateCard.name,
      description: rateCard.description ?? '',
      effective_date: rateCard.effective_date.toISOString().split('T')[0],
      expire_date: rateCard.expire_date ? rateCard.expire_date.toISOString().split('T')[0] : '',
      level_rates: rateCard.levelRates.map(rate => ({
        id: rate.id.toString(),
        level_id: rate.level.id,
        monthly_rate: rate.monthlyRate,
        level: rate.level,
      })),
    };
    setNewRateCard(newCard as NewRateCard);
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

  const handleSort = (key: keyof RateCardView) => {
    setSortConfig((current: SortConfig) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedRateCards = React.useMemo(() => {
    if (!rateCards || !sortConfig) return rateCards;

    return [...rateCards].map(card => {
      const rateCardWithRefs = {
        ...card,
        effective_date: new Date(card.effective_date),
        expire_date: card.expire_date ? new Date(card.expire_date) : null,
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
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortConfig.key === 'effective_date') {
        return sortConfig.direction === 'asc'
          ? a.effective_date.getTime() - b.effective_date.getTime()
          : b.effective_date.getTime() - a.effective_date.getTime();
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
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors w-full text-left"
            >
              {name}
            </button>
          );
        },
      },
      {
        key: 'effective_date',
        header: 'Effective Date',
        cell: ({ getValue }) => {
          const date = getValue() as Date;
          return (
            <span className="text-xs text-gray-600">
              {date.toLocaleDateString()}
            </span>
          );
        },
      },
      {
        key: 'expire_date',
        header: 'Expire Date',
        cell: ({ getValue }) => {
          const date = getValue() as Date | null;
          return (
            <span className="text-xs text-gray-600">
              {date ? date.toLocaleDateString() : 'Never'}
            </span>
          );
        },
      },
      {
        key: 'id',
        header: '',
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
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Rate Cards</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create Rate Card</Button>
      </div>

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

      <ManageRateCard
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        rateCard={newRateCard}
        onRateCardChange={handleRateCardChange}
        onLevelRateChange={(levelId: number, monthlyRate: number) => {
          const level = levels?.find(l => l.id === levelId);
          if (level) {
            handleLevelRateChange(levelId, monthlyRate, dbToAppLevel({ ...level, roles: [] }));
          }
        }}
        levels={levels?.map(level => dbToAppLevel({ ...level, roles: [] })) || []}
        isEdit={!!selectedRateCard}
        getLevelRate={getLevelRate}
      />

      <ConfirmSave
        open={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={handleConfirm}
        isLoading={createRateCard.isLoading || updateRateCard.isLoading}
        isEdit={!!selectedRateCard}
      />

      <ConfirmDelete
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        rateCard={selectedRateCard}
        isLoading={deleteRateCard.isLoading}
      />

      {viewingRateCard && (
        <RateCardDetails
          rateCard={viewingRateCard}
          levels={levels?.map(level => dbToAppLevel({ ...level, roles: [] })) || []}
          onOpenChange={(open: boolean) => setViewingRateCard(open ? viewingRateCard : null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSave={async (rateCardData: Omit<RateCardView, 'id'>) => {
            if (viewingRateCard) {
              try {
                await updateRateCard.mutateAsync({
                  id: viewingRateCard.id,
                  data: {
                    name: rateCardData.name,
                    description: rateCardData.description,
                    effective_date: rateCardData.effective_date,
                    expire_date: rateCardData.expire_date,
                    level_rates: rateCardData.levelRates.map((rate) => ({
                      level_id: rate.level.id,
                      monthly_rate: rate.monthlyRate,
                    })),
                  },
                });
                setViewingRateCard(null);
              } catch (error) {
                console.error('Error updating rate card:', error);
              }
            }
          }}
        />
      )}
    </div>
  );
} 