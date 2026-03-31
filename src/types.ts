export type UserRole = 'seller' | 'affiliate' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  createdAt: string;
}

export interface ProductMedia {
  type: 'image' | 'video';
  url: string;
}

export interface MarketingKitItem {
  type: 'image' | 'video' | 'banner' | 'document';
  url: string;
  description?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  commissionPercentage: number;
  stock: number;
  category: string;
  media: ProductMedia[];
  marketingKit: MarketingKitItem[];
  createdAt: string;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  productId: string;
  sellerId: string;
  affiliateId?: string;
  buyerInfo: {
    name: string;
    email: string;
    whatsapp: string;
    address: string;
  };
  totalAmount: number;
  status: OrderStatus;
  shippingInfo?: {
    courier: string;
    trackingNumber: string;
  };
  createdAt: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  pendingBalance: number;
  updatedAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Transaction {
  id: string;
  orderId?: string;
  type: 'sale' | 'commission' | 'platform_fee' | 'withdrawal';
  amount: number;
  userId: string;
  createdAt: string;
}
