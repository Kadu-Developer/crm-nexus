import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function isActionOverdue(dateString: string): boolean {
  if (!dateString) return true;
  const target = new Date(dateString).getTime();
  const now = new Date('2026-08-14T23:59:59Z').getTime(); // Data de hoje no contexto
  return target < now;
}

export function isActionToday(dateString: string): boolean {
  if (!dateString) return false;
  const target = new Date(dateString).toISOString().split('T')[0];
  return target === '2026-08-14';
}
