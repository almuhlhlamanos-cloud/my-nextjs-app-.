import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tcsfftfqckossmpjshib.supabase.co'
const supabaseAnonKey = 'sb_publishable_-ouHCg'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function UserHome() {
  const [fullName, setFullName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [frontImage, setFrontImage] = useState(null)
  const [backImage, setBackImage] = useState(null)

  const [depositAmount, setDepositAmount] = useState('')
  const [kycMsg, setKycMsg] = useState('')
  const [depMsg, setDepMsg] = useState('')
  const [loadingKyc, setLoadingKyc] = useState(false)
  const [loadingDep, setLoadingDep] = useState(false)

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = `kyc/${fileName}`

    const { error } = await supabase.storage
      .from('kyc-images')
      .upload(filePath, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('kyc-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleKycSubmit = async (e) => {
    e.preventDefault()
    if (!frontImage || !backImage) {
      setKycMsg('يرجى اختيار صوَر الهوية الوجهين الأمامي والخلفي')
      return
    }

    setLoadingKyc(true)
    setKycMsg('')

    try {
      const frontUrl = await uploadImage(frontImage)
      const backUrl = await uploadImage(backImage)

      const { error } = await supabase
        .from('kyc_submissions')
        .insert([{ 
          full_name: fullName, 
          id_number: idNumber, 
          front_image_url: frontUrl, 
          back_image_url: backUrl,
          status: 'pending'
        }])

      if (error) throw error

      setKycMsg('✅ تم إرسال طلب التوثيق بنجاح! سيتم مراجعته قريبًا.')
      setFullName('')
      setIdNumber('')
      setFrontImage(null)
      setBackImage(null)
    } catch (err) {
      setKycMsg('حدث خطأ في الرفع: ' + (err.message || 'يرجى المحاولة لاحقاً'))
    } finally {
      setLoadingKyc(false)
    }
  }

  const handleDepositSubmit = async (e) => {
    e.preventDefault()
    if (!depositAmount || Number(depositAmount) <= 0) {
      setDepMsg('يرجى تحديد مبلغ إيداع صحيح')
      return
    }

    setLoadingDep(true)
    setDepMsg('')

    try {
      const { error } = await supabase
        .from('deposits')
        .insert([{ 
          amount: Number(depositAmount), 
          wallet_address: '0x94828a2a074c5dce7d110f019f958ee0420dfbc6',
          status: 'pending'
        }])

      if (error) throw error

      setDepMsg('✅ تم تسجيل طلب الإيداع بنجاح! يرجى إتمام التحويل للمحفظة.')
      setDepositAmount('')
    } catch (err) {
      setDepMsg('حدث خطأ أثناء الإيداع: ' + err.message)
    } finally {
      setLoadingDep(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif', paddingBottom: '40px' }}>
      
      {/* الهيدر الرئيسي */}
      <header style={{ textAlign: 'center', borderBottom: '2px solid #d4af37', padding: '15px 10px', backgroundColor: '#111' }}>
        <h1 style={{ color: '#d4af37', margin: 0, fontSize: '26px' }}>👑 منصة الملك للتداول</h1>
        <p style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>منصة التداول الآمنة والاستثمار الذهبي</p>
      </header>

      {/* شريط أسعار العملات المباشر */}
      <div style={{ width: '100%', overflow: 'hidden', backgroundColor: '#000', borderBottom: '1px solid #222' }}>
        <iframe 
          src="https://s.tradingview.com/embed-widget/ticker-tape/?locale=ar_AE#%7B%22symbols%22%3A%5B%7B%22proName%22%3A%22BITSTAMP%3ABTCUSDT%22%2C%22title%22%3A%22BTC%2FUSDT%22%7D%2C%7B%22proName%22%3A%22BITSTAMP%3AETHUSDT%22%2C%22title%22%3A%22ETH%2FUSDT%22%7D%2C%7B%22proName%22%3A%22BINANCE%3ABNBUSDT%22%2C%22title%22%3A%22BNB%2FUSDT%22%7D%2C%7B%22proName%22%3A%22BINANCE%3ASOLUSDT%22%2C%22title%22%3A%22SOL%2FUSDT%22%7D%2D%5D%2C%22showSymbolLogo%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" 
          style={{ width: '100%', height: '46px', border: 'none' }}
          title="Crypto Ticker"
        ></iframe>
      </div>

      <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 15px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* قسم الشارت المباشر للتداول TradingView Chart */}
        <section style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '12px', padding: '15px', overflow: 'hidden' }}>
          <h2 style={{ color: '#d4af37', fontSize: '18px', marginTop: 0, marginBottom: '15px', textAlign: 'center' }}>📈 سوق التداول المباشر (BTC / USDT)</h2>
          <div style={{ height: '450px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
              src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=ar_AE"
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="TradingView Chart"
            ></iframe>
          </div>
        </section>

        {/* قسم التوثيق KYC */}
        <section style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ color: '#d4af37', fontSize: '18px', marginTop: 0, marginBottom: '15px', textAlign: 'center' }}>🆔 توثيق الهوية (KYC)</h2>
          
          <form onSubmit={handleKycSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>الاسم الثلاثي:</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>رقم الهوية / التعريف:</label>
              <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} required style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>صورة الهوية (الوجه الأمامي):</label>
              <input type="file" accept="image/*" onChange={e => setFrontImage(e.target.files[0])} required style={{ width: '100%', color: '#aaa' }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>صورة الهوية (الوجه الخلفي):</label>
              <input type="file" accept="image/*" onChange={e => setBackImage(e.target.files[0])} required style={{ width: '100%', color: '#aaa' }} />
            </div>

            {kycMsg && <p style={{ color: kycMsg.includes('✅') ? '#22c55e' : '#ef4444', fontSize: '13px', textAlign: 'center', margin: '5px 0' }}>{kycMsg}</p>}

            <button type="submit" disabled={loadingKyc} style={{ backgroundColor: '#d4af37', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {loadingKyc ? 'جاري رفع الصور والطلب...' : 'إرسال طلب التوثيق'}
            </button>
          </form>
        </section>

        {/* قسم الإيداع */}
        <section style={{ backgroundColor: '#161616', border: '1px solid #d4af37', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ color: '#d4af37', fontSize: '18px', marginTop: 0, marginBottom: '15px', textAlign: 'center' }}>💰 إيداع USDT (BEP20)</h2>
          
          <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>حدد مبلغ الإيداع ($):</label>
              <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="مثال: 100" required style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ backgroundColor: '#0a0a0a', border: '1px dashed #d4af37', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#d4af37', fontWeight: 'bold' }}>عنوان محفظة الإيداع (BEP20):</p>
              <p style={{ margin: 0, wordBreak: 'break-all', color: '#aaa', fontFamily: 'monospace' }}>0x94828a2a074c5dce7d110f019f958ee0420dfbc6</p>
            </div>

            {depMsg && <p style={{ color: depMsg.includes('✅') ? '#22c55e' : '#ef4444', fontSize: '13px', textAlign: 'center', margin: '5px 0' }}>{depMsg}</p>}

            <button type="submit" disabled={loadingDep} style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loadingDep ? 'جاري التسجيل...' : 'تأكيد طلب الإيداع'}
            </button>
          </form>
        </section>

      </div>
    </div>
  )
    }
