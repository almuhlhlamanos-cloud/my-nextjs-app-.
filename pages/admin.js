import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tcsfftfqckossmpjshib.supabase.co'
const supabaseAnonKey = 'ضع_المفتاح_هنا'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')

    if (!error) setUsers(data || [])
    setLoading(false)
  }

  const handleDecision = async (userId, status) => {
    const { error } = await supabase
      .from('users')
      .update({ verification_status: status })
      .eq('id', userId)

    if (!error) {
      setUsers(users.filter(user => user.id !== userId))
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>لوحة تحكم الأدمن - مراجعة الهويات</h2>
      {loading ? (
        <p>جاري تحميل الطلبات...</p>
      ) : users.length === 0 ? (
        <p>لا توجد طلبات توثيق معلقة حالياً.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {users.map((user) => (
            <div key={user.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <p><strong>اسم المستخدم:</strong> {user.full_name || user.name || 'بدون اسم'}</p>
              {user.id_card_url && (
                <div style={{ margin: '10px 0' }}>
                  <img src={user.id_card_url} alt="ID Card" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '5px' }} />
                </div>
              )}
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button onClick={() => handleDecision(user.id, 'approved')} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}>قبول</button>
                <button onClick={() => handleDecision(user.id, 'rejected')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}>رفض</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
