import { cn } from '@/utils/Helpers';

export const Section = (props: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
  id?: string;
}) => (
  <div id={props.id} className={cn('px-3 py-16', props.className)}>
    {(props.title || props.subtitle || props.description) && (
      <div className="mx-auto mb-12 max-w-screen-md text-center">
        {props.subtitle && (
          <div className="flex items-center justify-center gap-4">
            <div className="h-0.5 w-full max-w-[100px] bg-gray-300"></div>
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-base font-bold uppercase tracking-wide text-transparent">
              {props.subtitle}
            </div>
            <div className="h-0.5 w-full max-w-[100px] bg-gray-300"></div>
          </div>
        )}

        {props.title && (
          <div className="mt-1 text-4xl font-extrabold tracking-tight">{props.title}</div>
        )}

        {props.description && (
          <div className="mt-2 text-lg text-muted-foreground">
            {props.description}
          </div>
        )}
      </div>
    )}

    <div className="mx-auto max-w-screen-lg">{props.children}</div>
  </div>
);
