import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// ربط Supabase
const supabaseUrl = 'https://tcsfftfqckossmpjshib.supabase.co'
const supabaseAnonKey = ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('deposits') // deposits | kyc | users | withdrawals
  const [deposits, setDeposits] = useState([])
  const [kycList, setKycList] = useState([])
  const [users, setUsers] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    
    // 1. جلب الإيداعات
    const { data: depData } = await supabase.from('deposits').select('*').order('created_at', { ascending: false })
    if (depData) setDeposits(depData)

    // 2. جلب التوثيقات
    const { data: kycData } = await supabase.from('kyc_submissions').select('*').order('created_at', { ascending: false })
    if (kycData) setKycList(kycData)

    // 3. جلب تسجيلات المستخدمين (إذا كان يوجد جدول users)
    const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    if (usersData) setUsers(usersData)

    // 4. جلب السحوبات
    const { data: withData } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false })
    if (withData) setWithdrawals(withData)

    setLoading(false)
  }

  // تحديث حالة الإيداع
  const updateDepositStatus = async (id, status) => {
    const { error } = await supabase.from('deposits').update({ status }).eq('id', id)
    if (!error) setDeposits(deposits.map(item => item.id === id ? { ...item, status } : item))
  }

  // تحديث حالة التوثيق
  const updateKycStatus = async (id, status) => {
    const { error } = await supabase.from('kyc_submissions').update({ status }).eq('id', id)
    if (!error) setKycList(kycList.map(item => item.id === id ? { ...item, status } : item))
  }

  // تحديث حالة السحب
  const updateWithdrawalStatus = async (id, status) => {
    const { error } = await supabase.from('withdrawals').update({ status }).eq('id', id)
    if (!error) setWithdrawals(withdrawals.map(item => item.id === id ? { ...item, status } : item))
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '20px', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* الهيدر والعنوان الرئيسي */}
      <header style={{ textAlign: 'center', borderBottom: '2px solid #d4af37', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ color: '#d4af37', margin: 0, fontSize: '26px' }}>👑 لوحة التحكم الشاملة - الملك للتداول</h1>
        <p style={{ color: '#888', fontSize: '13px', margin: '5px 0 0 0' }}>متابعة فورية لعمليات الإيداع، التوثيق، المستخدمين، والسحوبات</p>
      </header>

      {/* أزرار الأقسام للتبديل السريع */}
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('deposits')} style={{ padding: '10px 16px', backgroundColor: activeTab === 'deposits' ? '#d4af37' : '#161616', color: activeTab === 'deposits' ? '#000' : '#fff', border: '1px solid #d4af37', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          💰 عمليات الإيداع ({deposits.length})
        </button>
        <button onClick={() => setActiveTab('kyc')} style={{ padding: '10px 16px', backgroundColor: activeTab === 'kyc' ? '#d4af37' : '#161616', color: activeTab === 'kyc' ? '#000' : '#fff', border: '1px solid #d4af37', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          🆔 طلبات التوثيق ({kycList.length})
        </button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '10px 16px', backgroundColor: activeTab === 'users' ? '#d4af37' : '#161616', color: activeTab === 'users' ? '#000' : '#fff', border: '1px solid #d4af37', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          👤 المستخدمين ({users.length})
        </button>
        <button onClick={() => setActiveTab('withdrawals')} style={{ padding: '10px 16px', backgroundColor: activeTab === 'withdrawals' ? '#d4af37' : '#161616', color: activeTab === 'withdrawals' ? '#000' : '#fff', border: '1px solid #d4af37', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          💸 طلبات السحب ({withdrawals.length})
        </button>
      </nav>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#d4af37', fontSize: '16px' }}>جاري تحميل البيانات من Supabase...</p>
      ) : (
        <main style={{ maxWidth: '850px', margin: '0 auto' }}>

          {/* 1. قسم عمليات الإيداع */}
          {activeTab === 'deposits' && (
            <div>
              <h3 style={{ color: '#d4af37', borderBottom: '1px solid #333', paddingBottom: '8px' }}>سجل عمليات الإيداع</h3>
              {deposits.length === 0 ? <p style={{ color: '#888', textAlign: 'center' }}>لا توجد عمليات إيداع حتى الآن.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                  {deposits.map((item) => (
                    <div key={item.id} style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '10px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>المبلغ: ${item.amount}</p>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#aaa', fontFamily: 'monospace' }}>المحفظة: {item.wallet_address}</p>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888' }}>التاريخ: {new Date(item.created_at).toLocaleString('ar-EG')}</p>
                        <p style={{ margin: 0, fontSize: '13px' }}>الحالة: <span style={{ color: item.status === 'approved' ? '#22c55e' : item.status === 'rejected' ? '#ef4444' : '#eab308', fontWeight: 'bold' }}>{item.status}</span></p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => updateDepositStatus(item.id, 'approved')} style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>قبول 🟢</button>
                        <button onClick={() => updateDepositStatus(item.id, 'rejected')} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>رفض 🔴</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. قسم التوثيق KYC */}
          {activeTab === 'kyc' && (
            <div>
              <h3 style={{ color: '#d4af37', borderBottom: '1px solid #333', paddingBottom: '8px' }}>طلبات توثيق الهوية</h3>
              {kycList.length === 0 ? <p style={{ color: '#888', textAlign: 'center' }}>لا توجد طلبات توثيق حالياً.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                  {kycList.map((item) => (
                    <div key={item.id} style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '10px', padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div>
                          <p style={{ margin: '0 0 5px 0' }}><strong>الاسم الثلاثي:</strong> {item.full_name}</p>
                          <p style={{ margin: '0 0 5px 0' }}><strong>رقم الهوية:</strong> {item.id_number}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>تاريخ التقديم: {new Date(item.created_at).toLocaleString('ar-EG')}</p>
                        </div>
                        <div>
                          <span style={{ color: item.status === 'approved' ? '#22c55e' : item.status === 'rejected' ? '#ef4444' : '#eab308', fontWeight: 'bold' }}>{item.status}</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '15px 0' }}>
                        <div>
                          <p style={{ color: '#d4af37', fontSize: '12px', margin: '0 0 5px 0' }}>صورة الهوية (الأمامية):</p>
                          <a href={item.front_image_url} target="_blank" rel="noreferrer">
                            <img src={item.front_image_url} alt="Front ID" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #333' }} />
                          </a>
                        </div>
                        <div>
                          <p style={{ color: '#d4af37', fontSize: '12px', margin: '0 0 5px 0' }}>صورة الهوية (الخلفية):</p>
                          <a href={item.back_image_url} target="_blank" rel="noreferrer">
                            <img src={item.back_image_url} alt="Back ID" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #333' }} />
                          </a>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => updateKycStatus(item.id, 'approved')} style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>موافقة وتأكيد 🟢</button>
                        <button onClick={() => updateKycStatus(item.id, 'rejected')} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>رفض 🔴</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. قسم المستخدمين والتسجيلات */}
          {activeTab === 'users' && (
            <div>
              <h3 style={{ color: '#d4af37', borderBottom: '1px solid #333', paddingBottom: '8px' }}>تسجيلات الدخول والحسابات</h3>
              {users.length === 0 ? <p style={{ color: '#888', textAlign: 'center' }}>لا يوجد مستخدمين مسجلين حالياً.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                  {users.map((u) => (
                    <div key={u.id} style={{ backgroundColor: '#161616', border: '1px solid #333', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{u.email || u.username || 'مستخدم جديد'}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>تاريخ التسجيل: {new Date(u.created_at).toLocaleString('ar-EG')}</p>
                      </div>
                      <span style={{ fontSize: '12px', color: '#22c55e', backgroundColor: '#14532d', padding: '4px 10px', borderRadius: '4px' }}>نشط</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. قسم طلبات السحب */}
          {activeTab === 'withdrawals' && (
            <div>
              <h3 style={{ color: '#d4af37', borderBottom: '1px solid #333', paddingBottom: '8px' }}>طلبات سحب الأرباح</h3>
              {withdrawals.length === 0 ? <p style={{ color: '#888', textAlign: 'center' }}>لا توجد طلبات سحب حالياً.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                  {withdrawals.map((w) => (
                    <div key={w.id} style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#ef4444', fontWeight: 'bold', fontSize: '18px' }}>المبلغ: ${w.amount}</p>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#aaa', fontFamily: 'monospace' }}>إلى محفظة: {w.address}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>الحالة: <span style={{ color: w.status === 'approved' ? '#22c55e' : w.status === 'rejected' ? '#ef4444' : '#eab308' }}>{w.status}</span></p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => updateWithdrawalStatus(w.id, 'approved')} style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>موافقة 🟢</button>
                        <button onClick={() => updateWithdrawalStatus(w.id, 'rejected')} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>رفض 🔴</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      )}
    </div>
  )
}
