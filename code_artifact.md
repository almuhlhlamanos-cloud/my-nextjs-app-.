import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('unverified');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('verification_status')
        .eq('id', user.id)
        .single();
      if (data) setStatus(data.verification_status || 'unverified');
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!file || !fullName) return alert('الرجاء إدخال الاسم ورفع صورة الهوية');

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    // 1. رفع الصورة إلى Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('id-cards')
      .upload(fileName, file);

    if (storageError) {
      alert('حدث خطأ أثناء رفع الصورة: ' + storageError.message);
      setLoading(false);
      return;
    }

    // الحصول على رابط الصورة العام
    const { data: urlData } = supabase.storage.from('id-cards').getPublicUrl(fileName);

    // 2. تحديث بيانات المستخدم في Database
    const { data: { user } } = await supabase.auth.getUser();
    const { error: dbError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        id_card_url: urlData.publicUrl,
        verification_status: 'pending'
      })
      .eq('id', user.id);

    setLoading(false);
    if (!dbError) {
      setStatus('pending');
      alert('تم إرسال طلب التوثيق بنجاح! بانتظار موافقة الأدمن.');
    } else {
      alert('حدث خطأ أثناء حفظ البيانات');
    }
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <h2>حساب المستخدم</h2>

      {/* إذا كان الحساب غير موثق */}
      {status === 'unverified' && (
        <form onSubmit={handleKycSubmit} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '400px' }}>
          <h3>توثيق الهوية (إجباري للشحن)</h3>
          <label style={{ display: 'block', marginBottom: '8px' }}>الاسم الكامل:</label>
          <input
            type="text"
            placeholder="أدخل اسمك كما في الهوية"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
          />
          
          <label style={{ display: 'block', marginBottom: '8px' }}>صورة الهوية / الجواز:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
            style={{ marginBottom: '15px' }}
          />
          <br />
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {loading ? 'جاري الرفع...' : 'إرسال التوثيق'}
          </button>
        </form>
      )}

      {/* إذا كان التوثيق قيد المراجعة */}
      {status === 'pending' && (
        <div style={{ padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', color: '#856404' }}>
          ⏳ طلب التوثيق قيد المراجعة من قِبل الأدمن. سيتم فتح الشحن فور الموافقة.
        </div>
      )}

      {/* إذا تم التوثيق بنجاح - يفتح قسم الشحن */}
      {status === 'verified' && (
        <div style={{ border: '1px solid green', padding: '20px', borderRadius: '8px', backgroundColor: '#e6fffa' }}>
          <h3>✅ الحساب موثق</h3>
          <p>قسم الإيداع والاستثمار متاح الآن للعمليات الحقيقية.</p>
        </div>
      )}
    </div>
  );
}