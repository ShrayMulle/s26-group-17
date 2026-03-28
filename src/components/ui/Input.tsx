import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label>
          {label}
        </label>
      )}
      <input
        {...props}
      />
      {error && <p>{error}</p>}
    </div>
  );
}