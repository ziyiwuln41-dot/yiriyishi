"use client";
import { useEffect, useState } from "react";

// Shared by /confirm and /unsubscribe. The action runs on a button press,
// so email scanners that open links automatically can't trigger it.
export default function TokenAction({ endpoint, button, done, failed }) {
  const [token, setToken] = useState(null);
  const [state, setState] = useState("idle");

  useEffect(() => {
    setToken(new URLSearchParams(location.search).get("t"));
  }, []);

  async function go() {
    setState("busy");
    try {
      const res = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token }),
      });
      setState(res.ok ? "done" : "failed");
    } catch { setState("failed"); }
  }

  if (token === null) return <p>正在读取链接…</p>;
  if (!token) return <p>这个链接不完整。请回到邮件里重新点一次。</p>;
  if (state === "done") return <p>{done}</p>;
  return (
    <>
      <button className="btn" type="button" onClick={go} disabled={state === "busy"}>{state === "busy" ? "处理中…" : button}</button>
      {state === "failed" && <p className="msg err">{failed}</p>}
    </>
  );
}
