"use client";
import { useState } from "react";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({ busy: false, msg: "", err: false });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, msg: "", err: false });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: e.target.website.value }),
      });
      const data = await res.json();
      setState({ busy: false, msg: data.message, err: !data.ok });
      if (data.ok) setEmail("");
    } catch {
      setState({ busy: false, msg: "网络好像断了，请稍后再试。", err: true });
    }
  }

  return (
    <>
      <form className="sub" onSubmit={submit}>
        <label htmlFor="email" className="hp">邮箱</label>
        <input id="email" type="email" required placeholder="你的邮箱" value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <div className="hp" aria-hidden="true">
          <label htmlFor="website">网站</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <button className="btn" type="submit" disabled={state.busy}>{state.busy ? "寄送中…" : "订阅"}</button>
      </form>
      {state.msg && <p className={"msg" + (state.err ? " err" : "")} role="status">{state.msg}</p>}
    </>
  );
}
