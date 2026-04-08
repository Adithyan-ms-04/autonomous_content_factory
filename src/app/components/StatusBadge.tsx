'use client';

import { CheckCircle, XCircle, Circle } from 'lucide-react';
import type { ContentPiece } from '@/app/types';

interface StatusBadgeProps {
  status: ContentPiece['status'];
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = {
    approved: {
      label: 'Approved',
      className: 'status-approved',
      icon: CheckCircle,
    },
    rejected: {
      label: 'Rejected',
      className: 'status-rejected',
      icon: XCircle,
    },
    draft: {
      label: 'Draft',
      className: 'status-draft',
      icon: Circle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}
