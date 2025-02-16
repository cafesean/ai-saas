import { JsonObject } from "@prisma/client/runtime/library";
import { signIn } from "next-auth/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type OrgUser = {
	org_id: number;
	user_id: number;
	role: string;
};

type AuthState = {
	id: number;
	authenticated: boolean;
	sessionData: any | undefined;
	walletAddress: string;
	email: string;
	socials: string[];
	orgUser: OrgUser[];
	roles: number[] | null;
	status: number;

	loginWithEmail: (email: string, password: string) => Promise<JsonObject>;
	loginWithProvider: (provider: string) => Promise<JsonObject>;
	setSessionData: (sessionData: any) => void;
	setUser: (user: any) => Promise<void>;
	setWalletAddress: (walletAddress: string) => void;
	setIsConnected: (isConnected: boolean) => void;
	logout: () => JsonObject;
	bind: (platform: string) => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			id: null,
			authenticated: false,
			session: undefined,
			walletAddress: "",
			email: "",
			socials: [],
			orgUser: [],
			roles: null,

			loginWithEmail: async (email: string, password: string) => {
				const signResponse = await signIn("credentials", {
					email: email,
					password: password,
					redirect: false,
				});

				if (signResponse && signResponse.status !== 200) {
					return signResponse.status;
				}
				console.log("In authstore: login");
				console.log("signResponse: ", signResponse);
				set(() => ({ authenticated: true }));
				set(() => ({ email: email }));

				return { status: 200 };
			},

			loginWithProvider: async (provider: string) => {
				const signResponse = await signIn(provider);

				if (signResponse && signResponse.status !== 200) {
					return signResponse.error;
				}
				set(() => ({ authenticated: true }));

				console.log("loginWithProvider - state: ", get());
				return { status: 200 };
			},

			logout: () => {
				console.log("In authstore: logout");

				set({
					id: null,
					authenticated: false,
					sessionData: null,
					walletAddress: "",
					email: "",
					socials: [],
					isConnected: false,
					orgUser: [],
					roles: null,
				});

				console.log("After authstore: logout");
				console.log("authStore values", get());
				// signOut();
				return { authenticated: false, sessionData: null };
			},

			setSessionData: (sessionData: any) => {
				console.log("In authstore: setSessionData");
				set(() => ({ sessionData: sessionData }));
			},

			setIsConnected: (isConnected: boolean) => {
				set(() => ({ authenticated: isConnected }));
			},

			setUser: async (user: any) => {
				if (user) {
					set({
						id: user.id,
						orgUser: user.orgUser,
						roles: user.roles,
						email: user.email,
					});

					console.log("after setUser state: ", get());
				}
			},
		}),
		{
			name: "auth-storage",
		}
	) as any
);
