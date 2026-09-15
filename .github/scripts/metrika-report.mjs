/* Утренняя сводка из Яндекс.Метрики в Telegram.
   Запускается по расписанию из .github/workflows/metrika-daily.yml
   Нужны секреты репозитория: YM_COUNTER, YM_TOKEN, TG_TOKEN, TG_CHAT */

const { YM_COUNTER, YM_TOKEN, TG_TOKEN, TG_CHAT } = process.env;
for (const [k, v] of Object.entries({ YM_COUNTER, YM_TOKEN, TG_TOKEN, TG_CHAT })) {
  if (!v) { console.error('Не задан секрет ' + k); process.exit(1); }
}

const YM = 'https://api-metrika.yandex.net';
const auth = { headers: { Authorization: 'OAuth ' + YM_TOKEN } };

async function ym(url) {
  const r = await fetch(url, auth);
  if (!r.ok) throw new Error(url.split('?')[0] + ' → ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return r.json();
}

const n = (x) => Number(x || 0).toLocaleString('ru-RU');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const stat = (params) =>
  ym(`${YM}/stat/v1/data?` + new URLSearchParams({ ids: YM_COUNTER, date1: 'yesterday', date2: 'yesterday', ...params }));

const main = async () => {
  // цели заводятся в интерфейсе Метрики, их числовые id берём оттуда же
  const goals = (await ym(`${YM}/management/v1/counter/${YM_COUNTER}/goals`)).goals || [];

  const base = await stat({ metrics: 'ym:s:visits,ym:s:users,ym:s:pageviews,ym:s:bounceRate' });
  const [visits, users, views, bounce] = base.totals;

  const sources = await stat({
    metrics: 'ym:s:visits',
    dimensions: 'ym:s:lastsignTrafficSource',
    sort: '-ym:s:visits',
    limit: '5',
  });

  let conv = [];
  if (goals.length) {
    const metrics = goals.map((g) => `ym:s:goal${g.id}reaches`).join(',');
    const r = await stat({ metrics });
    conv = goals.map((g, i) => ({ name: g.name, hits: r.totals[i] })).filter((g) => g.hits > 0);
  }

  const d = new Date(Date.now() - 864e5).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  let text = `<b>BEK Express — за ${d}</b>\n\n` +
    `Визитов: <b>${n(visits)}</b>\n` +
    `Посетителей: <b>${n(users)}</b>\n` +
    `Просмотров страниц: <b>${n(views)}</b>\n` +
    `Отказы: <b>${Number(bounce || 0).toFixed(0)}%</b>\n`;

  if (visits > 0 && sources.data.length) {
    text += `\n<b>Откуда пришли</b>\n` +
      sources.data.map((r) => `• ${esc(r.dimensions[0].name)} — ${n(r.metrics[0])}`).join('\n') + '\n';
  }

  text += conv.length
    ? `\n<b>Действия на сайте</b>\n` + conv.map((g) => `• ${esc(g.name)} — ${n(g.hits)}`).join('\n')
    : `\n<i>Заявок и обращений за день не было.</i>`;

  const tg = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  if (!tg.ok) throw new Error('Telegram → ' + tg.status + ' ' + (await tg.text()).slice(0, 200));
  console.log('Сводка отправлена');
};

main().catch((e) => { console.error(e.message); process.exit(1); });
