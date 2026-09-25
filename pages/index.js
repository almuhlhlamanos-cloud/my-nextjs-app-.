import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// ربط Supabase
const supabaseUrl = 'https://tcsfftfqckossmpjshib.supabase.co'
const supabaseAnonKey = 'ضع_مفتاح_ANON_هنا'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Home() {
  const [activeTab, setActiveTab] = useState('home') // home | deposit | kyc
  
  // بيانات الإيداع
  const [depositAmount, setDepositAmount] = useState('')
  const [copied, setCopied] = useState(false)
  const [depLoading, setDepLoading] = useState(false)
  const [depMsg, setDepMsg] = useState('')
  
  const walletAddress = "0x7288dcac07613f69b7ab1be56996849bede68e03"
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}&color=000000&bgcolor=ffffff`

  // بيانات التوثيق
  const [fullName, setFullName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [frontImg, setFrontImg] = useState(null)
  const [backImg, setBackImg] = useState(null)
  const [kycLoading, setKycLoading] = useState(false)
  const [kycMsg, setKycMsg] = useState('')

  const investmentPlans = [10, 30, 50, 100, 200, 400, 600, 800, 1000, 1500, 1800, 2000]

  // نسخ العنوان
  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // إرسال الإيداع
  const handleDepositSubmit = async (e) => {
    e.preventDefault()
    if (!depositAmount || depositAmount <= 0) return setDepMsg('يرجى إدخال مبلغ صحيح')
    
    setDepLoading(true)
    setDepMsg('')

    const { error } = await supabase
      .from('deposits')
      .insert([{ amount: parseFloat(depositAmount), wallet_address: walletAddress, status: 'pending' }])

    if (error) {
      setDepMsg('حدث خطأ أثناء الإرسال')
    } else {
      setDepMsg('تم إرسال طلب الإيداع بنجاح!')
      setDepositAmount('')
    }
    setDepLoading(false)
  }

  // رفع صورة التوثيق
  const uploadImage = async (file, path) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error } = await supabase.storage.from('kyc-documents').upload(filePath, file)
    if (error) throw error

    const { data } = supabase.storage.from('kyc-documents').getPublicUrl(filePath)
    return data.publicUrl
  }

  // إرسال التوثيق
  const handleKycSubmit = async (e) => {
    e.preventDefault()
    if (!frontImg || !backImg) return setKycMsg('يرجى اختيار صورتي الهوية الأمامية والخلفية')

    setKycLoading(true)
    setKycMsg('')

    try {
      const frontUrl = await uploadImage(frontImg, 'front')
      const backUrl = await uploadImage(backImg, 'back')

      const { error } = await supabase.from('kyc_submissions').insert([{
        full_name: fullName,
        id_number: idNumber,
        front_image_url: frontUrl,
        back_image_url: backUrl,
        status: 'pending'
      }])

      if (error) throw error

      setKycMsg('تم إرسال طلب التوثيق بنجاح!')
      setFullName('')
      setIdNumber('')
      setFrontImg(null)
      setBackImg(null)
    } catch (err) {
      setKycMsg('حدث خطأ في الرفع: ' + err.message)
    } finally {
      setKycLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#f3c623', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', paddingBottom: '40px' }}>
      
      {/* الهيدر */}
      <header style={{ padding: '20px', borderBottom: '1px solid #d4af37', textAlign: 'center', backgroundColor: '#000' }}>
        <h1 style={{ margin: 0, fontSize: '26px', color: '#d4af37' }}>👑 الملك للتداول</h1>
        <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '13px' }}>إيداع - استثمار - سحب - توثيق آمن</p>
      </header>

      {/* شريط الأسواق الحي */}
      <div style={{ backgroundColor: '#111', padding: '10px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-around', overflowX: 'auto', fontSize: '13px' }}>
        <span>📈 BTC/USD: <strong style={{ color: '#22c55e' }}>$91,240</strong></span>
        <span>📉 ETH/USD: <strong style={{ color: '#22c55e' }}>$3,350</strong></span>
        <span>📈 GOLD: <strong style={{ color: '#22c55e' }}>$2,680</strong></span>
      </div>

      {/* أزرار التنقل السريع */}
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 10px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('home')} style={{ padding: '10px 16px', backgroundColor: activeTab === 'home' ? '#d4af37' : '#222', color: activeTab === 'home' ? '#000' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>الرئيسية والاستثمار</button>
        <button onClick={() => setActiveTab('deposit')} style={{ padding: '10px 16px', backgroundColor: activeTab === 'deposit' ? '#d4af37' : '#222', color: activeTab === 'deposit' ? '#000' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>إيداع USDT</button>
        <button onClick={() => setActiveTab('kyc')} style={{ padding: '10px 16px', backgroundColor: activeTab === 'kyc' ? '#d4af37' : '#222', color: activeTab === 'kyc' ? '#000' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>توثيق الحساب</button>
      </nav>

      {/* المحتوى */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '0 15px' }}>
        
        {/* 1. الرئيسية والباقت */}
        {activeTab === 'home' && (
          <div>
            <h3 style={{ textAlign: 'center', color: '#fff', borderBottom: '1px solid #d4af37', paddingBottom: '10px' }}>خطط الاستثمار المتاحة ($)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '15px' }}>
              {investmentPlans.map((plan) => (
                <div key={plan} style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                  <h3 style={{ margin: 0, color: '#fff' }}>${plan}</h3>
                  <button onClick={() => setActiveTab('deposit')} style={{ marginTop: '10px', backgroundColor: '#d4af37', color: '#000', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '12px' }}>استثمر الآن</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. الإيداع */}
        {activeTab === 'deposit' && (
          <div style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#d4af37', marginTop: 0 }}>إيداع USDT (BEP20)</h3>
            
            <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '10px', display: 'inline-block', border: '2px solid #d4af37', marginBottom: '15px' }}>
              <img src={qrCodeUrl} alt="QR" style={{ width: '150px', height: '150px', display: 'block' }} />
            </div>

            <div style={{ backgroundColor: '#222', border: '1px solid #333', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: '#f3c623', fontSize: '11px', fontFamily: 'monospace', direction: 'ltr', wordBreak: 'break-all' }}>{walletAddress}</span>
              <button onClick={handleCopy} style={{ backgroundColor: copied ? '#22c55e' : '#d4af37', color: '#000', border: 'none', padding: '6px 10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', minWidth: '55px' }}>{copied ? 'تم!' : 'نسخ'}</button>
            </div>

            <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="number" placeholder="أدخل المبلغ المُراد إيداعه ($)" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#222', color: '#fff' }} />
              {depMsg && <p style={{ color: depMsg.includes('نجاح') ? '#22c55e' : '#ef4444', fontSize: '12px' }}>{depMsg}</p>}
              <button type="submit" disabled={depLoading} style={{ backgroundColor: '#d4af37', color: '#000', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{depLoading ? 'جاري الإرسال...' : 'إرسال طلب الإيداع'}</button>
            </form>
          </div>
        )}

        {/* 3. التوثيق */}
        {activeTab === 'kyc' && (
          <div style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ color: '#fff', marginTop: 0, textAlign: 'center' }}>توثيق الهوية (KYC)</h3>
            
            <form onSubmit={handleKycSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: '#fff', fontSize: '13px', marginBottom: '4px' }}>الاسم الثلاثي:</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="أدخل اسمك الثلاثي" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#222', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: '#fff', fontSize: '13px', marginBottom: '4px' }}>رقم الهوية / التعريف:</label>
                <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required placeholder="أدخل رقم الهوية" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#222', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: '#fff', fontSize: '13px', marginBottom: '4px' }}>صورة الهوية (الوجه الأمامي):</label>
                <input type="file" accept="image/*" onChange={(e) => setFrontImg(e.target.files[0])} required style={{ color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: '#fff', fontSize: '13px', marginBottom: '4px' }}>صورة الهوية (الوجه الخلفي):</label>
                <input type="file" accept="image/*" onChange={(e) => setBackImg(e.target.files[0])} required style={{ color: '#fff' }} />
              </div>

              {kycMsg && <p style={{ color: kycMsg.includes('نجاح') ? '#22c55e' : '#ef4444', fontSize: '12px', textAlign: 'center' }}>{kycMsg}</p>}

              <button type="submit" disabled={kycLoading} style={{ backgroundColor: '#d4af37', color: '#000', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>{kycLoading ? 'جاري الإرسال والرفع...' : 'إرسال طلب التوثيق'}</button>
            </form>
          </div>
        )}

      </main>
    </div>
  )
    }
