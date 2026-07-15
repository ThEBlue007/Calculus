import React from 'react';
import { InlineMath } from 'react-katex';

export default function MathText({ text }) {
  if (!text) return null;
  
  // Split by $$ to separate normal text and math
  const parts = text.split('$$');
  
  return (
    <>
      {parts.map((part, index) => {
        // Even indexes are normal text, odd indexes are math
        if (index % 2 === 0) {
          return <span key={index}>{part}</span>;
        } else {
          return <InlineMath key={index} math={part} />;
        }
      })}
    </>
  );
}
