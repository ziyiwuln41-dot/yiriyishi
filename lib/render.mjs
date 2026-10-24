// One renderer for both the 6am email and the archive page,
// so an archived day looks exactly like the email that went out.
import { C, FONT, esc, inline, paras, plain, usePalette } from "./markup.mjs";

const WEEKDAY = ["日", "一", "二", "三", "四", "五", "六"];
const md = (iso) => { const [, m, d] = iso.split("-").map(Number); return `${m}月${d}日`; };

function dateLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日 · 星期${WEEKDAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}`;
}

const sealBox = () => `<span style="display:inline-block;border:2px solid ${C.seal};color:${C.seal};border-radius:3px;padding:3px 6px;font-size:12px;font-weight:bold;letter-spacing:1px;line-height:1">z.y.</span>`;

function sectionTitle(num, label) {
  return `<p style="margin:34px 0 14px;font-size:13px;letter-spacing:3px;color:${C.bamboo}">${num} · ${esc(label)}</p>`;
}

function rule() {
  return `<div style="height:1px;background:${C.line};margin:30px 0 0;line-height:1px;font-size:1px">&nbsp;</div>`;
}

function shell({ inner, siteUrl, unsubscribeUrl, mode, preheader = "" }) {
  const footerLinks =
    mode === "email"
      ? `<a href="${esc(unsubscribeUrl)}" style="color:${C.muted}">退订</a> · <a href="${esc(siteUrl)}/#archive" style="color:${C.muted}">往期回顾</a> · <a href="${esc(siteUrl)}/about" style="color:${C.muted}">关于一日一诗</a>`
      : `<a href="${esc(siteUrl)}/" style="color:${C.muted}">订阅一日一诗</a> · <a href="${esc(siteUrl)}/#archive" style="color:${C.muted}">往期回顾</a>`;
  const pre = preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(preheader)}</div>` : "";
  return `${pre}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page}">
<tr><td class="yy-outer" align="center" style="padding:24px 12px">
<table class="yy-card" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${C.paper};border:1px solid ${C.line};border-radius:6px">
<tr><td class="yy-inner" style="padding:34px 30px 30px;font-family:${FONT};font-size:17px;line-height:1.85;color:${C.ink}">
${inner}
${rule()}
<p style="margin:18px 0 0;font-size:13px;color:${C.muted};text-align:center">${footerLinks}</p>
</td></tr></table>
</td></tr></table>`;
}

function header(kicker, title) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${FONT}">
<p style="margin:0;font-size:13px;letter-spacing:2px;color:${C.muted}">${esc(kicker)}</p>
<p style="margin:4px 0 0;font-size:26px;line-height:1.3;color:${C.ink};font-weight:bold">${esc(title)}</p>
</td>
<td align="right" valign="top" style="width:60px">${sealBox()}</td>
</tr></table>`;
}

function poemBlock(poem, siteUrl) {
  // One sentence per line, one blank gap per stanza, so phrases never break mid-way on phones.
  const horizontal = poem.lines
    .map((stanza) => {
      const sentences = stanza.match(/[^。！？；]+[。！？；]?[」』”]*/g) || [stanza];
      return `<p style="margin:0 0 14px;font-size:18px;line-height:1.95">${sentences.map((x) => inline(x.trim())).join("<br>")}</p>`;
    })
    .join("");
  // A related painting (poem.art) with its caption; older issues kept the calligraphy image (poem.image).
  let image = "";
  if (poem.art) {
    const src = /^https?:/.test(poem.art.src) ? poem.art.src : siteUrl + poem.art.src;
    image = `<div style="margin:0 0 18px;text-align:center"><img src="${esc(src)}" width="540" alt="${esc(poem.art.alt || poem.art.title)}" style="display:block;margin:0 auto;width:100%;max-width:540px;height:auto;border-radius:4px">
<p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:${C.muted};text-align:center">${inline(poem.art.title)}${poem.art.credit ? `<br><span style="font-size:11px">${esc(poem.art.credit)}</span>` : ""}</p></div>`;
  } else if (poem.image) {
    image = `<p style="margin:0 0 18px;text-align:center"><img src="${esc(siteUrl + poem.image)}" width="520" alt="${esc(poem.lines.map(plain).join(" "))}" style="display:block;margin:0 auto;width:100%;max-width:520px;height:auto;border-radius:4px"></p>`;
  }
  return `${image}
<div style="background:${C.soft};border-radius:4px;padding:18px 20px;margin:0 0 20px">${horizontal}</div>`;
}

