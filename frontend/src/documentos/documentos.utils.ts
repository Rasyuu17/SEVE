export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('es-CU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
});
};