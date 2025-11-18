import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 focus-visible:ring-blue-500',
        destructive:
          'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500',
        outline:
          'border-2 border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus-visible:ring-gray-500 text-gray-700',
        secondary:
          'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 hover:shadow-md focus-visible:ring-gray-500',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 text-gray-700',
        link: 'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700',
        success:
          'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 focus-visible:ring-green-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
