import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, LogIn, UserPlus, User, Lock, Phone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import React from "react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    fullName: "",
    adminCode: "",
  });

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    const user = localStorage.getItem('spot_user');
    if (user) navigate('/');
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn reload trang
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      
      // Kết nối tới Server Node.js Local
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isAdmin: isAdminMode
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      if (isLogin) {
        localStorage.setItem('spot_user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-change'));
        toast.success(isAdminMode ? `Chào sếp ${data.user.name}!` : "Đăng nhập thành công!");
        setTimeout(() => {
           navigate(isAdminMode ? "/admin" : "/");
        }, 500);
      } else {
        toast.success("Đăng ký thành công! Mời đăng nhập.");
        setIsLogin(true);
      }

    } catch (error: any) {
      toast.error(error.message || "Lỗi kết nối Server");
    } finally {
      setLoading(false);
    }
  };

  // --- CSS STYLES (Typed correctly to fix red errors) ---
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#1f293a',
      fontFamily: "'Poppins', sans-serif",
      overflow: 'hidden',
      position: 'relative',
    },
    box: {
      position: 'relative',
      width: '380px',
      height: '520px', 
      background: '#1c1c1c',
      borderRadius: '8px',
      overflow: 'hidden',
      zIndex: 10,
    },
    form: {
      position: 'absolute',
      inset: '4px',
      background: '#222',
      padding: '40px 30px',
      borderRadius: '8px',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
    },
    inputBox: {
      position: 'relative',
      width: '100%',
      marginTop: '25px',
    },
    // Fix lỗi đỏ ở đây bằng cách chuẩn hóa object style
    input: {
      width: '100%',
      padding: '20px 10px 10px',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#ffffff', // Đã sửa lỗi cú pháp màu
      fontSize: '1em',
      letterSpacing: '0.05em',
      transition: '0.5s',
      zIndex: 10,
      borderBottom: `1px solid ${isAdminMode ? '#ef4444' : '#0ef'}`,
    },
    label: {
      position: 'absolute',
      left: 0,
      padding: '20px 10px 10px',
      pointerEvents: 'none',
      color: '#8f8f8f',
      fontSize: '1em',
      letterSpacing: '0.05em',
      transition: '0.5s',
      top: 0,
    },
    submitBtn: {
      border: 'none',
      outline: 'none',
      padding: '12px 25px',
      background: isAdminMode ? '#ef4444' : '#0ef',
      cursor: 'pointer',
      fontSize: '0.9em',
      borderRadius: '4px',
      fontWeight: 600,
      width: '100%',
      marginTop: '30px',
      color: isAdminMode ? '#fff' : '#1f293a',
      boxShadow: isAdminMode ? '0 0 10px #ef4444' : '0 0 10px #0ef',
      transition: 'all 0.3s',
    },
    switchBtn: {
       cursor: 'pointer',
       color: isAdminMode ? '#ef4444' : '#8f8f8f',
       fontSize: '0.8em',
       marginBottom: '10px',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'flex-end',
       gap: '8px'
    },
    toggleText: {
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '0.8em',
        color: '#8f8f8f'
    },
    link: {
        color: isAdminMode ? '#ef4444' : '#0ef',
        cursor: 'pointer',
        fontWeight: 'bold',
        textDecoration: 'none',
        marginLeft: '5px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Rotating Border Effect */}
      <div className="border-animate" style={{
         position: 'absolute',
         width: '390px',
         height: '530px',
         background: isAdminMode ? 'linear-gradient(180deg, #ef4444, transparent, #ef4444)' : 'linear-gradient(180deg, #0ef, transparent, #0ef)',
         animation: 'animate 6s linear infinite',
         zIndex: 1
      }}></div>

      <div style={styles.box}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <h2 style={{ 
              color: isAdminMode ? '#ef4444' : '#0ef', 
              fontWeight: 500, 
              textAlign: 'center', 
              letterSpacing: '0.1em',
              fontSize: '24px',
              marginBottom: '10px'
          }}>
            {isLogin ? (isAdminMode ? "QUẢN TRỊ VIÊN" : "ĐĂNG NHẬP") : "ĐĂNG KÝ"}
          </h2>

          {/* Nút chuyển chế độ Admin */}
          {isLogin && (
              <div style={styles.switchBtn}>
                 <span onClick={() => setIsAdminMode(!isAdminMode)} style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    {isAdminMode ? <ShieldCheck size={16}/> : <UserPlus size={16}/>}
                    {isAdminMode ? "Chế độ Admin" : "Chế độ Khách"}
                 </span>
                 <Switch 
                    checked={isAdminMode} 
                    onCheckedChange={setIsAdminMode} 
                    className={isAdminMode ? "bg-red-600" : ""}
                 />
              </div>
          )}

          {!isLogin && (
            <div style={styles.inputBox}>
              <input 
                type="text" 
                required 
                style={styles.input} 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
              <span style={{
                  ...styles.label,
                  transform: formData.fullName ? 'translateY(-20px)' : 'none',
                  fontSize: formData.fullName ? '0.65em' : '1em',
                  color: isAdminMode ? '#ef4444' : '#0ef'
              }}>Họ và tên</span>
              <User size={18} style={{position: 'absolute', right: 0, top: '15px', color: isAdminMode ? '#ef4444' : '#0ef'}}/>
            </div>
          )}

          <div style={styles.inputBox}>
            <input 
              type="text" 
              required 
              style={styles.input}
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <span style={{
                  ...styles.label,
                  transform: formData.phone ? 'translateY(-20px)' : 'none',
                  fontSize: formData.phone ? '0.65em' : '1em',
                  color: isAdminMode ? '#ef4444' : '#0ef'
              }}>Số điện thoại</span>
             <Phone size={18} style={{position: 'absolute', right: 0, top: '15px', color: isAdminMode ? '#ef4444' : '#0ef'}}/>
          </div>

          <div style={styles.inputBox}>
            <input 
              type="password" 
              required 
              style={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
             <span style={{
                  ...styles.label,
                  transform: formData.password ? 'translateY(-20px)' : 'none',
                  fontSize: formData.password ? '0.65em' : '1em',
                  color: isAdminMode ? '#ef4444' : '#0ef'
              }}>Mật khẩu</span>
             <Lock size={18} style={{position: 'absolute', right: 0, top: '15px', color: isAdminMode ? '#ef4444' : '#0ef'}}/>
          </div>

          {isAdminMode && isLogin && (
              <div style={styles.inputBox}>
              <input 
                type="password" 
                required
                style={{...styles.input, color: '#ef4444', borderBottom: '1px solid #ef4444'}}
                value={formData.adminCode}
                onChange={(e) => setFormData({...formData, adminCode: e.target.value})}
              />
               <span style={{
                  ...styles.label,
                  transform: formData.adminCode ? 'translateY(-20px)' : 'none',
                  fontSize: formData.adminCode ? '0.65em' : '1em',
                  color: '#ef4444'
              }}>Mã bí mật (123456)</span>
            </div>
          )}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "ĐANG XỬ LÝ..." : (isLogin ? (isAdminMode ? "VÀO HỆ THỐNG" : "ĐĂNG NHẬP") : "TẠO TÀI KHOẢN")}
          </button>

          <p style={styles.toggleText}>
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <span style={styles.link} onClick={() => { setIsLogin(!isLogin); setIsAdminMode(false); }}>
                {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
            </span>
          </p>
        </form>
      </div>

      <style>{`
        @keyframes animate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Auth;