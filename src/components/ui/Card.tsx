import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children = '' }: CardProps) {
  return (
    <div>
      {children}
    </div>
  );
}
