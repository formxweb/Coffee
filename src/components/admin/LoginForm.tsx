"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn, type ActionState } from "@/app/admin/actions";

export function LoginForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState<ActionState, FormData>(signIn, null);
  return (
    <form action={action} className="grid gap-8">
      <input type="hidden" name="next" value={params.get("sonra") ?? ""} />
      <div>
        <label htmlFor="email" className="label text-muted">
          E-posta
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field-input mt-2" />
      </div>
      <div>
        <label htmlFor="password" className="label text-muted">
          Şifre
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field-input mt-2" />
      </div>
      {state && !state.ok && (
        <p role="alert" className="border border-danger/50 px-4 py-3 text-danger">
          {state.message}
        </p>
      )}
      <button type="submit" className="btn-solid w-full" disabled={pending}>
        {pending ? "Giriş yapılıyor…" : "Giriş yap"} <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
