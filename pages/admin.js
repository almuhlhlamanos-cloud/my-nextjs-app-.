import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
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
      .eq('verification_status', 'pending')

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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h2>لوحة تحكم الأدمن - مراجعة الهويات</h2>
      {loading ? (
        <p>جاري تحميل الطلبات...</p>
      ) : users.length === 0 ? (
        <p>لا توجد طلبات توثيق معلقة حالياً.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'right' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>الاسم الكامل</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>صورة الهوية</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.full_name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <a href={user.id_card_url} target="_blank" rel="noreferrer">عرض الهوية</a>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => handleDecision(user.id, 'verified')}
                    style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: 'green', color: '#fff', border: 'none', borderRadius: '3px' }}
                  >
                    قبول
                  </button>
                  <button
                    onClick={() => handleDecision(user.id, 'rejected')}
                    style={{ padding: '5px 10px', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '3px' }}
                  >
                    رفض
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
    }
