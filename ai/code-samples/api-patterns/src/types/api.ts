import { type RouterOutputs } from "../utils/trpc"

export type UserOutput = RouterOutputs["user"]["list"][0]
export type UsersOutput = RouterOutputs["user"]["list"] 