"use client";

import { useUserSession } from '../hooks/useUserSession';

export default function UserSessionProvider({ children }: { children: React.ReactNode }) {
  // This component will handle user session changes
  useUserSession();
  
  return <>{children}</>;
}