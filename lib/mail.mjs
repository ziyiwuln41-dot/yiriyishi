import { Resend } from "resend";
import { env } from "./env.mjs";
import { SITE } from "./server.mjs";
import { emailDocument } from "./render.mjs";

let resend;
function client() {
  if (!resend) {
    if (!env("RESEND_API_KEY")) throw new Error("Missing RESEND_API_KEY");
    resend = new Resend(env("RESEND_API_KEY"));
  }
  return resend;
}

export function unsubscribeUrl(token) {
  return `${SITE.url}/unsubscribe?t=${encodeURIComponent(token)}`;
}

// One-click unsubscribe headers: Gmail and Apple Mail show an "Unsubscribe" button.
function listHeaders(token) {
  return {
    "List-Unsubscribe": `<${SITE.url}/api/unsubscribe?t=${encodeURIComponent(token)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

export async function sendOne({ to, token, rendered }) {
  const { error } = await client().emails.send({
    from: SITE.from,
    replyTo: SITE.contact,
    to,
    subject: rendered.subject,
    html: emailDocument(rendered),
    text: rendered.text,
    headers: token ? listHeaders(token) : undefined,
  });
  if (error) throw new Error(error.message || "Resend error");
}

// Sends personalised emails (each has its own unsubscribe link) in batches of 100.
export async function sendMany(items) {
  const results = [];
  for (let i = 0; i < items.length; i += 100) {
    const chunk = items.slice(i, i + 100);
    const { data, error } = await client().batch.send(
      chunk.map(({ to, token, rendered }) => ({
        from: SITE.from,
        replyTo: SITE.contact,
        to,
        subject: rendered.subject,
        html: emailDocument(rendered),
        text: rendered.text,
        headers: listHeaders(token),
      }))
    );
    if (error) throw new Error(error.message || "Resend batch error");
    results.push(...chunk.map((c, k) => ({ ...c, id: data?.data?.[k]?.id })));
  }
  return results;
}
