"use client";

import { useActionState, useRef } from "react";
import { addNote, deleteApplication, updateStatus, type ActionState } from "@/app/admin/actions";
import { APPLICATION_STATUSES } from "@/lib/options";

function Message({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`mt-3 text-sm ${state.ok ? "text-success" : "text-danger"}`}>
      {state.message}
    </p>
  );
}

export function StatusForm({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateStatus, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <label htmlFor="durum" className="label text-muted">
        Başvuru durumu
      </label>
      <div className="mt-2 flex gap-3">
        <select id="durum" name="status" defaultValue={status} className="field-input !min-h-11 flex-1 !text-base">
          {APPLICATION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-line !min-h-11" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
      <Message state={state} />
    </form>
  );
}

export function NoteForm({ id }: { id: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const result = await addNote(prev, fd);
    if (result?.ok) ref.current?.reset();
    return result;
  }, null);
  return (
    <form ref={ref} action={action}>
      <input type="hidden" name="id" value={id} />
      <label htmlFor="not" className="label text-muted">
        Görüşme notu ekle
      </label>
      <textarea
        id="not"
        name="body"
        rows={4}
        maxLength={4000}
        required
        placeholder="Örn. Ön görüşme yapıldı; Kadıköy'de 120 m² dükkânı var, fizibilite gönderilecek."
        className="field-input mt-2 resize-y !text-base"
      />
      <button type="submit" className="btn-solid mt-4 w-full" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Notu kaydet"} <span aria-hidden="true">↗</span>
      </button>
      <Message state={state} />
    </form>
  );
}

export function DeleteForm({ id, refCode }: { id: string; refCode: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(deleteApplication, null);
  return (
    <form action={action} className="border border-danger/40 p-5">
      <input type="hidden" name="id" value={id} />
      <p className="font-medium text-ink">Başvuruyu kalıcı olarak sil</p>
      <p className="mt-2 text-sm text-muted">
        KVKK kapsamındaki silme talepleri için kullanın. Başvuru, notları ve geçmişiyle birlikte silinir; geri alınamaz.
      </p>
      <label htmlFor="sil-onay" className="label mt-4 block text-muted">
        Onaylamak için {refCode} yazın
      </label>
      <input id="sil-onay" name="confirm" autoComplete="off" className="field-input mt-1 !min-h-11 !text-base tabular" />
      <button type="submit" className="mt-4 w-full border border-danger px-4 py-3 text-sm font-medium text-danger hover:bg-danger hover:text-white" disabled={pending}>
        {pending ? "Siliniyor…" : `${refCode} numaralı başvuruyu sil`}
      </button>
      <Message state={state} />
    </form>
  );
}
