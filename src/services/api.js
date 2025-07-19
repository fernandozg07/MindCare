import axios from 'axios';

// Define a URL base da API com base na variável de ambiente do Vite.
// Em produção (Render), import.meta.env.VITE_REACT_APP_BACKEND_URL será 'https://holistica-ia-backend.onrender.com'.
// Em desenvolvimento local, o proxy do Vite (vite.config.js) lida com '/api',
// mas a variável ainda é necessária para o build de produção.
const BACKEND_BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const api = axios.create({
    // A baseURL será a URL completa do backend em produção, ou '/api' em desenvolvimento local
    // (que será interceptado pelo proxy do Vite).
    baseURL: `${BACKEND_BASE_URL}/api/`,
    withCredentials: true, // Importante para enviar e receber cookies de sessão (CSRF)
    headers: {
        'Content-Type': 'application/json', // Define o tipo de conteúdo padrão para JSON
    },
    timeout: 10000, // Tempo limite de 10 segundos para as requisições
});

// Cache the CSRF token in memory once fetched
let cachedCsrfToken = null;

// Interceptor para adicionar CSRF token a requisições que modificam dados (POST, PUT, PATCH, DELETE)
api.interceptors.request.use(
    async (config) => {
        // Only apply for methods that need CSRF protection
        if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
            // If we don't have a cached token, fetch it
            if (!cachedCsrfToken) {
                try {
                    // Make a GET request to the CSRF endpoint to get the token in the response body
                    const response = await api.get('csrf/'); 
                    cachedCsrfToken = response.data.csrftoken; // Store the token from the response body
                } catch (error) {
                    console.warn('Erro ao buscar CSRF token do servidor:', error);
                    // Optionally, re-throw the error or handle it to prevent the request from proceeding
                    // For now, we'll just log and proceed without the token, which will likely result in a 403
                }
            }
            // If we have a token (either cached or newly fetched), add it to the header
            if (cachedCsrfToken) {
                config.headers['X-CSRFToken'] = cachedCsrfToken;
            }
        }
        return config; // Return the modified request configuration
    },
    (error) => {
        // Reject the promise if there's an error in the request configuration
        return Promise.reject(error);
    }
);

