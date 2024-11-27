// views/shared/components/forms/form-confirm.tsx
'use client';

import { X } from 'lucide-react';
import { Form } from './form';
import { FormButton } from './form-button';

export interface FormConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function FormConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel"
}: FormConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Form 
        className="w-full max-w-md"
        title={title}
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm();
          onClose();
        }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>
        
        <p className="text-gray-600">{message}</p>
        
        <div className="flex justify-end gap-3 mt-6">
          <FormButton
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            {cancelText}
          </FormButton>
          <FormButton
            type="submit"
            variant="primary"
          >
            {confirmText}
          </FormButton>
        </div>
      </Form>
    </div>
  );
}