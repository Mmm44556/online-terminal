"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { useState } from "react";
interface ContextMenuContainerProps {
  children: React.ReactNode;
}

export function ContextMenuContainer({ children }: ContextMenuContainerProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  // const handleFileOperation = async (operation: () => Promise<void>) => {
  //   await operation();
  //   queryClient.invalidateQueries({ queryKey: ["files"] });
  // };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="h-full" asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64 [&]:!animate-none [&>div]:cursor-pointer [&>div]:hover:bg-gray-100 dark:[&>div]:hover:bg-gray-800">
          <ContextMenuItem
            inset
            onSelect={() => {
              // handleFileOperation(() => writeFile("/test.txt", "test"));
              setTitle("Create File");
              setOpen(true);
            }}
          >
            Create File
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onSelect={() => {
              // handleFileOperation(() => createDirectory("/new-folder"));
              setTitle("Create Folder");
              setOpen(true);
            }}
          >
            Create Folder
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onSelect={() => {
              // handleFileOperation(() => deleteFile("/test.txt"));
              setTitle("Delete File");
              setOpen(true);
            }}
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <CreateDialog
        onSubmit={() => {}}
        title={title}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
}

interface CreateDialogProps {
  onSubmit: (name: string) => void;
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}
function CreateDialog({ title, open, setOpen }: CreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
