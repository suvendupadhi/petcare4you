import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, HelpCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'success' | 'info' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <XCircle className="text-red-600" size={32} />;
      case 'success': return <CheckCircle className="text-green-600" size={32} />;
      case 'warning': return <AlertCircle className="text-yellow-600" size={32} />;
      default: return <HelpCircle className="text-blue-600" size={32} />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 shadow-red-600/20';
      case 'success': return 'bg-green-600 hover:bg-green-700 shadow-green-600/20';
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20';
      default: return 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20';
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'danger': return 'bg-red-50';
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-yellow-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-16 h-16 ${getIconBg()} rounded-full flex items-center justify-center`}>
            {getIcon()}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all shadow-lg ${getButtonColor()} cursor-pointer`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
