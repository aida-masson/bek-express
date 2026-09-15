# bek-express.com

Статический сайт BEK Express. Ничего собирать не надо — это готовые файлы.

## Как выложить

1. Открыть github.com/aida-masson/bek-express
2. Удалить старое содержимое репозитория (или залить поверх)
3. Перетащить в окно браузера ВСЁ содержимое этой папки — не саму папку, а файлы и папки внутри неё (папки fonts/ и img/ обязательно, без них сайт останется без шрифтов и картинок)
4. Commit changes
5. Settings → Pages → Source: Deploy from branch → main → / (root)
6. Подождать 1–2 минуты

Домен bek-express.com уже прописан в файле CNAME — трогать не нужно.

## Что внутри

| Файл | Адрес |
|---|---|
| index.html | bek-express.com |
| how/ | /how — первый груз, услуги, что нельзя везти, частые вопросы |
| warehouses/guangzhou/ | /warehouses/guangzhou |
| warehouses/urumqi/ | /warehouses/urumqi |
| warehouses/yiwu/ | /warehouses/yiwu |
| warehouses/keqiao/ | /warehouses/keqiao |
| warehouses/khorgos/ | /warehouses/khorgos |
| warehouses/foshan/ | /warehouses/foshan |
| warehouses/uzbekistan/ | /warehouses/uzbekistan |
| fonts/, fonts.css | шрифты сайта — один файл на все страницы |
| img/ | картинки и логотипы |
| og.jpg | картинка-превью для WhatsApp и Telegram |
| favicon.png | иконка вкладки |
| sitemap.xml, robots.txt | для Гугла |

## После заливки проверить

- Открыть bek-express.com с телефона
- Кинуть ссылку себе в WhatsApp — должна появиться картинка-превью
- Оставить номер в форме на главной и убедиться, что заявка пришла в таблицу
- Нажать «Скопировать всё» на странице склада

## Заявки

Форма отправляет данные в Google Таблицу через Apps Script.
Адрес скрипта лежит в index.html, переменная CALLBACK_URL.
