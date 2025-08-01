export const CenteredHero = (props: {
  banner: React.ReactNode;
  title: React.ReactNode;
  description: string;
  chromeButton?: React.ReactNode;
  buttons?: React.ReactNode;
}) => (
  <>
    <div className="text-center">{props.banner}</div>

    <div className="mt-3 text-center text-6xl font-extrabold tracking-tight">
      {props.title}
    </div>

    <div className="mx-auto mt-5 max-w-screen-md text-center text-xl text-muted-foreground">
      {props.description}
    </div>

    {props.chromeButton && props.chromeButton}

    {props.buttons && (
      <div className="mt-8 flex justify-center gap-x-5 gap-y-3 max-sm:flex-col">
        {props.buttons}
      </div>
    )}
  </>
);
