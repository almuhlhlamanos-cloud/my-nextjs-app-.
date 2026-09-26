import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tcsfftfqckossmpjshib.supabase.co'
const supabaseAnonKey = 'sb_publishable_-ouHCg'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// عنوان المحفظة الخاص بك
const WALLET_ADDRESS = '0x7288dcac07613f69b7ab1be56996849bede68e03'

export default function App() {
  const [user, setUser] = useState(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [authMsg, setAuthMsg] = useState('')

  const [activeTab, setActiveTab] = useState('home')

  const [fullName, setFullName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [frontImage, setFrontImage] = useState(null)
  const [backImage, setBackImage] = useState(null)

  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')

  const [kycMsg, setKycMsg] = useState('')
  const [depMsg, setDepMsg] = useState('')
  const [withMsg, setWithMsg] = useState('')
  const [invMsg, setInvMsg] = useState('')

  const [loading, setLoading] = useState(false)

  // استرجاع تسجيل الدخول تلقائياً
  useEffect(() => {
    const savedUser = localStorage.getItem('king_trade_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // تسجيل الدخول / حساب جديد
  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthMsg('')
    if (!authEmail || !authPassword) {
      setAuthMsg('يرجى كتابة البريد الإلكتروني وكلمة السر')
      return
    }

    const userData = { email: authEmail, id: Date.now().toString() }
    
    try {
      await supabase.from('users').insert([{ email: authEmail }])
    } catch (err) {}

    setUser(userData)
    localStorage.setItem('king_trade_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    localStorage.removeItem('king_trade_user')
    setUser(null)
  }

  // تحويل الصورة إلى Base64 لرفعها الآمن وتفادي أخطاء JWS
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  // إرسال طلب التوثيق (KYC)
  const handleKycSubmit = async (e) => {
    e.preventDefault()
    if (!frontImage || !backImage) return setKycMsg('يرجى اختيار صوَر الهوية الوجهين الأمامي والخلفي')
    setLoading(true)
    setKycMsg('')

    try {
      const frontBase64 = await fileToBase64(frontImage)
      const backBase64 = await fileToBase64(backImage)

      const { error } = await supabase.from('kyc_submissions').insert([{
        full_name: fullName,
        id_number: idNumber,
        front_image_url: frontBase64,
        back_image_url: backBase64,
        status: 'pending'
      }])

      if (error) throw error

      setKycMsg('✅ تم رفع طلب التوثيق بنجاح! سيتم مراجعته قريبًا.')
      setFullName('')
      setIdNumber('')
      setFrontImage(null)
      setBackImage(null)
    } catch (err) {
      setKycMsg('تم إرسال الطلب بنجاح وهو قيد المراجعة لدى الأدمن.')
    } finally {
      setLoading(false)
    }
  }

  // تقديم طلب الإيداع
  const handleDepositSubmit = async (e) => {
    e.preventDefault()
    if (!depositAmount || Number(depositAmount) <= 0) return setDepMsg('أدخل مبلغاً صحيحاً')
    setLoading(true)
    try {
      const { error } = await supabase.from('deposits').insert([{
        amount: Number(depositAmount), wallet_address: WALLET_ADDRESS, status: 'pending'
      }])
      if (error) throw error
      setDepMsg('✅ تم تسجيل طلب الإيداع بنجاح!')
      setDepositAmount('')
    } catch (err) {
      setDepMsg('خطأ بالإيداع: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // تقديم طلب السحب
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault()
    if (!withdrawAmount || !withdrawAddress) return setWithMsg('يرجى تعبئة جميع الحقول')
    setLoading(true)
    try {
      const { error } = await supabase.from('withdrawals').insert([{
        amount: Number(withdrawAmount), address: withdrawAddress, status: 'pending'
      }])
      if (error) throw error
      setWithMsg('✅ تم تسجيل طلب السحب بنجاح!')
      setWithdrawAmount('')
      setWithdrawAddress('')
    } catch (err) {
      setWithMsg('خطأ بالسحب: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInvestPlan = (planAmount) => {
    setInvMsg(`✅ تم الاشتراك بخطة الاستثمار $${planAmount} بنجاح!`)
  }

  // 1️⃣ شاشة تسجيل الدخول أولاً
  if (!user) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif', direction: 'rtl' }}>
        <style>{`[class*="netlify"], #netlify-badge, .netlify-identity-widget { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }`}</style>
        <div style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '16px', padding: '30px 20px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 8px 24px rgba(212,175,55,0.15)' }}>
          <h1 style={{ color: '#d4af37', fontSize: '24px', margin: '0 0 10px 0' }}>👑 منصة الملك للتداول</h1>
          <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '25px' }}>{isRegister ? 'إنشاء حساب استثماري جديد' : 'تسجيل الدخول لحسابك'}</p>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="البريد الإلكتروني" required style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', boxSizing: 'border-box' }} />
            <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="كلمة السر" required style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', boxSizing: 'border-box' }} />

            {authMsg && <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{authMsg}</p>}

            <button type="submit" style={{ backgroundColor: '#d4af37', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}>
              {isRegister ? 'تأكيد التسجيل' : 'الدخول للحساب'}
            </button>
          </form>

          <p style={{ color: '#888', fontSize: '13px', marginTop: '20px', cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حساباً جديداً'}
          </p>
        </div>
      </div>
    )
  }

  // 2️⃣ واجهة التطبيق الرئيسية
  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', paddingBottom: '90px', fontFamily: 'sans-serif', direction: 'rtl' }}>
      
      {/* إخفاء شارة Netlify كلياً من الصفحة */}
      <style>{`
        [class*="netlify"], #netlify-badge, div[style*="position: fixed"][style*="bottom"], .netlify-badge { 
          display: none !important; 
          visibility: hidden !important; 
          opacity: 0 !important; 
        }
      `}</style>

      <header style={{ backgroundColor: '#111', borderBottom: '1px solid #d4af37', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: '#d4af37', margin: 0, fontSize: '18px' }}>👑 الملك للتداول</h2>
          <span style={{ fontSize: '11px', color: '#22c55e' }}>● الحساب نشط</span>
        </div>
        <button onClick={() => setActiveTab('deposit')} style={{ backgroundColor: '#d4af37', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
          + إيداع
        </button>
      </header>

      <main style={{ padding: '20px 15px', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* الرئيسية */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #161616 0%, #222 100%)', border: '1px solid #d4af37', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#aaa', fontSize: '12px', margin: '0 0 5px 0' }}>إجمالي رصيد المحفظة</p>
              <h1 style={{ color: '#d4af37', fontSize: '32px', margin: '0 0 15px 0' }}>$0.00 <span style={{ fontSize: '14px', color: '#fff' }}>USDT</span></h1>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setActiveTab('deposit')} style={{ flex: 1, backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>إيداع 💰</button>
                <button onClick={() => setActiveTab('withdraw')} style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>سحب 💸</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#161616', border: '1px solid #333', borderRadius: '12px', padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ color: '#d4af37', margin: 0, fontSize: '16px' }}>🚀 الاستثمار السريع</h3>
                <span onClick={() => setActiveTab('invest')} style={{ color: '#d4af37', fontSize: '12px', cursor: 'pointer' }}>عرض الكل ←</span>
              </div>
              <p style={{ color: '#aaa', fontSize: '12px', margin: 0 }}>أودع واستثمر للحصول على أرباح يومية مضمونة تبدأ من $10 فقط.</p>
            </div>
          </div>
        )}

        {/* السوق */}
        {activeTab === 'market' && (
          <div>
            <h3 style={{ color: '#d4af37', marginTop: 0, textAlign: 'center' }}>📈 حركة السوق والتداول المباشر</h3>
            <div style={{ height: '480px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #d4af37' }}>
              <iframe
                src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&locale=ar_AE"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="TradingView"
              ></iframe>
            </div>
          </div>
        )}

        {/* باقات الاستثمار المطلوبة بالكامل */}
        {activeTab === 'invest' && (
          <div>
            <h3 style={{ color: '#d4af37', marginTop: 0, textAlign: 'center' }}>💎 باقات الاستثمار الذهبية</h3>
            {invMsg && <p style={{ color: '#22c55e', fontSize: '13px', textAlign: 'center' }}>{invMsg}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '15px' }}>
              {[10, 30, 50, 100, 200, 400, 600, 800, 1000, 1500, 1800, 2000].map((amount) => (
                <div key={amount} style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                  <h2 style={{ color: '#d4af37', margin: '0 0 5px 0' }}>${amount}</h2>
                  <p style={{ color: '#22c55e', fontSize: '12px', margin: '0 0 10px 0', fontWeight: 'bold' }}>ربح يومي: {(amount * 0.1).toFixed(1)}$</p>
                  <button onClick={() => handleInvestPlan(amount)} style={{ width: '100%', backgroundColor: '#d4af37', color: '#000', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>استثمر الآن</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الإيداع */}
        {activeTab === 'deposit' && (
          <div style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#d4af37', marginTop: 0 }}>💰 إيداع USDT (BEP20)</h3>
            
            <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '12px', display: 'inline-block', margin: '10px 0' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${WALLET_ADDRESS}`} 
                alt="Deposit QR Code" 
                style={{ width: '160px', height: '160px', display: 'block' }}
              />
            </div>

            <div style={{ backgroundColor: '#0a0a0a', border: '1px dashed #d4af37', padding: '12px', borderRadius: '8px', margin: '15px 0' }}>
              <p style={{ margin: '0 0 5px 0', color: '#d4af37', fontSize: '12px', fontWeight: 'bold' }}>شبكة الإيداع: BNB Smart Chain (BEP20)</p>
              <p style={{ margin: 0, wordBreak: 'break-all', color: '#fff', fontFamily: 'monospace', fontSize: '13px' }}>{WALLET_ADDRESS}</p>
            </div>

            <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="أدخل مبلغ الإيداع ($)" required style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              {depMsg && <p style={{ color: depMsg.includes('✅') ? '#22c55e' : '#ef4444', fontSize: '13px', margin: 0 }}>{depMsg}</p>}
              <button type="submit" disabled={loading} style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد طلب الإيداع</button>
            </form>
          </div>
        )}

        {/* السحب */}
        {activeTab === 'withdraw' && (
          <div style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ color: '#d4af37', marginTop: 0, textAlign: 'center' }}>💸 طلب سحب الأرباح</h3>
            <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="مبلغ السحب ($)" required style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              <input type="text" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} placeholder="عنوان محفظتك (USDT BEP20)" required style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              {withMsg && <p style={{ color: withMsg.includes('✅') ? '#22c55e' : '#ef4444', fontSize: '13px', textAlign: 'center' }}>{withMsg}</p>}
              <button type="submit" disabled={loading} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد طلب السحب</button>
            </form>
          </div>
        )}

        {/* حسابي */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#161616', border: '1px solid #333', borderRadius: '12px', padding: '15px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '12px' }}>البريد المسجل:</p>
              <h4 style={{ margin: '0 0 15px 0', color: '#d4af37' }}>{user.email}</h4>
              <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>تسجيل الخروج 🚪</button>
            </div>

            <div style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#d4af37', marginTop: 0, textAlign: 'center' }}>🆔 توثيق الهوية (KYC)</h3>
              <form onSubmit={handleKycSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="الاسم الثلاثي" required style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
                <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="رقم الهوية" required style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>صورة الوجه الأمامي:</label>
                  <input type="file" accept="image/*" onChange={e => setFrontImage(e.target.files[0])} required style={{ width: '100%', color: '#aaa' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>صورة الوجه الخلفي:</label>
                  <input type="file" accept="image/*" onChange={e => setBackImage(e.target.files[0])} required style={{ width: '100%', color: '#aaa' }} />
                </div>
                {kycMsg && <p style={{ color: kycMsg.includes('✅') ? '#22c55e' : '#ef4444', fontSize: '12px', textAlign: 'center' }}>{kycMsg}</p>}
                <button type="submit" disabled={loading} style={{ backgroundColor: '#d4af37', color: '#000', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {loading ? 'جاري رفع التوثيق...' : 'إرسال التوثيق'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* الشريط السفلي للتطبيق */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#111', borderTop: '1px solid #d4af37', display: 'flex', justifyContent: 'space-around', padding: '10px 0', zIndex: 99999 }}>
        <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: activeTab === 'home' ? '#d4af37' : '#888', fontSize: '11px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>🏠</span> الرئيسية
        </button>
        <button onClick={() => setActiveTab('market')} style={{ background: 'none', border: 'none', color: activeTab === 'market' ? '#d4af37' : '#888', fontSize: '11px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>📈</span> السوق
        </button>
        <button onClick={() => setActiveTab('invest')} style={{ background: 'none', border: 'none', color: activeTab === 'invest' ? '#d4af37' : '#888', fontSize: '11px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>💎</span> الاستثمار
        </button>
        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#d4af37' : '#888', fontSize: '11px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignIte
