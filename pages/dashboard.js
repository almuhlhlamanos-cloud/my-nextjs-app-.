import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Dashboard() {
  const [fullName, setFullName] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleKYCSubmit = async (e) => {
    e.preventDefault()
    if (!file || !fullName) {
      setMessage('يرجى إدخال الاسم الكامل وإرفاق صورة الهوية')
      return
    }

    try {
      setUploading(true)
      setMessage('')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('يرجى تسجيل الدخول أولاً')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('id-cards')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('id-cards')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          id_card_url: publicUrl,
          verification_status: 'pending'
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setMessage('تم تقديم طلب التوثيق بنجاح! بانتظار مراجعة الإدارة.')
    } catch (error) {
      setMessage(`حدث خطأ: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h2>توثيق الحساب (KYC)</h2>
      <form onSubmit={handleKYCSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>الاسم الكامل:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>صورة الهوية / الباسبور:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ width: '100%', marginTop: '5px' }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px' }}
        >
          {uploading ? 'جاري الرفع...' : 'إرسال لطلب التوثيق'}
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: message.includes('نجاح') ? 'green' : 'red' }}>{message}</p>}
    </div>
  )
  }
