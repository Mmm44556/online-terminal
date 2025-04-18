"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"

function ThemeSwitch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const { theme = "light" } = useTheme()
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.5rem] w-10 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        asChild
        data-slot='switch-thumb'
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-5 rounded-full ring-0 !transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      >
        <span className='relative'>
          <Sun
            className='size-4.5 text-yellow-500 absolute inset-0  opacity-0 data-[theme=light]:opacity-100'
            data-theme={theme}
          />
          <Moon
            className='size-4.5 text-slate-400 absolute inset-0 opacity-0 data-[theme=dark]:opacity-100'
            data-theme={theme}
          />
        </span>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export default ThemeSwitch
