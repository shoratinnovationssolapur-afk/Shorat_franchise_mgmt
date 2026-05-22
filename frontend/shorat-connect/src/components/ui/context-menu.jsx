import React, { useState } from "react"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "./path-to-your-context-menu"

export function DemoContextMenu() {
  const [checked, setChecked] = useState(false)
  const [radioValue, setRadioValue] = useState("one")

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="inline-block rounded border p-4 cursor-context-menu">
          Right click here
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuLabel>Options</ContextMenuLabel>

        <ContextMenuItem onSelect={() => alert("New File clicked")}>
          New File
          <ContextMenuShortcut>⌘N</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onSelect={() => alert("Save clicked")}>
          Save
          <ContextMenuShortcut>⌘S</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuCheckboxItem
          checked={checked}
          onCheckedChange={setChecked}
        >
          Show Hidden Files
        </ContextMenuCheckboxItem>

        <ContextMenuSeparator />

        <ContextMenuRadioGroup value={radioValue} onValueChange={setRadioValue}>
          <ContextMenuLabel inset>View Mode</ContextMenuLabel>
          <ContextMenuRadioItem value="one">List View</ContextMenuRadioItem>
          <ContextMenuRadioItem value="two">Grid View</ContextMenuRadioItem>
          <ContextMenuRadioItem value="three">Compact View</ContextMenuRadioItem>
        </ContextMenuRadioGroup>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger inset>
            More Options
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onSelect={() => alert("Settings clicked")}>
              Settings
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => alert("Help clicked")}>
              Help
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}
