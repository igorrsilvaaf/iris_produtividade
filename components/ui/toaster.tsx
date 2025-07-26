"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

type ToastActionElement = React.ReactElement<React.ComponentProps<typeof ToastAction> & { 'data-testid'?: string }>;

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({
        id,
        title,
        description,
        action,
        dataTestId = `toast-${id}`,
        ...props
      }) => {
        const toastAction = action as ToastActionElement | undefined;
        
        return (
          <Toast 
            key={id} 
            dataTestId={dataTestId}
            data-testid={dataTestId}
            {...props}
          >
            <div className="grid gap-1" data-testid={`${dataTestId}-content`}>
              {title && (
                <ToastTitle data-testid={`${dataTestId}-title`}>
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription data-testid={`${dataTestId}-description`}>
                  {description}
                </ToastDescription>
              )}
            </div>
            {toastAction && React.cloneElement(toastAction, {
              'data-testid': `${dataTestId}-action`
            })}
            <ToastClose data-testid={`${dataTestId}-close`} />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
