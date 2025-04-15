import Link from "next/link";
import { Route } from "next";
import { ArrowLeft } from "lucide-react";

const Breadcrumbs = ({
  items,
  title,
  badge,
  rightChildren,
}: {
  items: [
    {
      label: string;
      link: string;
    },
  ];
  title?: string;
  badge?: React.ReactNode;
  rightChildren?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-start p-4 gap-4 border-b bg-background md:p-4 md:flex-row md:items-center md:justify-between">
      {items.map((item, index) => (
        <Link
          key={`breadcramb-${index}`}
          href={item.link as Route}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
      {title && <h1 className="text-2xl font-semibold">{title}</h1>}
      {badge}
      <div className="flex items-center gap-2 md:ml-auto">{rightChildren}</div>
    </div>
  );
};

export default Breadcrumbs;
