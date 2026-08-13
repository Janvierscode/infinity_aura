"use client";

import type { ReactNode } from "react";

type ConfirmSubmitButtonProps = {
  children: ReactNode;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  confirmation?: string;
  label: string;
  name?: string;
  value?: string;
};

export function ConfirmSubmitButton({
  children,
  className,
  formAction,
  confirmation = "Delete this item? This action cannot be undone.",
  label,
  name,
  value,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      className={className}
      formAction={formAction}
      name={name}
      value={value}
      aria-label={label}
      onClick={(event) => {
        if (!window.confirm(confirmation)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
