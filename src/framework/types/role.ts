export type SessionRole = {
  id: number;
  name: string;
  title: string;
  policies: SessionPolicy[];
};

export type SessionPolicy = {
  id: number;
  name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
};

export enum SessionAuthenticatedType {
  authenticated = "authenticated",
  unauthenticated = "unauthenticated"
}
