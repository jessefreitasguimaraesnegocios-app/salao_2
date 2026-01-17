
import { UserRole, UserProfile, Business, BusinessType, Product, Service, Transaction, Appointment, TeamMember, OpeningHour } from '../types';

const STORAGE_KEY = 'belezahub_data';

interface DataStore {
  users: UserProfile[];
  businesses: Business[];
  products: Product[];
  services: Service[];
  transactions: Transaction[];
  appointments: Appointment[];
  teamMembers: TeamMember[];
}

const defaultHours: OpeningHour[] = [
  { day: 'Segunda-feira', open: '09:00', close: '18:00', is_closed: true },
  { day: 'Terça-feira', open: '09:00', close: '19:00', is_closed: false },
  { day: 'Quarta-feira', open: '09:00', close: '19:00', is_closed: false },
  { day: 'Quinta-feira', open: '09:00', close: '19:00', is_closed: false },
  { day: 'Sexta-feira', open: '09:00', close: '20:00', is_closed: false },
  { day: 'Sábado', open: '08:00', close: '20:00', is_closed: false },
  { day: 'Domingo', open: '09:00', close: '13:00', is_closed: true },
];

const initialData: DataStore = {
  users: [
    { id: '1', email: 'admin@belezahub.com', name: 'Super Admin', role: UserRole.SUPER_ADMIN },
    { id: '2', email: 'joao@barbearia.com', name: 'João Proprietário', role: UserRole.BUSINESS_OWNER, business_id: 'b1' },
    { id: '3', email: 'cliente@exemplo.com', name: 'Maria Cliente', role: UserRole.CUSTOMER },
  ],
  businesses: [
    { 
      id: 'b1', 
      name: 'Barbearia Vintage', 
      type: BusinessType.BARBERSHOP, 
      owner_id: '2', 
      revenue_split: 10, 
      monthly_fee: 149.90,
      status: 'ACTIVE', 
      description: 'A melhor barbearia clássica da região com atendimento premium e café cortesia.',
      mp_connected: true,
      address: 'Rua das Flores, 123, Jardim Botânico',
      opening_hours: defaultHours
    },
    { 
      id: 'b2', 
      name: 'Studio Glamour', 
      type: BusinessType.SALON, 
      owner_id: '4', 
      revenue_split: 12, 
      monthly_fee: 199.90,
      status: 'ACTIVE', 
      description: 'Especialistas em loiras, tratamentos capilares e unhas de gel.',
      mp_connected: false,
      address: 'Av. Paulista, 1000, 10º andar',
      opening_hours: defaultHours
    }
  ],
  products: [
    { id: 'p1', business_id: 'b1', name: 'Pomada Modeladora', price: 45.90, stock: 20, image: 'https://picsum.photos/seed/pomada/200/200', category: 'Cabelo', is_active: true },
    { id: 'p2', business_id: 'b1', name: 'Óleo para Barba', price: 35.00, stock: 15, image: 'https://picsum.photos/seed/oil/200/200', category: 'Barba', is_active: true },
  ],
  services: [
    { id: 's1', business_id: 'b1', name: 'Corte Degradê', price: 50.00, duration: 45, is_active: true },
    { id: 's2', business_id: 'b1', name: 'Barba Terapia', price: 40.00, duration: 30, is_active: true },
  ],
  teamMembers: [
    { id: 'm1', business_id: 'b1', name: 'Carlos "Barba" Silva', role: 'Barbeiro Master', specialties: 'Degradê, Navalha', avatar: 'https://i.pravatar.cc/150?u=m1', status: 'ACTIVE', bio: 'Especialista em cortes clássicos com mais de 10 anos de experiência.' },
    { id: 'm2', business_id: 'b1', name: 'Ana Oliveira', role: 'Esteticista', specialties: 'Limpeza de Pele, Massagem', avatar: 'https://i.pravatar.cc/150?u=m2', status: 'ACTIVE', bio: 'Transformando sorrisos através do cuidado com a pele.' }
  ],
  appointments: [],
  transactions: [
    { id: 't1', business_id: 'b1', amount: 95.90, admin_fee: 9.59, partner_net: 86.31, status: 'PAID', payment_method: 'pix', created_at: new Date(Date.now() - 86400000).toISOString(), customer_name: 'Carlos Oliveira' },
  ]
};

