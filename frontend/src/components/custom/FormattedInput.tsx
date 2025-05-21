import { cn } from "@/lib/utils";
import { ChangeEvent, useState } from "react";
import { Input } from "../ui/input";

interface FormattedInputProps {
  onChange: (newValue: string | null) => void;
  className?: string;
  formatter?: (value: string) => string;
  validator?: (value: string) => boolean;
  placeholder?: string;
  errorMessage?: string;
  type?: string;
  required?: boolean;
  initialValue?: string
}

export function FormattedInput({ onChange, className, formatter, validator, placeholder, errorMessage, type, required, initialValue }: FormattedInputProps) {
    const [value, setValue] = useState<string>(initialValue ? initialValue : '');
    const [isTouched, setIsTouched] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        if (validator && !validator(newValue)) {
            onChange(null);
        } else {
            onChange(newValue);
        }
    }

    const handleBlur = () => {
        setIsTouched(true);
        setIsFocused(false);
    }

    const handleFocus = () => {
        setIsFocused(true);
    }

    const formattedValue = formatter ? formatter(value) : value;

    const isValid = validator ? validator(value) : true;

    return (
        <div className="relative group">
            <Input
                className={cn("appearance-none relative block w-full px-3 py-2 border border-darkgray-700 placeholder-darkgray-300 text-white  sm:text-sm bg-darkgray-800", className, { 'before:content-["*"] before:text-red-500 before:absolute before:-ml-6': required })}
                value={formattedValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder={placeholder}
                type={type}
            />
            {required && <span className="text-red-400 font-bold absolute -left-6 overflow-visible w-fit text-nowrap ml-2 top-1/2 transform -translate-y-1/2">*</span>}
            {isTouched && !isValid && !isFocused && (
                <p className="bg-darkgray-600 overflow-visible border border-darkgray-700 p-1 rounded-md text-red-500 text-sm absolute left-full top-1/2 transform -translate-y-1/2 ml-3 flex items-center pointer-events-none text-nowrap">
                    {errorMessage || "Invalid input"}
                </p>
            )}
        </div>
    )
}

export function PhoneInput({ onChange, className, required }: FormattedInputProps) {
    const formatPhoneNumber = (input: string) => {
        const numbers = input.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    };

    const validatePhoneNumber = (input: string) => {
        const numbers = input.replace(/\D/g, '');
        return !isNaN(parseInt(numbers)) && parseInt(numbers) > 1000000000;
    };

    return <FormattedInput 
    onChange={onChange} 
    className={className} 
    formatter={formatPhoneNumber} 
    validator={validatePhoneNumber} 
    placeholder="Phone Number (xxx-xxx-xxxx)"
    errorMessage="Invalid phone number"
    required={required}
    />
}

export function EmailInput({ onChange, className, required }: FormattedInputProps) {
    const formatEmail = (input: string) => {
        return input;
    };

    const validateEmail = (input: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    };

    return <FormattedInput 
        onChange={onChange} 
        className={className} 
        formatter={formatEmail} 
        validator={validateEmail} 
        placeholder="Email (example@example.com)"
        errorMessage="Invalid email"
        required={required}
    />
}
