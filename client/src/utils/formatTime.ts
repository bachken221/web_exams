// Chuyển đổi số giây còn lại sang định dạng MM:SS hiển thị trên đồng hồ phòng thi
export function formatSecondsToMMSS(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
}

// Định dạng ngày giờ chuẩn Việt Nam (DD/MM/YYYY HH:mm)
export function formatDateTimeVN(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

