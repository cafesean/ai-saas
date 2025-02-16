export enum Role {
  Admin = 1,
  Member = 2
}

export enum Policy {
  Role = "Role",
  Level = "Level",
  RateCard = "RateCard"
}

export enum PolicyAccess {
  Create = "can_create",
  Read = "can_read",
  Update = "can_update",
  Delete = "can_delete"
}
