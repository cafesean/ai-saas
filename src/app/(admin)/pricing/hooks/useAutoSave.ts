import { useEffect, useRef } from "react";
import { api } from "@/utils/trpc";
import { usePricingStore } from "../store/usePricingStore";
import { toast } from "react-toastify";
import type { pricing_roles } from "@/db/schema";

type PricingRole = {
	id: number;
	role_id: number;
	level_id: number;
	quantity: number;
	override_price: string | null;
	discount_rate: string | null;
};

export const useAutoSave = () => {
	const currentPricing = usePricingStore((state) => state.currentPricing);
	const isDirty = usePricingStore((state) => state.isDirty);
	const reset = usePricingStore((state) => state.reset);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const { mutateAsync: updatePricing } = api.pricing.update.useMutation({
		onSuccess: () => {
			toast.success("Your changes have been saved successfully.");
		},
		onError: (error) => {
			toast.error(`Error saving changes: ${error.message}`);
		},
	});

	const { mutateAsync: updatePricingRole } = api.pricing.updateRole.useMutation({
		onError: (error) => {
			toast.error(`Error saving changes: ${error.message}`);
		},
	});

	useEffect(() => {
		if (!currentPricing || !isDirty) return;

		// Clear existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Set new timeout
		timeoutRef.current = setTimeout(async () => {
			try {
				// Update basic info and overall discounts
				await updatePricing({
					code: currentPricing.code,
					data: {
						description: currentPricing.description,
						customer_id: currentPricing.customer_id,
						overall_discounts: currentPricing.overall_discounts as { rate: number }[] | undefined,
					},
				});

				// Update pricing roles
				await Promise.all(
					currentPricing.pricing_roles.map((role) =>
						updatePricingRole({
							id: role.id,
							data: {
								role_id: role.role_id || 0,
								level_id: role.level_id || 0,
								quantity: role.quantity,
								override_price: role.override_price ? Number(role.override_price) : undefined,
								discount_rate: role.discount_rate ? Number(role.discount_rate) : undefined,
							},
						})
					)
				);

				// Reset dirty state
				reset();
			} catch (error) {
				console.error("Error saving changes:", error);
			}
		}, 1000);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [currentPricing, isDirty, updatePricing, updatePricingRole, reset]);
};
