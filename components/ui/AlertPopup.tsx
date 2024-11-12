import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

interface AlertPopupProps {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}

export const AlertPopup: React.FC<AlertPopupProps> = ({
  type,
  title,
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="bg-[#F9F3F0] rounded-xl p-6 shadow-lg border-2 border-[#ADA8B3] max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start space-x-4">
            {type === "success" ? (
              <CheckCircle className="h-6 w-6 text-[#1C716F] flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3
                className={`text-lg font-korolev tracking-wide ${
                  type === "success" ? "text-[#065553]" : "text-red-600"
                }`}
              >
                {title}
              </h3>
              <p className="mt-1 text-gray-600 font-['Verdana Pro Cond']">
                {message}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
