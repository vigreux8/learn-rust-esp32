import { useEffect, useState } from "preact/hooks";

export function useQuizSessionActionMessage() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message == null) return;
    const t = window.setTimeout(() => setMessage(null), 3200);
    return () => clearTimeout(t);
  }, [message]);

  return {
    feedback: {
      message,
      setMessage,
    },
  };
}
