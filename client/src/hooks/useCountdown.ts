import { useEffect, useRef, useState } from 'react';

// Custom Hook đếm ngược thời gian thực dựa trên mốc thời gian kết thúc (endTimeMs)
// Đảm bảo chỉ khởi tạo duy nhất 1 bộ đếm setInterval và tự động dọn dẹp bằng clearInterval
export function useCountdown(endTimeMs: number | null, onTimeUp: () => void) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (!endTimeMs) {
      setRemainingSeconds(null);
      return;
    }

    hasTriggeredRef.current = false;

    const calculateRemaining = () => {
      const diffSeconds = Math.max(0, Math.ceil((endTimeMs - Date.now()) / 1000));
      setRemainingSeconds(diffSeconds);

      if (diffSeconds <= 0 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onTimeUpRef.current();
      }
    };

    // Tính ngay lập tức ở thời điểm mount
    calculateRemaining();

    const intervalId = window.setInterval(calculateRemaining, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [endTimeMs]);

  return remainingSeconds;
}
