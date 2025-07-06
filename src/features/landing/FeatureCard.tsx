export const FeatureCard = (props: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card/70 p-5 backdrop-blur-sm transition-all duration-300 hover:border-purple-200 hover:bg-card/90 hover:shadow-lg hover:shadow-purple-200/20">
    <div className="size-14 rounded-lg bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-3 shadow-md [&_svg]:stroke-white [&_svg]:stroke-2">
      {props.icon}
    </div>

    <div className="mt-4 text-xl font-bold">{props.title}</div>

    <div className="my-3 w-12 border-t-2 border-purple-400" />

    <div className="mt-2 leading-relaxed text-muted-foreground">{props.children}</div>
  </div>
);
