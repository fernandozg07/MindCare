import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register'; // Importe o componente Register
import Chat from './pages/Chat';
import History from './pages/History';
import PatientDashboard from './pages/PatientDashboard';
import TherapistDashboard from './pages/TherapistDashboard';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import PatientForm from './pages/PatientForm';
import Sessions from './pages/Sessions';
import SessionForm from './pages/SessionForm';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import MessageForm from './pages/MessageForm';
import Reports from './pages/Reports';
import ReportForm from './pages/ReportForm';
import PrivateRoute from './components/PrivateRoute';
import MeuTerapeuta from './pages/MeuTerapeuta';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> {/* Nova rota para registro */}
            
            {/* Rotas protegidas */}
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Chat />} />
              <Route path="chat" element={<Chat />} />
              <Route path="historico" element={<History />} />
              
              {/* Dashboard baseado no tipo de usuário */}
              <Route path="dashboard/paciente" element={
                <PrivateRoute allowed={['paciente']}>
                  <PatientDashboard />
                </PrivateRoute>
              } />
              <Route path="dashboard/terapeuta" element={
                <PrivateRoute allowed={['terapeuta']}>
                  <TherapistDashboard />
                </PrivateRoute>
              } />
              
              {/* Rotas específicas para terapeutas */}
              <Route path="pacientes" element={
                <PrivateRoute allowed={['terapeuta']}>
                  <PatientList />
                </PrivateRoute>
              } />
              <Route path="pacientes/novo" element={
                <PrivateRoute allowed={['terapeuta']}>
                  <PatientForm />
                </PrivateRoute>
              } />
              <Route path="pacientes/:id" element={
                <PrivateRoute allowed={['terapeuta']}>
                  <PatientDetails />
                </PrivateRoute>
              } />
              <Route path="pacientes/:id/editar" element={
                <PrivateRoute allowed={['terapeuta']}>
                  <PatientForm />
                </PrivateRoute>
              } />
              
              {/* Sessões */}
              <Route path="sessoes" element={<Sessions />} />
              <Route path="sessoes/nova" element={<SessionForm />} />
              <Route path="sessoes/:id/editar" element={<SessionForm />} />
              
              {/* Mensagens */}
              <Route path="mensagens" element={<Messages />} />
              <Route path="mensagens/nova" element={<MessageForm />} />
              
              {/* Relatórios (apenas terapeutas) */}
              <Route path="relatorios" element={
                <PrivateRoute allowed={['terapeuta']}>
                  <Reports />
                </PrivateRoute>
              } />
              <Route path="relatorios/novo" element={
                <PrivateRoute allowed={['terapeuta']}>
                  <ReportForm />
                </PrivateRoute>
              } />
              <Route path="relatorios/:id/editar" element={
                <PrivateRoute allowed={['terapeuta']}>
                  <ReportForm />
                </PrivateRoute>
              } />
              
              {/* Perfil */}
              <Route path="perfil" element={<Profile />} />
              
              {/* Rota para "Meu Terapeuta" (acessível apenas por pacientes) */}
              <Route path="meu-terapeuta" element={
                <PrivateRoute allowed={['paciente']}>
                  <MeuTerapeuta />
                </PrivateRoute>
              } />

              {/* Rota para Notificações */}
              <Route path="configuracoes/notificacoes" element={
                <PrivateRoute allowed={['terapeuta', 'paciente']}>
                  <NotificationsPage />
                </PrivateRoute>
              } />

            </Route>
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
