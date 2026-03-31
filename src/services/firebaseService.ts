import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  UserProfile, 
  Product, 
  Order, 
  Wallet, 
  Withdrawal, 
  Transaction, 
  OrderStatus 
} from '../types';

export const firebaseService = {
  // User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    await setDoc(doc(db, 'users', profile.uid), profile);
    // Create initial wallet
    await setDoc(doc(db, 'wallets', profile.uid), {
      userId: profile.uid,
      balance: 0,
      pendingBalance: 0,
      updatedAt: new Date().toISOString()
    });
  },

  // Products
  async getProducts(category?: string): Promise<Product[]> {
    const q = category 
      ? query(collection(db, 'products'), where('category', '==', category), where('status', '!=', 'deleted'), orderBy('status'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'products'), where('status', '!=', 'deleted'), orderBy('status'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
  },

  async getProduct(id: string): Promise<Product | null> {
    const docSnap = await getDoc(doc(db, 'products', id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Product : null;
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...product,
      updatedAt: new Date().toISOString()
    });
  },

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, { status: 'deleted' }); // Soft delete or just delete
    // await deleteDoc(docRef); 
  },

  // Orders
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  async getOrdersByWhatsapp(whatsapp: string): Promise<Order[]> {
    const q = query(collection(db, 'orders'), where('buyerInfo.whatsapp', '==', whatsapp), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Order);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, shippingInfo?: Order['shippingInfo']): Promise<void> {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return;
    const currentOrder = orderSnap.data() as Order;

    // Prevent re-distributing if already completed
    if (currentOrder.status === 'completed' && status === 'completed') return;

    const updateData: any = { status };
    if (shippingInfo) updateData.shippingInfo = shippingInfo;
    
    await updateDoc(orderRef, updateData);

    if (status === 'completed') {
      await this.distributeRevenue(orderId);
    }
  },

  // Revenue Distribution (ESCROW LOGIC)
  async distributeRevenue(orderId: string): Promise<void> {
    const orderSnap = await getDoc(doc(db, 'orders', orderId));
    if (!orderSnap.exists()) return;
    const order = orderSnap.data() as Order;
    
    const productSnap = await getDoc(doc(db, 'products', order.productId));
    if (!productSnap.exists()) return;
    const product = productSnap.data() as Product;

    const total = order.totalAmount;
    const platformFeePercentage = 5; // 5% platform fee
    const affiliateCommissionPercentage = order.affiliateId ? product.commissionPercentage : 0;
    
    const platformFee = (total * platformFeePercentage) / 100;
    const affiliateCommission = (total * affiliateCommissionPercentage) / 100;
    const sellerRevenue = total - platformFee - affiliateCommission;

    // Update Seller Wallet
    await updateDoc(doc(db, 'wallets', order.sellerId), {
      balance: increment(sellerRevenue),
      updatedAt: new Date().toISOString()
    });
    await addDoc(collection(db, 'transactions'), {
      orderId,
      type: 'sale',
      amount: sellerRevenue,
      userId: order.sellerId,
      createdAt: new Date().toISOString()
    });

    // Update Affiliate Wallet
    if (order.affiliateId) {
      await updateDoc(doc(db, 'wallets', order.affiliateId), {
        balance: increment(affiliateCommission),
        updatedAt: new Date().toISOString()
      });
      await addDoc(collection(db, 'transactions'), {
        orderId,
        type: 'commission',
        amount: affiliateCommission,
        userId: order.affiliateId,
        createdAt: new Date().toISOString()
      });
    }

    // Platform Fee Transaction
    await addDoc(collection(db, 'transactions'), {
      orderId,
      type: 'platform_fee',
      amount: platformFee,
      userId: 'admin', // Platform account
      createdAt: new Date().toISOString()
    });
  },

  // Wallet & Withdrawals
  async getWallet(userId: string): Promise<Wallet | null> {
    const docSnap = await getDoc(doc(db, 'wallets', userId));
    return docSnap.exists() ? docSnap.data() as Wallet : null;
  },

  async requestWithdrawal(withdrawal: Omit<Withdrawal, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'withdrawals'), {
      ...withdrawal,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  // Admin
  async getAllWithdrawals(): Promise<Withdrawal[]> {
    const q = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Withdrawal);
  },

  async approveWithdrawal(id: string): Promise<void> {
    const withdrawalSnap = await getDoc(doc(db, 'withdrawals', id));
    if (!withdrawalSnap.exists()) return;
    const withdrawal = withdrawalSnap.data() as Withdrawal;

    // Deduct from wallet
    await updateDoc(doc(db, 'wallets', withdrawal.userId), {
      balance: increment(-withdrawal.amount),
      updatedAt: new Date().toISOString()
    });

    // Update status
    await updateDoc(doc(db, 'withdrawals', id), { status: 'approved' });
    
    // Record transaction
    await addDoc(collection(db, 'transactions'), {
      type: 'withdrawal',
      amount: withdrawal.amount,
      userId: withdrawal.userId,
      createdAt: new Date().toISOString()
    });
  }
};
