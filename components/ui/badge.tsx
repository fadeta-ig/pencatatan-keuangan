import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-md hover:from-blue-700 hover:to-blue-800',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow',
        destructive:
          'border-transparent bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-md hover:from-red-700 hover:to-red-800',
        success:
          'border-transparent bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-md hover:from-green-700 hover:to-green-800',
        warning:
          'border-transparent bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:shadow-md hover:from-yellow-600 hover:to-yellow-700',
        outline: 'text-gray-900 border-2 border-gray-300 bg-white hover:bg-gray-50 hover:shadow',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
