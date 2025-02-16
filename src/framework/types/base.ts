/**
 * Entity metadata for database records
 */
export interface EntityMetadata {
  id: number;
  uuid: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Utility type to add metadata to a type
 */
export type WithMetadata<T> = T & {
  metadata: EntityMetadata;
};

/**
 * Type for creating a new entity (without metadata)
 */
export type NewEntity<T extends WithMetadata<any>> = Omit<T, 'metadata'>;

/**
 * Type for updating an entity (all fields optional except metadata.id)
 */
export type UpdateEntity<T extends WithMetadata<any>> = Partial<Omit<T, 'metadata'>> & {
  metadata: Pick<EntityMetadata, 'id' | 'updated_at'>;
};

/**
 * ID conversion utilities
 */
export const toUuid = (id: number): string => id.toString();
export const toId = (uuid: string): number => Number(uuid);

/**
 * Type guard to check if a value is not null or undefined
 */
export const isDefined = <T>(value: T | null | undefined): value is T => 
  value !== null && value !== undefined;

/**
 * Money-related utilities
 */
export const formatMoney = (amount: string): string => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

export const parseMoney = (amount: string): string => 
  amount.replace(/[^0-9.-]+/g, '');

/**
 * Type conversion utilities
 */
export type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

export type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnake<U>}`
  : S;

export type SnakeToCamelObject<T> = {
  [K in keyof T as SnakeToCamel<string & K>]: T[K] extends object
    ? SnakeToCamelObject<T[K]>
    : T[K];
};

export type CamelToSnakeObject<T> = {
  [K in keyof T as CamelToSnake<string & K>]: T[K] extends object
    ? CamelToSnakeObject<T[K]>
    : T[K];
}; 