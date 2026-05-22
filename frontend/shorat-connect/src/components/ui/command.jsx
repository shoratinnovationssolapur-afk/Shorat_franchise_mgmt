import * as React from "react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./path-to-your-command-components"

export function DemoCommandPalette() {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  // Example command items
  const commands = [
    { id: "new-file", name: "New File", shortcut: "Ctrl+N" },
    { id: "open-file", name: "Open File", shortcut: "Ctrl+O" },
    { id: "save-file", name: "Save File", shortcut: "Ctrl+S" },
    { id: "close-file", name: "Close File", shortcut: "Ctrl+W" },
  ]

  // Filter commands based on search
  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn">
        Open Command Palette
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={setSearch}
          autoFocus
        />
        <CommandList>
          {filteredCommands.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          <CommandGroup heading="Commands">
            {filteredCommands.map((cmd) => (
              <CommandItem
                key={cmd.id}
                onSelect={() => {
                  alert(`You selected: ${cmd.name}`)
                  setOpen(false)
                }}
              >
                {cmd.name}
                <CommandShortcut>{cmd.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />
          <CommandGroup heading="Other">
            <CommandItem
              onSelect={() => {
                alert("Settings opened")
                setOpen(false)
              }}
            >
              Settings
              <CommandShortcut>Ctrl+,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
