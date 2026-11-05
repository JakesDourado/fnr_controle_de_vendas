import React from 'react'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

const DemoExpirado: React.FC = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e2a38 0%, #1976d2 100%)',
  }}>
    <div style={{
      background: '#fff', borderRadius: 12, padding: '48px 40px', maxWidth: 460,
      textAlign: 'center', boxShadow: '0 8px 32px #0005',
    }}>
      <div style={{ marginBottom: 16 }}><LockOutlinedIcon sx={{ fontSize: 56, color: "#c62828" }} /></div>
      <h2 style={{ color: '#c62828', marginBottom: 12, fontSize: 22 }}>
        Versão de demonstração encerrada
      </h2>
      <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
        O período de demonstração deste sistema expirou em <strong>10/12/2026</strong>.
      </p>
      <p style={{ color: '#888', fontSize: 13 }}>
        Para continuar utilizando, entre em contato com o desenvolvedor.
      </p>
    </div>
  </div>
)

export default DemoExpirado
