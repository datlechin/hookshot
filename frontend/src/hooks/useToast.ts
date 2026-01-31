import { useToast as useToastBase } from '@/components/ui/use-toast';

/**
 * Custom toast hook with convenience methods
 */
export function useToast() {
  const { toast } = useToastBase();

  return {
    success: (message: string, title?: string) => {
      toast({
        title: title || 'Success',
        description: message,
        variant: 'success',
      });
    },
    error: (message: string, title?: string) => {
      toast({
        title: title || 'Error',
        description: message,
        variant: 'destructive',
      });
    },
    info: (message: string, title?: string) => {
      toast({
        title: title || 'Info',
        description: message,
        variant: 'default',
      });
    },
    toast, // Expose base toast for custom usage
  };
}
