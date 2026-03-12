import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPriorityColor(priority: 'High' | 'Medium' | 'Low') {
  switch (priority) {
    case 'High': return 'text-emerald-400';
    case 'Medium': return 'text-amber-400';
    case 'Low': return 'text-slate-400';
  }
}

export function getPriorityBg(priority: 'High' | 'Medium' | 'Low') {
  switch (priority) {
    case 'High': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30';
    case 'Medium': return 'bg-amber-400/10 text-amber-400 border-amber-400/30';
    case 'Low': return 'bg-slate-400/10 text-slate-400 border-slate-400/30';
  }
}

export function getScoreColor(score: number) {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#D4A843';
  return '#6b7280';
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
