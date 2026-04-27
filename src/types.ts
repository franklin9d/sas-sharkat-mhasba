export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_OWNER = 'COMPANY_OWNER',
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  SALES = 'SALES',
  PURCHASES = 'PURCHASES',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
  HR = 'HR',
  AUDITOR = 'AUDITOR',
}

export enum SubscriptionPlan {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM',
}

export interface User {
  id: string;
  companyId?: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  ownerEmail: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  subscriptionEnd: string;
  logo?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  company?: Company | null;
  isAuthenticated: boolean;
}
