import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select"
import { SelectProps } from "@radix-ui/react-select";
import { cn } from "@/framework/lib/utils";
import { isEmpty } from "lodash";
import { PlusCircle } from "lucide-react";
import React from "react";
interface SelectCmpProps extends SelectProps {
  placeholder?: string;
  options?: { value: string; label: React.ReactNode }[];
  className?: string;
  pannelClassName?: string;
  theme?: "light" | "dark";
  allowclear?: boolean;
  label?: string;
}
const SelectCmp = ({
  options,
  placeholder,
  className,
  pannelClassName,
  theme = "light",
  allowclear,
  label,
  ...opt
}: SelectCmpProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-gray-700">
          {label}
        </label>
      )}
      <Select {...opt}>
        <div className={cn(`relative`, className)}>
          <SelectTrigger
            className={cn(
              `relative ${
                theme === "light"
                  ? `hover:border-[#9E9FF2] border-[#CCC] text-gray-700 bg-white`
                  : `hover:border-[#1A6199] border-[#454545] text-[#999] bg-[#2E3238]`
              }
                      truncate
                      `,
              className,
            )}
          >
            <SelectValue placeholder={placeholder || "Please select"} />
          </SelectTrigger>
          {opt?.value && allowclear ? (
            <div className="absolute  bg-white w-8 h-[90%] top-[2px] right-[1px] rounded">
              <PlusCircle
                className="rotate-45 absolute right-2 top-[6px] cursor-pointer shrink-0 text-[#999]"
                onClick={e => {
                  e.stopPropagation();
                  opt?.onValueChange?.("");
                }}
              />
            </div>
          ) : null}
        </div>
  
        <SelectContent
          className={cn(
            `${
              theme === "light"
                ? `border-[#dee6e2] bg-white`
                : "border-[#454545] bg-[#2E3238]"
            } overflow-auto max-h-[300px]`,
            pannelClassName,
          )}
        >
          {isEmpty(options) ? (
            <div className="flex justify-center items-center h-20 text-[#999]">
              No Data
            </div>
          ) : (
            options?.map(item => (
              <SelectItem
                value={item.value}
                key={item.value}
                className={
                  theme === "light"
                    ? `border-[#DEE2E6] text-[#41373c] hover:bg-[#ECECFD] data-[state="checked"]:bg-primary data-[state="checked"]:text-white`
                    : `border-[#092033] text-white hover:bg-[#333] data-[state="checked"]:bg-primary data-[state="checked"]:text-white`
                }
              >
                {item.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
export default SelectCmp;
