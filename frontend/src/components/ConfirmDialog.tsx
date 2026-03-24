import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

/** Oat dialog pattern: native `<dialog>` + `<form method="dialog">` (see https://oat.ink/components/dialog/). */
export type ConfirmDialogHandle = {
  showModal: () => void;
  close: () => void;
};

export type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
};

export const ConfirmDialog = forwardRef<ConfirmDialogHandle, ConfirmDialogProps>(function ConfirmDialog(
  { title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger, onConfirm },
  forwardedRef
) {
  const dlgRef = useRef<HTMLDialogElement>(null);
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  useImperativeHandle(forwardedRef, () => ({
    showModal: () => dlgRef.current?.showModal(),
    close: () => dlgRef.current?.close(),
  }));

  const handleClose = useCallback(() => {
    const el = dlgRef.current;
    if (!el) return;
    const confirmed = el.returnValue === "confirm";
    el.returnValue = "";
    if (confirmed) void Promise.resolve(onConfirmRef.current());
  }, []);

  const handleCancel = useCallback(() => {
    const el = dlgRef.current;
    if (!el) return;
    el.returnValue = "";
    el.close();
  }, []);

  return (
    <dialog
      ref={dlgRef}
      className="pd-confirm-dialog"
      onClose={handleClose}
      closedby="any"
    >
      <form method="dialog">
        <header>
          <h3>{title}</h3>
          <p className="text-light" style={{ marginBlockEnd: 0 }}>
            {message}
          </p>
        </header>
        <footer className="hstack gap-2" style={{ marginBlockStart: "var(--space-4)", flexWrap: "wrap" }}>
          <button type="button" className="outline" onClick={handleCancel}>
            {cancelLabel}
          </button>
          <button type="submit" value="confirm" {...(danger ? { "data-variant": "danger" as const } : {})}>
            {confirmLabel}
          </button>
        </footer>
      </form>
    </dialog>
  );
});