class MockApi {
  private data: DataStore;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    this.data = saved ? JSON.parse(saved) : initialData;
    this.data.businesses = this.data.businesses.map(b => ({
      ...b,
      opening_hours: b.opening_hours || defaultHours,
      monthly_fee: b.monthly_fee || 0
    }));
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const userId = localStorage.getItem('logged_user_id');
    return this.data.users.find(u => u.id === userId) || null;
  }

  async login(email: string, role: UserRole): Promise<UserProfile | null> {
    const user = this.data.users.find(u => u.email === email && u.role === role);
    if (user) {
      localStorage.setItem('logged_user_id', user.id);
      return user;
    }
    return null;
  }

  logout() {
    localStorage.removeItem('logged_user_id');
  }

  async getUsers(): Promise<UserProfile[]> {
    return this.data.users;
  }

  async saveUser(user: Omit<UserProfile, 'id'> & { id?: string }): Promise<UserProfile> {
    if (user.id) {
      this.data.users = this.data.users.map(u => u.id === user.id ? { ...u, ...user } as UserProfile : u);
    } else {
      const newUser = { ...user, id: 'user-' + Math.random().toString(36).substr(2, 5) } as UserProfile;
      this.data.users.push(newUser);
    }
    this.save();
    return (user.id ? user : this.data.users[this.data.users.length - 1]) as UserProfile;
  }

  async deleteUser(id: string): Promise<void> {
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.save();
  }

  async getBusinesses(): Promise<Business[]> {
    return this.data.businesses;
  }

  async getBusinessById(id: string): Promise<Business | null> {
    return this.data.businesses.find(b => b.id === id) || null;
  }

  async updateBusiness(id: string, updates: Partial<Business>): Promise<Business> {
    this.data.businesses = this.data.businesses.map(b => b.id === id ? { ...b, ...updates } : b);
    this.save();
    return this.getBusinessById(id) as Promise<Business>;
  }

  async deleteBusiness(id: string): Promise<void> {
    this.data.businesses = this.data.businesses.filter(b => b.id !== id);
    this.data.products = this.data.products.filter(p => p.business_id !== id);
    this.data.services = this.data.services.filter(s => s.business_id !== id);
    this.data.teamMembers = this.data.teamMembers.filter(m => m.business_id !== id);
    this.save();
  }

  async getProducts(businessId: string): Promise<Product[]> {
    return this.data.products.filter(p => p.business_id === businessId);
  }

  async saveProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    if (product.id) {
      this.data.products = this.data.products.map(p => p.id === product.id ? { ...p, ...product } as Product : p);
    } else {
      const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) } as Product;
      this.data.products.push(newProduct);
    }
    this.save();
    return product as Product;
  }

  async deleteProduct(id: string) {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
  }

  async getServices(businessId: string): Promise<Service[]> {
    return this.data.services.filter(s => s.business_id === businessId);
  }

  async saveService(service: Omit<Service, 'id'> & { id?: string }): Promise<Service> {
    if (service.id) {
      this.data.services = this.data.services.map(s => s.id === service.id ? { ...s, ...service } as Service : s);
    } else {
      const newService = { ...service, id: Math.random().toString(36).substr(2, 9) } as Service;
      this.data.services.push(newService);
    }
    this.save();
    return service as Service;
  }

  async deleteService(id: string) {
    this.data.services = this.data.services.filter(s => s.id !== id);
    this.save();
  }

  async getTeamMembers(businessId: string): Promise<TeamMember[]> {
    return (this.data.teamMembers || []).filter(m => m.business_id === businessId);
  }

  async saveTeamMember(member: Omit<TeamMember, 'id'> & { id?: string }): Promise<TeamMember> {
    if (member.id) {
      this.data.teamMembers = this.data.teamMembers.map(m => m.id === member.id ? { ...m, ...member } as TeamMember : m);
    } else {
      const newMember = { ...member, id: 'mem-' + Math.random().toString(36).substr(2, 5) } as TeamMember;
      if (!this.data.teamMembers) this.data.teamMembers = [];
      this.data.teamMembers.push(newMember);
    }
    this.save();
    return member as TeamMember;
  }

  async deleteTeamMember(id: string) {
    this.data.teamMembers = this.data.teamMembers.filter(m => m.id !== id);
    this.save();
  }

  async getAppointments(businessId: string): Promise<Appointment[]> {
    return (this.data.appointments || []).filter(a => a.business_id === businessId);
  }

  async saveAppointment(appointment: Omit<Appointment, 'id'> & { id?: string }): Promise<Appointment> {
    if (appointment.id) {
      this.data.appointments = this.data.appointments.map(a => a.id === appointment.id ? { ...a, ...appointment } as Appointment : a);
    } else {
      const newApp = { ...appointment, id: 'app-' + Math.random().toString(36).substr(2, 5) } as Appointment;
      if (!this.data.appointments) this.data.appointments = [];
      this.data.appointments.push(newApp);
    }
    this.save();
    return appointment as Appointment;
  }

  async updateAppointmentStatus(id: string, status: Appointment['status']) {
    this.data.appointments = this.data.appointments.map(a => a.id === id ? { ...a, status } : a);
    this.save();
  }

  async getTransactions(businessId?: string): Promise<Transaction[]> {
    if (businessId) {
      return this.data.transactions.filter(t => t.business_id === businessId);
    }
    return this.data.transactions;
  }

  async createTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    this.data.transactions.push(newTx);
    this.save();
    return newTx;
  }

  async addBusiness(b: Omit<Business, 'id'>): Promise<Business> {
    const newB: Business = { 
      ...b, 
      id: 'b' + Math.random().toString(36).substr(2, 5),
      opening_hours: b.opening_hours || defaultHours,
      mp_connected: b.mp_connected || false
    };
    this.data.businesses.push(newB);
    this.save();
    return newB;
  }
}

export const api = new MockApi();
