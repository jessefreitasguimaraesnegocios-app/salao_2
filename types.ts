
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface NotificationSettings {
  email_appointments: boolean;
  email_marketing: boolean;
  whatsapp_reminders: boolean;
  low_stock_alerts: boolean;
  weekly_reports: boolean;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  last_password_change: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  business_id?: string;
  avatar?: string;
  security?: SecuritySettings;
}

export enum BusinessType {
  BARBERSHOP = 'BARBERSHOP',
  SALON = 'SALON'
}

export interface OpeningHour {
  day: string;
  open: string;
  close: string;
  is_closed: boolean;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  owner_id: string;
  revenue_split: number;
  monthly_fee: number; // Nova mensalidade fixa
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  description: string;
  logo?: string;
  mp_connected: boolean;
  address?: string;
  opening_hours?: OpeningHour[];
  notifications?: NotificationSettings;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  is_active: boolean;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  is_active: boolean;
}

export interface TeamMember {
  id: string;
  business_id: string;
  name: string;
  role: string;
  specialties: string;
  avatar: string;
  status: 'ACTIVE' | 'INACTIVE';
  bio?: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  service_id: string;
  service_name: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  price: number;
}

export interface Transaction {
  id: string;
  business_id: string;
  amount: number;
  admin_fee: number;
  partner_net: number;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  payment_method: 'pix' | 'credit_card';
  created_at: string;
  customer_name: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
