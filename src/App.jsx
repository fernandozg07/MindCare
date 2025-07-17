import React, { useMemo } from 'react'; // Importe useMemo
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
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
  // Memoize os arrays 'allowed' para evitar recriação a cada renderização
  const allowedForPatientDashboard = useMemo(() => ['paciente'], []);
  const allowedForTherapistDashboard = useMemo(() => ['terapeuta'], []);
  const allowedForTherapistOnly = useMemo(() => ['terapeuta'], []);
  const allowedForPatientOnly = useMemo(() => ['paciente'], []);
  // CORREÇÃO: Inclua 'admin' aqui se administradores devem acessar a rota principal e o layout.
  const allowedForAllAuthenticated = useMemo(() => ['terapeuta', 'paciente', 'admin'], []); 

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rota raiz que redireciona para o chat ou dashboard após login */}
            {/* Esta rota é protegida para garantir que apenas usuários autenticados a acessem */}
            <Route path="/" element={
              <PrivateRoute allowed={allowedForAllAuthenticated}> {/* Permite ambos os tipos de usuário e admin */}
                <Layout /> {/* Layout principal da aplicação */}
              </PrivateRoute>
            }>
              {/* Rotas aninhadas dentro do Layout */}
              <Route index element={<Chat />} /> {/* Rota padrão após login */}
              <Route path="chat" element={<Chat />} />
              <Route path="historico" element={<History />} />
              
              {/* Dashboard baseado no tipo de usuário */}
              <Route path="dashboard/paciente" element={
                <PrivateRoute allowed={allowedForPatientDashboard}>
                  <PatientDashboard />
                </PrivateRoute>
              } />
              <Route path="dashboard/terapeuta" element={
                <PrivateRoute allowed={allowedForTherapistDashboard}>
                  <TherapistDashboard />
                </PrivateRoute>
              } />
              
              {/* Rotas específicas para terapeutas */}
              <Route path="pacientes" element={
                <PrivateRoute allowed={allowedForTherapistOnly}>
                  <PatientList />
                </PrivateRoute>
              } />
              <Route path="pacientes/novo" element={
                <PrivateRoute allowed={allowedForTherapistOnly}>
                  <PatientForm />
                </PrivateRoute>
              } />
              <Route path="pacientes/:id" element={
                <PrivateRoute allowed={allowedForTherapistOnly}>
                  <PatientDetails />
                </PrivateRoute>
              } />
              <Route path="pacientes/:id/editar" element={
                <PrivateRoute allowed={allowedForTherapistOnly}>
                  <PatientForm />
                </PrivateRoute>
              } />
              
              {/* Sessões (assumindo que são acessíveis por ambos ou você terá PrivateRoutes mais específicas) */}
              {/* Se sessões são para ambos, use allowedForAllAuthenticated */}
              <Route path="sessoes" element={<Sessions />} />
              <Route path="sessoes/nova" element={<SessionForm />} />
              <Route path="sessoes/:id/editar" element={<SessionForm />} />
              
              {/* Mensagens (assumindo que são acessíveis por ambos) */}
              {/* Se mensagens são para ambos, use allowedForAllAuthenticated */}
              <Route path="mensagens" element={<Messages />} />
              <Route path="mensagens/nova" element={<MessageForm />} />
              
              {/* Relatórios (apenas terapeutas) */}
              <Route path="relatorios" element={
                <PrivateRoute allowed={allowedForTherapistOnly}>
                  <Reports />
                </PrivateRoute>
              } />
              <Route path="relatorios/novo" element={
                <PrivateRoute allowed={allowedForTherapistOnly}>
                  <ReportForm />
                </PrivateRoute>
              } />
              <Route path="relatorios/:id/editar" element={
                <PrivateRoute allowed={allowedForTherapistOnly}>
                  <ReportForm />
                </PrivateRoute>
              } />
              
              {/* Perfil (acessível por ambos) */}
              <Route path="perfil" element={<Profile />} />
              
              {/* Rota para "Meu Terapeuta" (acessível apenas por pacientes) */}
              <Route path="meu-terapeuta" element={
                <PrivateRoute allowed={allowedForPatientOnly}>
                  <MeuTerapeuta />
                </PrivateRoute>
              } />

              {/* Rota para Notificações (acessível por ambos) */}
              <Route path="configuracoes/notificacoes" element={
                <PrivateRoute allowed={allowedForAllAuthenticated}>
                  <NotificationsPage />
                </PrivateRoute>
              } />

            </Route> {/* Fim das rotas protegidas pelo Layout */}
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
