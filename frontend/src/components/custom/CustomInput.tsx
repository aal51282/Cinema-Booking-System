import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"

interface CustomInputProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  pattern?: string;
  required?: boolean;
  className?: string;
}

export default function CustomInput({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  pattern,
  required = false,
  className
}: CustomInputProps) {
  return (
    <div>
      <Label htmlFor={id} className="sr-only">{placeholder}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        pattern={pattern}
        required={required}
        value={value}
        onChange={onChange}
        className={cn("appearance-none rounded-none relative block w-full px-3 py-2 border border-darkgray-700 placeholder-darkgray-500 text-white focus:outline-none focus:ring-[#BA0C2F] focus:border-[#BA0C2F] focus:z-10 sm:text-sm bg-darkgray-800", className)}
        placeholder={placeholder}
      />
    </div>
  );
}
