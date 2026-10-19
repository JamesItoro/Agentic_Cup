"use client";
import { Download, RefreshCw, Replace, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function DocumentActions({ title, isAdmin }: { title: string; isAdmin: boolean }) {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            tone: "info",
            title: "Download (simulated)",
            description: "Secure signed-URL downloads are wired to Supabase Storage in a later stage.",
          })
        }
      >
        <Download className="size-4" /> Download
      </Button>

      {isAdmin ? (
        <>
          <Button
            variant="outline"
            onClick={() => toast({ tone: "info", title: "Re-index queued (simulated)", description: "Indexing runs in the AI stage." })}
          >
            <RefreshCw className="size-4" /> Re-index
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ tone: "info", title: "Replace (simulated)", description: "Version replacement is wired up with Storage later." })}
          >
            <Replace className="size-4" /> Replace
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="danger">
                <Trash2 className="size-4" /> Remove
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove this document?</DialogTitle>
                <DialogDescription>
                  &ldquo;{title}&rdquo; will be removed from the knowledge hub. This action is logged to the
                  audit trail. (Simulated in this review build.)
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="danger"
                    onClick={() => toast({ tone: "success", title: "Document removed (simulated)", description: title })}
                  >
                    Remove document
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  );
}
