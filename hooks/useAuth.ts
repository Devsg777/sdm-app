// This file is now a re-export of the AuthContext
// We're keeping it for backward compatibility with existing code
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export const useAuth = useAuthContext;