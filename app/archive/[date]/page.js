import { notFound } from "next/navigation";
import { getIssue, SITE } from "../../../lib/server.mjs";
import { renderIssue } from "../../../lib/render.mjs";
import { paletteCss } from "../../../lib/palettes.mjs";

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { date } = await params;
  return { title: `${date} · 一日一诗` };
}

// Shows a past issue exactly as the email looked: same renderer, same fonts.
export default async function ArchiveDay({ params }) {
  const { date } = await params;
  const issue = await getIssue(date).catch(() => null);
  if (!issue) notFound();
  const { body } = renderIssue(issue, { siteUrl: SITE.url, mode: "web" });
  return (
    <main className="wrap" style={{ paddingTop: 24 }}>
      <style dangerouslySetInnerHTML={{ __html: paletteCss(issue.palette) }} />
      <p className="back"><a href="/#archive">← 回到往期回顾</a></p>
      <div className="issue-frame" dangerouslySetInnerHTML={{ __html: body }} />
    </main>
  );
}