export function renderIssue(issue, { siteUrl = "", unsubscribeUrl = "#", mode = "email" } = {}) {
  usePalette(issue.palette);
  const { chengyu: cy, poem, appreciation: ap } = issue;

  const chengyu = `${sectionTitle("一", "今日成语")}
<p style="margin:0 0 4px;font-size:30px;letter-spacing:6px;line-height:1.5">${inline(`{${cy.word}|${cy.pinyin}}`)}</p>
${paras(`**释义：**${cy.meaning}`)}
<p style="margin:0 0 6px"><strong>用法：</strong></p>
${cy.examples.map((e) => `<p style="margin:0 0 8px;padding-left:14px;border-left:2px solid ${C.bamboo}">${inline(e)}</p>`).join("")}
${cy.note ? paras(`**用法提醒：**${cy.note}`, "margin-top:14px") : ""}
${paras(`**出处：**${cy.origin}`)}`;

  const notes = poem.notes
    .map((n) => `<p style="margin:0 0 8px">· <strong>${inline(n.term)}</strong>：${inline(n.gloss)}</p>`)
    .join("");

  const poemSec = `${sectionTitle("二", "今日诗")}
<p style="margin:0 0 14px;font-size:21px;font-weight:bold">${esc(poem.title)}<span style="font-size:14px;font-weight:normal;color:${C.muted}">　${esc(poem.source)}</span></p>
${poemBlock(poem, siteUrl)}
${paras(`**这首诗在说什么：**${poem.summary}`)}
<p style="margin:0 0 8px"><strong>难字难句：</strong></p>
${notes}
${poem.technique ? paras(`**手法亮点：**${poem.technique}`, "margin-top:14px") : ""}
<p style="margin:22px 0 8px;font-weight:bold;color:${C.bamboo}">历史连接 · ${esc(poem.history.title)}</p>
${paras(poem.history.body)}`;

  const apSec = `${sectionTitle("三", "今日品味 · " + ap.type)}
<p style="margin:0 0 10px;font-weight:bold">${esc(ap.title)}</p>
${paras(ap.body)}`;

  const inner = `${header(dateLabel(issue.date), "一日一诗 — " + issue.theme)}
<div style="margin-top:22px">${paras(issue.greeting, "font-size:18px")}</div>
${chengyu}${poemSec}${apSec}
${issue.signoff ? paras(issue.signoff, "margin-top:28px") : ""}`;

  return {
    page: C.page,
    subject: `一日一诗 · ${md(issue.date)}｜${poem.title.replace(/（.*?）/, "")} · ${cy.word}`,
    body: shell({ inner, siteUrl, unsubscribeUrl, mode, preheader: `今日成语「${cy.word}」，今日诗《${poem.title.replace(/（.*?）/, "")}》。` }),
    text: [
      plain(issue.greeting),
      `今日成语：${cy.word}（${cy.pinyin}）`,
      `今日诗：${poem.title}`,
      `${siteUrl}/archive/${issue.date}`,
      `退订：${unsubscribeUrl}`,
    ].join("\n\n"),
  };
}

export function renderWeek(week, { siteUrl = "", unsubscribeUrl = "#", mode = "email" } = {}) {
  usePalette(week.palette);
  const list = (week.preview || [])
    .map((d) => `<p style="margin:0 0 6px">· ${inline(d)}</p>`)
    .join("");
  const inner = `${header("本周导读 · " + week.week_start, week.era + " · " + week.theme)}
<div style="margin-top:22px">${paras(week.intro)}</div>
${list ? sectionTitle("本期", "要读的诗") + list : ""}`;
  return {
    page: C.page,
    subject: `一日一诗 · 本周导读｜${week.theme}`,
    body: shell({ inner, siteUrl, unsubscribeUrl, mode, preheader: `${week.era} · ${week.theme}：接下来要读的诗。` }),
    text: `${week.era} · ${week.theme}\n\n${plain(week.intro)}\n\n退订：${unsubscribeUrl}`,
  };
}

// Full HTML document for sending. Apple Mail and iOS load the web font;
// Gmail falls back to the system 楷体/宋体 in the FONT stack.
export function emailDocument({ subject, body, page }) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>${esc(subject)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css">
</head><body style="margin:0;padding:0;background:${page || C.page}">${body}</body></html>`;
}
