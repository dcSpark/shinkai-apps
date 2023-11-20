import { Link } from "react-router-dom";

import { LucideArrowLeft } from "lucide-react";

import { HOME_PATH } from "../../routes/name";

const SimpleLayout = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="mx-auto max-w-lg py-10">
      <Link className="absolute left-10" to={HOME_PATH}>
        <LucideArrowLeft />
        <span className="sr-only">Back</span>
      </Link>
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight">{title}</h1>
      <div>{children}</div>
    </div>
  );
};

export default SimpleLayout;