// Interceptor para tratar respostas e erros da API
api.interceptors.response.use(
    (response) => response, // Se a resposta for bem-sucedida, apenas a retorna
    (error) => {
        // Se houver um erro de resposta (ex: 401 Unauthorized, 403 Forbidden)
        if (error.response?.status === 401) { // Apenas desloga se for 401 (Unauthorized)
            // Limpa os dados de autenticação armazenados localmente
            localStorage.removeItem('user');
            localStorage.removeItem('userType'); // Esta linha pode ser removida se 'userType' não for usado
            localStorage.removeItem('isAuthenticated');
            // Redireciona para a página de login, a menos que já esteja nela
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        // Para 403 (Forbidden) e outros erros, apenas rejeita a promessa
        // O componente que fez a chamada deve tratar este erro e exibir uma mensagem.
        return Promise.reject(error); 
    }
);

/*
 * Serviços de autenticação
 */
export const authService = {
    login: async (credentials) => {
        const response = await api.post('usuarios/login/', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('usuarios/logout/');
        return response.data;
    }
};

/*
 * Serviços de usuário
 */
export const userService = {
    getProfile: async () => {
        const response = await api.get('usuarios/perfil/');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('usuarios/perfil/', profileData);
        return response.data;
    },

    searchPatients: async (searchTerm) => {
        const response = await api.get(`usuarios/buscar-pacientes/?search=${searchTerm}`);
        return response.data;
    },

    // Método para buscar dados do painel do paciente
    getPatientDashboard: async () => {
        const response = await api.get('usuarios/painel-paciente/');
        return response.data;
    },

    // Método para buscar dados do painel do terapeuta
    getTherapistDashboard: async () => {
        const response = await api.get('usuarios/painel-terapeuta/');
        return response.data;
    },

    // Método de registro de usuário (adicionado aqui)
    registerUser: async (userData) => {
        try {
            const response = await api.post('usuarios/register/', userData); // Endpoint de registro
            return response.data;
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            throw error;
        }
    },
};

/*
 * Serviços de pacientes (para terapeutas e pacientes)
 */
export const patientService = {
    getPatients: async () => {
        const response = await api.get('usuarios/pacientes/');
        return response.data;
    },

    createPatient: async (patientData) => {
        const response = await api.post('usuarios/pacientes/', patientData);
        return response.data;
    },

    getPatient: async (patientId) => {
        const response = await api.get(`usuarios/pacientes/${patientId}/`);
        return response.data;
    },

    updatePatient: async (patientId, patientData) => {
        const response = await api.put(`usuarios/pacientes/${patientId}/`, patientData);
        return response.data;
    },

    deletePatient: async (patientId) => {
        const response = await api.delete(`usuarios/pacientes/${patientId}/`);
        return response.data;
    },
    
    // Método para carregar pacientes com o usuario_id para formulários
    getPatientsForReports: async (search = '') => {
        try {
            const response = await api.get(`/usuarios/buscar-pacientes/?search=${search}`);
            return response.data; // Este endpoint já retorna o usuario_id e o id do Paciente
        } catch (error) {
            console.error("Erro ao buscar pacientes para relatórios:", error);
            throw error;
        }
    },

    // Método para o paciente buscar as informações do seu terapeuta principal
    getTherapistForPatient: async () => {
        // Este endpoint no backend deve retornar os dados do terapeuta
        // associado ao paciente logado (autenticado via sessão/token).
        const response = await api.get('usuarios/meu-terapeuta/'); 
        return response.data;
    },
};

/*
 * Serviços de sessões
 */
export const sessionService = {
    getSessions: async () => {
        const response = await api.get('usuarios/sessoes/');
        return response.data;
    },

    createSession: async (sessionData) => {
        const response = await api.post('usuarios/sessoes/', sessionData);
        return response.data;
    },

    getSession: async (sessionId) => {
        const response = await api.get(`usuarios/sessoes/${sessionId}/`);
        return response.data;
    },

    updateSession: async (sessionId, sessionData) => {
        const response = await api.put(`usuarios/sessoes/${sessionId}/`, sessionData);
        return response.data;
    },

    deleteSession: async (sessionId) => {
        const response = await api.delete(`usuarios/sessoes/${sessionId}/`);
        return response.data;
    }
};

/*
 * Serviços de mensagens
 */
export const messageService = {
    getMessages: async () => {
        const response = await api.get('usuarios/mensagens/');
        return response.data;
    },

    createMessage: async (messageData) => {
        // Este método recebe o 'messageData' já com 'destinatario_id' se o usuário for terapeuta.
        // O Axios enviará este objeto como JSON no corpo da requisição POST.
        const response = await api.post('usuarios/mensagens/', messageData);
        return response.data;
    },

    getMessage: async (messageId) => {
        const response = await api.get(`usuarios/mensagens/${messageId}/`);
        return response.data;
    },

    updateMessage: async (messageId, messageData) => {
        const response = await api.put(`usuarios/mensagens/${messageId}/`, messageData);
        return response.data;
    },

    deleteMessage: async (messageId) => {
        const response = await api.delete(`usuarios/mensagens/${messageId}/`);
        return response.data;
    }
};

/*
 * Serviços de relatórios
 */
export const reportService = {
    getReports: async () => {
        const response = await api.get('usuarios/relatorios/');
        return response.data;
    },

    createReport: async (reportData) => {
        const response = await api.post('usuarios/relatorios/', reportData);
        return response.data;
    },

    getReport: async (reportId) => {
        const response = await api.get(`usuarios/relatorios/${reportId}/`);
        return response.data;
    },

    updateReport: async (reportId, reportData) => {
        const response = await api.put(`usuarios/relatorios/${reportId}/`, reportData);
        return response.data;
    },

    deleteReport: async (reportId) => {
        const response = await api.delete(`usuarios/relatorios/${reportId}/`);
        return response.data;
    }
};

/*
 * Serviços de IA (Ajustado para os novos caminhos das APIs de painel)
 */
export const aiService = {
    sendMessage: async (message) => {
        const response = await api.post('ia/responder/', { mensagem_usuario: message });
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('ia/historico/api/');
        return response.data;
    },
};

/*
 * Serviços de notificações
 */
export const notificationService = {
    getNotifications: async () => {
        const response = await api.get('usuarios/notificacoes/'); 
        return response.data;
    },
    markAsRead: async (notificationId) => {
        const response = await api.patch(`usuarios/notificacoes/${notificationId}/`, { lida: true });
        return response.data;
    },
    deleteNotification: async (notificationId) => {
        const response = await api.delete(`usuarios/notificacoes/${notificationId}/`);
        return response.data;
    }
};

export default api;
