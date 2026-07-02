interface Props {
  readonly label: string;
  readonly name: string;
  readonly type?: string;
  readonly value: string | number | boolean;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readonly required?: boolean;
  readonly textarea?: boolean;
  readonly rows?: number;
  readonly placeholder?: string;
}

export function AdminFormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required,
  textarea,
  rows = 3,
  placeholder,
}: Props) {
  const cls =
    'w-full bg-[#05091a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-700/50';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {type === 'checkbox' ? (
        <input
          type="checkbox"
          name={name}
          checked={Boolean(value)}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          className="w-4 h-4 accent-blue-700"
        />
      ) : textarea ? (
        <textarea
          name={name}
          value={String(value)}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className={cls}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={type === 'number' ? Number(value) : String(value)}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={cls}
        />
      )}
    </div>
  );
}