// Alert.js
import React from "react";

const Alert = ({ children, variant = "default" }) => {
  const bgColor = variant === "destructive" ? "bg-red-50" : "bg-blue-50";
  const borderColor =
    variant === "destructive" ? "border-red-200" : "border-blue-200";
  const textColor =
    variant === "destructive" ? "text-red-800" : "text-blue-800";

  return (
    <div
      className={`p-4 rounded-lg border ${bgColor} ${borderColor} ${textColor} flex items-start gap-2`}
    >
      {children}
    </div>
  );
};

/**
 * AlertDescription component used inside Alert.
 */
const AlertDescription = ({ children }) => (
  <div className="text-sm flex-1">{children}</div>
);

export { Alert, AlertDescription };
