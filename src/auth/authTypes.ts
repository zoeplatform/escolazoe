export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;

  accountType?: "individual" | "institution";

  // Dados opcionais do membro
  birthDate?: string; // YYYY-MM-DD
  city?: string;
  state?: string;

  createdAt: number;
  updatedAt: number;
};
