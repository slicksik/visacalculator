import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ children, value, onValueChange }: { children: React.ReactNode, value: string, onValueChange: (value: string) => void }) => {
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }>(
  ({ className, children, value, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
      <>
        <button
          ref={ref}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </button>
      </>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ value }: { value?: string }) => {
  return <span>{value}</span>;
};

const SelectContent = ({ children, value, onValueChange }: { children: React.ReactNode, value?: string, onValueChange?: (value: string) => void }) => {
  return (
    <div className="absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
      <div className="p-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, { onValueChange });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string, onValueChange?: (value: string) => void }>(
  ({ className, children, value, onValueChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onClick={() => onValueChange?.(value)}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
