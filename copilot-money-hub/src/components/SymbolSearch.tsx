import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState, useEffect } from "react"

const API_BASE_URL = "http://localhost:8000/api";

interface SymbolSearchProps {
    value: string
    onChange: (value: string) => void
}

export function SymbolSearch({ value, onChange }: SymbolSearchProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const search = async () => {
            if (query.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const res = await fetch(`${API_BASE_URL}/trading/search?query=${query}`)
                const data = await res.json()
                setResults(data)
            } catch (e) {
                console.error("Search error:", e)
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(search, 500)
        return () => clearTimeout(timeoutId)
    }, [query])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-mono"
                >
                    {value ? value : "Select stock..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search symbol..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {loading && <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>}
                        {!loading && results.length === 0 && query.length >= 2 && (
                            <CommandEmpty>No stock found.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {results.map((item) => (
                                <CommandItem
                                    key={item.symbol}
                                    value={item.symbol}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.symbol ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold">{item.symbol}</span>
                                        <span className="text-xs text-muted-foreground">{item.name}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
