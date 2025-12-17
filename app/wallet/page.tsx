'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ monthSpent: 0, totalTransactions: 0, avgTransaction: 0 });
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchWalletData();
  }, [router]);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes, statsRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/wallet/transactions?limit=10'),
        api.get('/wallet/stats')
      ]);

      if (balanceRes.data.status === 'success') {
        setBalance(balanceRes.data.data.balance);
      }

      if (transactionsRes.data.status === 'success') {
        setTransactions(transactionsRes.data.data);
      }

      if (statsRes.data.status === 'success') {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount);
    if (!amount || amount < 1) {
      alert('Minimum recharge amount is ₹1');
      return;
    }
    if (amount > 100000) {
      alert('Maximum recharge amount is ₹1,00,000');
      return;
    }

    setProcessing(true);
    try {
      const orderRes = await api.post('/wallet/recharge/create-order', { amount });
      
      if (orderRes.data.status === 'success') {
        const { orderId, keyId } = orderRes.data.data;
        
        const options = {
          key: keyId,
          amount: amount * 100,
          currency: 'INR',
          name: 'Flight Portal',
          description: 'Wallet Recharge',
          order_id: orderId,
          handler: async (response: any) => {
            try {
              await api.post('/payment/verify', {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                type: 'wallet_recharge'
              });
              
              alert('Wallet recharged successfully!');
              setShowRechargeModal(false);
              setRechargeAmount('');
              fetchWalletData();
            } catch (error) {
              alert('Payment verification failed');
            }
          },
          prefill: {
            name: 'User',
            email: 'user@example.com'
          },
          theme: { color: '#3B82F6' }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      alert('Failed to create payment order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <DashboardLayout>
        <div className="p-4 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
            <p className="text-gray-600">Manage your account balance and transactions</p>
          </div>
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 mb-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-2">Available Balance</p>
                <p className="text-5xl font-bold">₹{balance.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <button 
                  onClick={() => setShowRechargeModal(true)}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 mb-3"
                >
                  Recharge Wallet
                </button>
                <p className="text-blue-100 text-sm">Last updated: Just now</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow">
              <p className="text-gray-600 mb-2">This Month Spent</p>
              <p className="text-3xl font-bold text-gray-800">₹{stats.monthSpent.toLocaleString()}</p>
              <p className="text-gray-600 text-sm mt-2">Total debit</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow">
              <p className="text-gray-600 mb-2">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalTransactions}</p>
              <p className="text-blue-600 text-sm mt-2">This month</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow">
              <p className="text-gray-600 mb-2">Avg. Transaction</p>
              <p className="text-3xl font-bold text-gray-800">₹{Math.round(stats.avgTransaction).toLocaleString()}</p>
              <p className="text-gray-600 text-sm mt-2">Per booking</p>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
                <div className="flex space-x-3">
                  <select className="px-4 py-2 border rounded-lg">
                    <option>All Types</option>
                    <option>Credit</option>
                    <option>Debit</option>
                  </select>
                  <input type="date" className="px-4 py-2 border rounded-lg" />
                </div>
              </div>
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No transactions yet</div>
              ) : transactions.map((txn: any) => (
                <div key={txn.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <span className="text-2xl">{txn.type === 'credit' ? '↓' : '↑'}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{txn.description}</p>
                        <p className="text-sm text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                      </p>
                      <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                        txn.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recharge Modal */}
          {showRechargeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                <h3 className="text-2xl font-bold mb-6">Recharge Wallet</h3>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="Enter amount (min ₹1)"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100000"
                  />
                  <p className="text-sm text-gray-500 mt-2">Minimum: ₹1 | Maximum: ₹1,00,000</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[1, 10, 100].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setRechargeAmount(amt.toString())}
                      className="py-2 px-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowRechargeModal(false);
                      setRechargeAmount('');
                    }}
                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRecharge}
                    disabled={processing || !rechargeAmount}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}