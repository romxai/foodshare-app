import React, { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";

interface AlertPopupProps {
  type: 'error' | 'success';
  title: string;
  message: string;
  onClose: () => void;
}

export function AlertPopup({ type, title, message, onClose }: AlertPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, x: '100%' }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 50, x: '100%' }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 right-4 z-[100]"
      >
        <Alert variant={type === 'error' ? "destructive" : "default"}>
          {type === 'error' ? (
            <ExclamationTriangleIcon className="h-4 w-4" />
          ) : (
            <CheckCircledIcon className="h-4 w-4" />
          )}
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
