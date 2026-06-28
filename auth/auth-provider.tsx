// auth/auth-provider.tsx

'use client';

import { createContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/supabase/client';
import type { DbProfile as Profile } from '@/auth/profile';
import { ProfileService } from '@/auth/profile';

export interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    session: null,
    loading: true,
});

interface AuthProviderProps {
    children: React.ReactNode;
    serverSession: {
        user: User | null;
        profile: Profile | null;
    };
}

export const AuthProvider = ({ children, serverSession }: AuthProviderProps) => {
    const [sessionState, setSessionState] = useState<Omit<AuthContextType, 'loading'>>({
        ...serverSession,
        session: null,
    });
    const [loading, setLoading] = useState(!serverSession.user);

    useEffect(() => {
        let isMounted = true;

        const syncAuthState = async (session: Session | null) => {
            const user = session?.user ?? null;
            let profile: Profile | null = null;

            try {
                if (user) {
                    profile = await ProfileService.getProfile(user.id);
                }
            } catch (error) {
                console.error('Failed to sync auth profile:', error);
            } finally {
                if (isMounted) {
                    setSessionState({ user, profile, session });
                    setLoading(false);
                }
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            void syncAuthState(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            void syncAuthState(session);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        ...sessionState,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
