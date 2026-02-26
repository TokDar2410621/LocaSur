/**
 * ResponsiveModal - Dialog on desktop, Drawer (bottom sheet) on mobile
 * Automatically adapts based on screen size for optimal UX
 */

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveModalContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
});

function ResponsiveModal({
  open,
  onOpenChange,
  children,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ResponsiveModalContext.Provider value={{ isMobile: true }}>
        <Drawer
          open={open}
          onOpenChange={onOpenChange}
          handleOnly={true}
          modal={true}
          repositionInputs={true}
          setBackgroundColorOnScale={false}
        >
          {children}
        </Drawer>
      </ResponsiveModalContext.Provider>
    );
  }

  return (
    <ResponsiveModalContext.Provider value={{ isMobile: false }}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    </ResponsiveModalContext.Provider>
  );
}

function ResponsiveModalContent({
  children,
  className,
}: ResponsiveModalContentProps) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return (
      <DrawerContent
        className={cn(
          "max-h-[85dvh] overflow-hidden flex flex-col",
          className
        )}
      >
        {/* Scrollable content area - iOS optimized */}
        {/* Note: Modal overlays the bottom navbar, so we use standard safe area padding */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-4"
          style={{
            WebkitOverflowScrolling: 'touch',
            // Prevent iOS rubber-banding issues
            overscrollBehavior: 'contain',
            // Bottom padding: safe area + extra space for comfortable scrolling
            paddingBottom: 'max(env(safe-area-inset-bottom, 24px), 24px)',
          }}
        >
          {children}
        </div>
      </DrawerContent>
    );
  }

  return (
    <DialogContent className={cn("max-h-[90vh] overflow-y-auto", className)}>
      {children}
    </DialogContent>
  );
}

function ResponsiveModalHeader({
  children,
  className,
}: ResponsiveModalHeaderProps) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return <DrawerHeader className={className}>{children}</DrawerHeader>;
  }

  return <DialogHeader className={className}>{children}</DialogHeader>;
}

function ResponsiveModalFooter({
  children,
  className,
}: ResponsiveModalFooterProps) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return (
      <DrawerFooter className={cn("pb-safe", className)}>
        {children}
      </DrawerFooter>
    );
  }

  return <DialogFooter className={className}>{children}</DialogFooter>;
}

function ResponsiveModalTitle({
  children,
  className,
}: ResponsiveModalTitleProps) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return <DrawerTitle className={className}>{children}</DrawerTitle>;
  }

  return <DialogTitle className={className}>{children}</DialogTitle>;
}

function ResponsiveModalDescription({
  children,
  className,
}: ResponsiveModalDescriptionProps) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return (
      <DrawerDescription className={className}>{children}</DrawerDescription>
    );
  }

  return (
    <DialogDescription className={className}>{children}</DialogDescription>
  );
}

function ResponsiveModalClose({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return <DrawerClose className={className}>{children}</DrawerClose>;
  }

  return <DialogClose className={className}>{children}</DialogClose>;
}

export {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalClose,
};
