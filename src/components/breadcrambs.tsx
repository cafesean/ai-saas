import Link from "next/link";
import { Route } from "next";
import { ArrowLeft } from "lucide-react";

const Breadcrumbs = ({
  items,
  rightChildren,
}: {
  items: [
    {
      label: string;
      link: string;
    },
  ];
  rightChildren?: React.ReactNode;
}) => {
  return (
    <div className="flex h-16 items-center gap-4 border-b bg-background px-4 md:p-6">
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
      <div className="ml-auto flex items-center gap-2">{rightChildren}</div>
    </div>
  );
};

export default Breadcrumbs;
