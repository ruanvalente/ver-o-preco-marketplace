"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { updateListingStatusAction } from "../services/listing.actions"

type ListingDeleteDialogProps = {
  listingId: string
  listingTitle: string
}

/**
 * Confirmação de exclusão de anúncio.
 *
 * A ação é um Server Action comum; a confirmação destrutiva existe para evitar
 * exclusões acidentais e manter o foco preso ao diálogo enquanto aberto.
 */
export function ListingDeleteDialog({
  listingId,
  listingTitle,
}: ListingDeleteDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Excluir
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir anúncio?</DialogTitle>
          <DialogDescription>
            O anúncio “{listingTitle}” e suas imagens serão removidos
            definitivamente. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>

          <form action={updateListingStatusAction}>
            <input type="hidden" name="listingId" value={listingId} />
            <input type="hidden" name="intent" value="delete" />
            <Button type="submit" variant="destructive">
              Excluir anúncio
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
