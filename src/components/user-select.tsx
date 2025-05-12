"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@/lib/db";

interface UserSelectProps {
  users: User[];
  className?: string;
}

export function UserSelect({ users, className }: UserSelectProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  // Load selected user from localStorage on component mount
  React.useEffect(() => {
    const savedUserId = localStorage.getItem("selectedUserId");
    if (savedUserId) {
      const user = users.find((user) => user.id === parseInt(savedUserId));
      if (user) {
        setValue(user.id.toString());
      }
    }
  }, [users]);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? users.find((user) => user.id.toString() === value)?.name
              : "Select your name..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" style={{ width: 'var(--radix-popover-trigger-width)' }} align="start">
          <Command>
            <CommandInput placeholder="Search your name..." className="h-9" />
            <CommandList>
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.name}
                    onSelect={(currentValue) => {
                      const selectedUser = users.find((u) => u.name === currentValue);
                      if (selectedUser) {
                        setValue(selectedUser.id.toString());
                        localStorage.setItem("selectedUserId", selectedUser.id.toString());
                        router.refresh();
                      }
                      setOpen(false);
                    }}
                  >
                    {user.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === user.id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

    </div>
  );
}
