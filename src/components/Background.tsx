import { cn } from '@/utils/Helpers';

export const Background = (props: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('w-full', props.className)}>
    {props.children}
  </div>
);
