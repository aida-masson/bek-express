# Уведомления: что нажимать

Три независимые вещи. Можно делать по одной, в любом порядке.
Ничего из этого не сломает сайт: заявки и сейчас приходят в таблицу.

---

## А. Утренняя сводка из Метрики в Telegram — 5 минут

Всё уже написано и лежит в репозитории. Осталось положить в GitHub четыре
значения, чтобы он знал, куда и от чьего имени слать.

### 1. Бот

Если бота ещё нет: Telegram → поиск **@BotFather** → Start → отправить `/newbot`
→ имя → логин, заканчивающийся на `bot`. В ответ придёт токен вида
`8123456789:AAH...`

### 2. Куда слать

Написать своему боту любое слово. Затем открыть в браузере:

```
https://api.telegram.org/bot<СЮДА_ТОКЕН>/getUpdates
```

Найти в ответе `"chat":{"id":123456789` — это число и есть адрес чата.
Если хотите в общий чат, сначала добавьте туда бота; у групп число отрицательное,
минус тоже нужен.

### 3. Токен Метрики

1. [oauth.yandex.ru](https://oauth.yandex.ru) → «Создать приложение»
2. Платформа — «Веб-сервисы», Redirect URI — `https://oauth.yandex.ru/verification_code`
3. Доступ — «Яндекс Метрика: получение статистики» (`metrika:read`)
4. Сохранить, скопировать **ClientID**, открыть:
   `https://oauth.yandex.ru/authorize?response_type=token&client_id=ВАШ_CLIENT_ID`
5. Разрешить — в адресной строке появится `access_token=...`

### 4. Сложить всё в GitHub

Открыть: **https://github.com/aida-masson/bek-express/settings/secrets/actions**

Кнопка **New repository secret**, поле Name, поле Secret, кнопка Add secret.
Повторить четыре раза:

| Name | Secret |
|---|---|
| `TG_TOKEN` | токен бота |
| `TG_CHAT` | число из шага 2 |
| `YM_TOKEN` | токен из шага 3 |
| `YM_COUNTER` | `112550678` |

### 5. Проверить

**https://github.com/aida-masson/bek-express/actions** → слева «Утренняя сводка
Метрики в Telegram» → справа кнопка **Run workflow** → зелёная **Run workflow**.
Через полминуты сообщение придёт в чат. Дальше приходит само, каждый день в 9:00.

---

## Б. Заявка падает в Telegram сразу — 10 минут

Делается в таблице, которая уже принимает заявки. Новую создавать не нужно.

### Что нажимать

1. Открыть таблицу **«Заявки BEK Express»** → меню **Расширения → Apps Script**.
2. В редакторе выделить весь код (Ctrl+A) и удалить.
3. Вставить код из блока ниже.
4. В первых двух строках вписать токен бота и число чата — между кавычками.
5. Нажать **Сохранить** (значок дискеты).
6. Вверху выбрать функцию **setup** и нажать **Выполнить**. Google спросит
   разрешение — «Разрешить». Придёт тестовое сообщение в Telegram, а в таблице
   появится колонка «Расчёт».
7. **Развернуть → Управление развёртываниями** → карандаш → **Версия: Создать
   новую** → **Развернуть**. Без этого шага сайт продолжит работать со старым кодом.

Адрес, по которому сайт отправляет заявки, не меняется — на сайте править нечего.

### Код

```javascript
var TG_TOKEN = '';   // токен бота
var TG_CHAT  = '';   // число чата

/* Разовая настройка: добавляет колонку «Расчёт» и проверяет Telegram */
function setup() {
  var sh = SpreadsheetApp.getActive().getSheets()[0];
  var head = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
  if (head.indexOf('Расчёт') === -1) {
    var after = head.indexOf('Откуда груз');
    var col = (after === -1 ? head.length : after + 1) + 1;
    sh.insertColumnBefore(col);
    sh.getRange(1, col).setValue('Расчёт');
  }
  sendTelegram('✅ Уведомления о заявках включены');
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  var sh = SpreadsheetApp.getActive().getSheets()[0];
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

  // сайт шлёт в from город, а следом расчёт — город берём до разделителя
  var city = String(p.from || '').split(' · ')[0];
  var row = {
    'Дата': Utilities.formatDate(new Date(), 'Asia/Dushanbe', 'dd.MM.yyyy HH:mm'),
    'Телефон': "'" + (p.phone || ''),
    'Откуда груз': city,
    'Расчёт': p.note || '',
    'Язык': p.lang === 'tj' ? 'таджикский' : 'русский',
    'Страница': p.page || '',
    'Статус': 'Новая'
  };
  sh.appendRow(head.map(function (name) { return row[name] !== undefined ? row[name] : ''; }));

  sendTelegram([
    '🆕 Заявка с сайта',
    'Телефон: ' + (p.phone || '—'),
    city ? 'Откуда груз: ' + city : '',
    p.note || '',
    p.page ? 'Страница: ' + p.page : '',
    p.lang === 'tj' ? 'Язык: таджикский' : ''
  ].filter(String).join('\n'));

  return ContentService.createTextOutput('ok');
}

function sendTelegram(text) {
  if (!TG_TOKEN || !TG_CHAT) return;
  try {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
      method: 'post',
      payload: { chat_id: TG_CHAT, text: text },
      muteHttpExceptions: true
    });
  } catch (err) { /* сбой уведомления не должен ломать запись в таблицу */ }
}

function doGet() {
  return ContentService.createTextOutput('BEK Express — приём заявок');
}
```

Код сам раскладывает значения по колонкам с нужными названиями, поэтому порядок
столбцов в таблице можно менять как удобно — ничего не съедет.

---

## В. Доступ к таблице — 1 минута

Открыть [таблицу](https://docs.google.com/spreadsheets/d/1INr-hzXrkBicKWcTSBRhnbD_48RZ1IUoV9XSgh_T13w/edit)
→ кнопка **Поделиться** справа вверху → вписать адрес → выбрать роль:

* `info@bek-express.com` — **Редактор**
* `ibrohimbek.hotamov@bek-express.com` — **Читатель**

Передать владение на аккаунт другой организации Google не даёт — это его
ограничение, обойти нельзя. Если владение нужно именно на info@, таблицу
придётся создать заново уже под этим аккаунтом; тогда напишите, я подготовлю
всё под новую.
