import React, { useState, useEffect } from 'react';
import { patientService } from '../services/api'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import { toast } from 'react-toastify';
import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

const MeuTerapeuta = () => {
  const [terapeuta, setTerapeuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTherapistInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await patientService.getTherapistForPatient();
        console.log("Dados do terapeuta recebidos:", data); // ESTA LINHA É CRÍTICA! VERIFIQUE O CONSOLE.
        setTerapeuta(data);
      } catch (err) {
        console.error('Erro ao carregar informações do terapeuta:', err);
        if (err.response && err.response.status === 404) {
          setError('Nenhum terapeuta associado encontrado para você. Por favor, entre em contato com o suporte.');
        } else if (err.response && err.response.data && err.response.data.detail) {
          setError(`Erro: ${err.response.data.detail}`);
        } else {
          setError('Não foi possível carregar as informações do terapeuta. Tente novamente mais tarde.');
        }
        toast.error('Erro ao carregar terapeuta.');
      } finally {
        setLoading(false);
      }
    };

    loadTherapistInfo();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Carregando informações do terapeuta..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 rounded-xl shadow-sm border border-red-200 text-red-700 text-center">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  // Verifica se o objeto terapeuta está vazio ou não tem as propriedades esperadas
  // Ex: se o backend retornar {} ou { detail: "Nenhum terapeuta associado" }
  if (!terapeuta || Object.keys(terapeuta).length === 0 || !terapeuta.email) { 
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200 text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum terapeuta associado encontrado.
        </h3>
        <p className="text-gray-600">
          Entre em contato com o suporte ou aguarde a atribuição de um terapeuta.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações do Meu Terapeuta</h2>

        <div className="space-y-5">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600" />
            <p className="text-lg text-gray-800">
              <span className="font-semibold">Nome:</span> {terapeuta.first_name} {terapeuta.last_name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-6 w-6 text-blue-600" />
            <p className="text-lg text-gray-800">
              <span className="font-semibold">Email:</span> {terapeuta.email}
            </p>
          </div>
          {terapeuta.telefone && ( // Renderiza apenas se 'telefone' existir e não for vazio
            <div className="flex items-center space-x-3">
              <Phone className="h-6 w-6 text-blue-600" />
              <p className="text-lg text-gray-800">
                <span className="font-semibold">Telefone:</span> {terapeuta.telefone}
              </p>
            </div>
          )}
          {terapeuta.especialidade && ( // Renderiza apenas se 'especialidade' existir e não for vazio
            <div className="flex items-center space-x-3">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <p className="text-lg text-gray-800">
                <span className="font-semibold">Especialidade:</span> {terapeuta.especialidade}
              </p>
            </div>
          )}
          {terapeuta.crp && ( // Renderiza apenas se 'crp' existir e não for vazio
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" /> 
              <p className="text-lg text-gray-800">
                <span className="font-semibold">CRP:</span> {terapeuta.crp}
              </p>
            </div>
          )}
          {(terapeuta.endereco || terapeuta.cep) && ( // Renderiza se 'endereco' ou 'cep' existirem e não forem vazios
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-blue-600" />
              <p className="text-lg text-gray-800">
                <span className="font-semibold">Endereço:</span> {terapeuta.endereco} {terapeuta.cep && `(${terapeuta.cep})`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeuTerapeuta;
