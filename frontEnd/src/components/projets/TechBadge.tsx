interface Props {
  label: string;
}

export function TechBadge({ label }: Props) {
  return (
    <span className="px-2 py-0.5 text-xs bg-blue-700/15 text-blue-400 border border-blue-700/20 rounded">
      {label}
    </span>
  );
}