import { Fragment } from 'react';

// Times, phone numbers, emails and URLs: LTR runs that must be isolated inside Hebrew text.
const LTR_RUN = /(https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.-]+|\+?\d[\d\s-]{6,}\d|\d{1,2}:\d{2}|\d+(?:\.\d+)+)/g;

export function BidiText({ text }: { text: string }) {
  const parts = text.split(LTR_RUN);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <bdi key={i}>{part}</bdi> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}
