import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  showIcon?: boolean;
}

export function TimePicker({ value, onChange, showIcon = true }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full bg-[#F9F3F0] border-[#ada8b3] border-2 text-left font-['Verdana Pro Cond'] hover:bg-[#F9F3F0] hover:border-[#065553]",
            value ? "text-gray-800" : "text-gray-400 italic",
            showIcon ? "pl-10" : "pl-4"
          )}
        >
          {showIcon && (
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          )}
          {value || "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 bg-[#F9F3F0] border-[#ada8b3] border-2">
        <div className="flex gap-2">
          <div className="flex-1 h-48 overflow-y-auto">
            <div className="space-y-1">
              {hours.map((hour) => (
                <Button
                  key={hour}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-['Verdana Pro Cond']",
                    value?.startsWith(hour) ? "bg-[#065553] text-white" : "hover:bg-[#1C716F] hover:text-white"
                  )}
                  onClick={() => {
                    const currentMinute = value?.split(":")[1] || "00";
                    onChange(`${hour}:${currentMinute}`);
                  }}
                >
                  {hour}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-1 h-48 overflow-y-auto">
            <div className="space-y-1">
              {minutes.map((minute) => (
                <Button
                  key={minute}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-['Verdana Pro Cond']",
                    value?.endsWith(minute) ? "bg-[#065553] text-white" : "hover:bg-[#1C716F] hover:text-white"
                  )}
                  onClick={() => {
                    const currentHour = value?.split(":")[0] || "00";
                    onChange(`${currentHour}:${minute}`);
                  }}
                >
                  {minute}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 