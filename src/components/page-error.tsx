export const PageError = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => {
  return (
    <div className="flex flex-col grow">
      <div className="text-red-500">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-2">{message}</p>
      </div>
    </div>
  );
};
