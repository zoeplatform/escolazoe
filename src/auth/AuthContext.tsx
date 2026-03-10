import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../services/firebase/firebase";
import type { UserProfile } from "./authTypes";
import { createUserProfile, getUserProfile } from "../services/firebase/profileService";
import { clearProfile, getProfile, setProfile } from "./authStorage";
import { initProgressSync, clearSyncedUid } from "../services/progress/progressService";
import { clearLibrarySyncedUid, initLibraryProgressSync } from "../services/library/libraryProgressService";
import { listCourses } from "../curriculum";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type AuthState = {
  booting: boolean;
  profile: UserProfile | null;
  isAuthed: boolean;
  authError: string | null;
  accountType: "individual" | "institution" | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    displayName: string;
    email: string;
    password: string;
    birthDate?: string;
    city?: string;
    state?: string;
    accountType?: "individual" | "institution";
  }) => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function now() {
  return Date.now();
}

/**
 * Busca perfil no Firestore com timeout de 5s.
 */
async function fetchProfileSafe(uid: string): Promise<UserProfile | null> {
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    return await Promise.race([getUserProfile(uid), timeout]);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: any }) {
  const [booting, setBooting] = useState(true);
  const [profile, setProfileState] = useState<UserProfile | null>(null); // NÃO lê localStorage aqui
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError(null);

      // ── Usuário deslogado ──────────────────────────────────────────────────
      if (!firebaseUser) {
        setProfileState(null);
        clearProfile();
        clearSyncedUid();
        clearLibrarySyncedUid();
        setBooting(false);
        return;
      }

      const courseIds = listCourses().map((c) => c.id);

      // ── Usuário logado: FIRESTORE é a fonte da verdade ─────────────────────
      // Exibe cache local imediatamente para não travar a UI
      const cached = getProfile();
      if (cached && cached.uid === firebaseUser.uid) {
        setProfileState(cached);
      }

      // Busca no Firestore (fonte da verdade)
      const remote = await fetchProfileSafe(firebaseUser.uid);

      if (remote) {
        // Perfil existe no Firestore — tudo certo
        setProfile(remote);
        setProfileState(remote);
        try {
          await Promise.all([
            initProgressSync(firebaseUser.uid, courseIds),
            initLibraryProgressSync(firebaseUser.uid),
          ]);
        } catch (err) {
          console.warn("[auth] initProgressSync/initLibraryProgressSync falhou:", err);
        }
        setBooting(false);
        return;
      }

      // Perfil não existe no Firestore ainda.
      // Pode ser: usuário recém-registrado (perfil salvo localmente mas Firestore
      // ainda não confirmou) ou conta deletada manualmente no console.
      const localProfile = getProfile();
      if (localProfile && localProfile.uid === firebaseUser.uid) {
        // Temos perfil local — usuário acabou de se registrar
        // Tenta salvar no Firestore novamente
        setProfileState(localProfile);
        createUserProfile(localProfile).catch((err) => {
          console.warn("[auth] Re-tentativa de salvar perfil falhou:", err);
        });
        try {
          await Promise.all([
            initProgressSync(firebaseUser.uid, courseIds),
            initLibraryProgressSync(firebaseUser.uid),
          ]);
        } catch {}
        setBooting(false);
        return;
      }

      // Sem perfil local e sem perfil no Firestore → conta órfã, desloga
      console.warn("[auth] Sessão sem perfil — deslogando...");
      clearProfile();
      clearSyncedUid();
      setProfileState(null);
      await signOut(auth).catch(() => {});
      setBooting(false);
    });

    return () => unsub();
  }, []);

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  async function login(email: string, password: string) {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged cuida do resto (busca perfil no Firestore)
    } catch (e: any) {
      const msg = friendlyAuthError(e?.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  }

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  async function logout() {
    try {
      clearSyncedUid();
      clearLibrarySyncedUid();
      clearProfile();
      await signOut(auth);
    } catch {
      setAuthError("Erro ao sair. Tente novamente.");
    }
  }

  // ---------------------------------------------------------------------------
  // Registro
  // ---------------------------------------------------------------------------

  async function register(data: {
    displayName: string;
    email: string;
    password: string;
    birthDate?: string;
    city?: string;
    state?: string;
    accountType?: "individual" | "institution";
  }) {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);

      const t = now();
      const p: UserProfile = {
        uid: cred.user.uid,
        email: data.email,
        displayName: data.displayName,
        birthDate: data.birthDate,
        city: data.city,
        state: data.state,
        accountType: data.accountType ?? "individual",
        createdAt: t,
        updatedAt: t,
      };

      // Salva localmente imediatamente para a UI não travar
      setProfile(p);
      setProfileState(p);

      // Persiste no Firestore em background — não bloqueia o fluxo
      createUserProfile(p).catch((err) => {
        console.warn("[auth] Falha ao salvar perfil no Firestore:", err);
      });

    } catch (e: any) {
      const msg = friendlyAuthError(e?.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  }

  // ---------------------------------------------------------------------------
  // accountType derivado do perfil
  // ---------------------------------------------------------------------------

  const accountType = (profile?.accountType) ?? "individual";

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------

  const value = useMemo<AuthState>(
    () => ({
      booting,
      profile,
      isAuthed: !!profile,
      authError,
      accountType,
      login,
      logout,
      register,
    }),
    [booting, profile, authError]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

// ---------------------------------------------------------------------------
// Erros amigáveis do Firebase Auth
// ---------------------------------------------------------------------------

function friendlyAuthError(code?: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email ou senha incorretos.";
    case "auth/email-already-in-use":
      return "Este email já está cadastrado. Tente fazer login.";
    case "auth/weak-password":
      return "A senha deve ter pelo menos 6 caracteres.";
    case "auth/invalid-email":
      return "Email inválido.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    case "auth/network-request-failed":
      return "Sem conexão com a internet. Verifique sua rede.";
    case "auth/user-disabled":
      return "Esta conta foi desativada.";
    default:
      return "Ocorreu um erro. Tente novamente.";
  }
}
