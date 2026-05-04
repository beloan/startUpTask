# ✅ Полная проверка всех 5 пунктов ТЗ

Документ содержит подробную проверку реализации всех пунктов расширенного ТЗ.

---

## 📌 ПУНКТ 1: Иерархическое дерево категорий с аккордеоном

### ✅ Статус: ГОТОВО

**Что реализовано:**
- ✅ Иерархическое дерево категорий на главной странице
- ✅ Аккордеон - раскрыт/скрыт подкатегории при клике
- ✅ Ограничение визуального объёма: показать первые 5 категорий
- ✅ Кнопка "Показать ещё" с числом скрытых категорий
- ✅ Кнопка "Свернуть" для возврата

**Где реализовано:**
- `src/widgets/categories/index.tsx`
  - Добавлен `state`: `showAllCategories`
  - Функция `renderCategoryTree()` ограничивает вывод на уровне 0
  - Кнопки управления видимостью категорий

**Как проверить:**
```
1. Перейти на http://localhost:3001
2. Скроллить вниз к разделу "Все категории и подкатегории"
3. Должны быть видны первые 5 категорий
4. Нажать кнопку "Показать ещё (N скрыто)"
5. Все остальные категории раскрываются
6. Нажать "Свернуть" - вернуться к исходному состоянию
7. Кликнуть на категорию - показать/скрыть подкатегории
```

**DevTools проверка:**
```javascript
// Проверить состояние компонента
const showMoreBtn = document.querySelector('button:has-text("Показать ещё")');
console.log('Show more button visible:', !!showMoreBtn);
```

---

## 📌 ПУНКТ 2: Убрать город в выдаче, адрес в cookie

### ✅ Статус: ГОТОВО

**Что реализовано:**
- ✅ Город НЕ показывается в карточках товаров
- ✅ Адрес пользователя сохраняется в cookie `bystroi_address` (30 дней)
- ✅ Геоданные хранятся в sessionStorage `detected_city` (lat, lon)
- ✅ Сервер и клиент используют geo без визуального шума

**Где реализовано:**
- `src/entities/product/ui/product-card.tsx` - НЕТ города в карточке
- `src/shared/lib/city-utils.ts` - функции для работы с cookies и geo:
  - `setAddressCookie(address)` - сохранить адрес
  - `getAddressCookie()` - получить адрес
  - `getDetectedCityCoords()` - получить координаты
  - `getLocationParams()` - приоритет: URL → cookie → sessionStorage

**Как проверить:**
```
1. Перейти на /products
2. Открыть DevTools → Application → Cookies
3. Найти cookie "bystroi_address" с адресом
4. Открыть DevTools → Application → Session Storage
5. Найти "detected_city" с lat/lon
6. Посмотреть на карточку товара - города НЕТ
7. Изменить радиус фильтра - URL содержит lat/lon
```

**DevTools проверка:**
```javascript
// Получить адрес из cookie
const address = document.cookie
  .split('; ')
  .find(c => c.startsWith('bystroi_address'))
  ?.split('=')[1];
console.log('Address from cookie:', decodeURIComponent(address));

// Получить координаты из sessionStorage
const detected = JSON.parse(sessionStorage.getItem('detected_city'));
console.log('Geo coords:', detected); // { lat: ..., lon: ..., city_name: ... }
```

---

## 📌 ПУНКТ 3: Фиксированный блок в хедере (телефон + часы + чат)

### ✅ Статус: ГОТОВО

**Что реализовано:**
- ✅ Фиксированный header с `position: fixed`
- ✅ Телефон: `+7 937 779-99-06` (кликабельный tel:)
- ✅ Email: `newgis@yandex.ru` (кликабельный mailto:)
- ✅ Рабочие часы: "пн-пт 09:00-21:00, сб-вс 10:00-20:00" (скрыто на мобильных)
- ✅ Ссылка в чат (Telegram) с иконкой
- ✅ На мобильных tel: и mailto: открывают приложения

**Где реализовано:**
- `src/widgets/header/index.tsx`
  - Импорт иконок: `Clock`, `MessageCircle`
  - Переменные: `supportPhone`, `supportPhoneLabel`, `workingHours`, `chatUrl`
  - Элементы: Email link, Phone link (tel:), Chat link, Working hours (hidden on mobile)

**Как проверить:**
```
1. Открыть http://localhost:3001
2. Проверить вверху страницы в header:
   - Email ссылка (кликабельно)
   - Позвонить ссылка (tel: +7 937 779-99-06)
   - Чат ссылка (MessageCircle иконка)
   - Рабочие часы (на desktop, скрыто на мобильных)
3. Скроллить вниз - header остается на месте (fixed)
4. На мобильном (375px): tel: и mailto: будут открывать приложения
5. Кликнуть на "Позвонить" - открыть диалер телефона
```

**DevTools проверка:**
```javascript
// Проверить header фиксированность
const header = document.querySelector('header');
const style = window.getComputedStyle(header);
console.log('Header position:', style.position); // should be 'fixed'
console.log('Header top:', style.top); // should be '0'

// Проверить ссылки
const phoneLink = document.querySelector('a[href^="tel:"]');
const chatLink = document.querySelector('a[href*="telegram"]');
console.log('Phone link:', phoneLink?.href);
console.log('Chat link:', chatLink?.href);
```

---

## 📌 ПУНКТ 4: SMS авторизация (OTP)

### ✅ Статус: ГОТОВО

**Что реализовано:**
- ✅ Модальное окно "Вход по номеру телефона"
- ✅ OTP код отправляется (в dev: выводится в console)
- ✅ TTL кода: 5 минут (300 секунд)
- ✅ Таймер повторной отправки: 60 секунд
- ✅ Проверка совпадения номера и кода
- ✅ Согласие с условиями использования (чекбокс + ссылка)
- ✅ Проверка защиты: удаление кода при истечении
- ✅ На мобильных: drawer открывается снизу

**Где реализовано:**
- `src/feature/auth/phone-auth-sheet.tsx` - UI компонент
- `src/entities/user/model/auth-store.ts` - логика (requestBuyerSmsCode, verifyBuyerSmsCode)

**Как проверить:**
```
1. Кликнуть "Вход в систему" в header
2. Введить номер телефона (автоформатирование)
3. Кликнуть "Получить код"
4. Открыть DevTools → Console
5. Найти лог: "[SMS Code - Development Only]: XXXXXX"
6. Скопировать 6-значный код
7. Вставить в поле "Введите код из SMS"
8. Кликнуть "Войти" или автоматический вход при 6-м символе
9. Должна появиться оповещение: "Вы успешно вошли"
10. Модальное окно закроется
```

**DevTools проверка:**
```javascript
// Проверить SMS код (dev только)
const smsData = JSON.parse(sessionStorage.getItem('sms_verification'));
console.log('SMS Code:', smsData?.code);
console.log('Expires in:', Math.round((smsData?.expiresAt - Date.now()) / 1000), 'seconds');

// Проверить авторизованного пользователя
const auth = JSON.parse(localStorage.getItem('auth-store'));
console.log('Current user:', auth?.state?.user);
```

**Таймер обратного отсчета:**
```javascript
// Проверить таймер повторной отправки
const auth = JSON.parse(localStorage.getItem('auth-store'));
const elapsed = Math.floor((Date.now() - auth?.state?.smsCodeSentAt) / 1000);
console.log('Seconds since SMS sent:', elapsed);
console.log('Can resend in:', Math.max(0, 60 - elapsed), 'seconds');
```

---

## 📌 ПУНКТ 5: OTP Безопасность + Метрики в товар

### ✅ Статус: ГОТОВО

### Часть A: Безопасность OTP

**Что реализовано:**
- ✅ TTL кода: 5 минут (5 * 60 * 1000 ms в sessionStorage)
- ✅ Проверка истечения: если `Date.now() > expiresAt` → ошибка "SMS код истёк"
- ✅ Таймер повторной отправки: 60 секунд (блокировка повторной отправки)
- ✅ Проверка совпадения номера и кода
- ✅ Очистка кода из sessionStorage после верификации

**Где реализовано:**
- `src/entities/user/model/auth-store.ts` (строки 140-180):
  - `requestBuyerSmsCode()`: генерирует код с TTL 5 мин, сохраняет smsCodeSentAt
  - `verifyBuyerSmsCode()`: проверяет TTL, номер, код, удаляет после успеха

**Как проверить:**
```
1. Получить SMS код (время: T)
2. Подождать ~5 минут (или проверить в console)
3. Попытаться ввести код - должна ошибка: "SMS код истёк"
4. Код удалится из sessionStorage
5. Нажать "Отправить заново" - должна блокировка на 60 сек
6. После 60 сек кнопка станет активной
```

### Часть B: Метрики в товар

**Что реализовано:**
- ✅ "Всего заказали": `X прод.` (из `total_sold` / `sales_count`)
- ✅ "Всего просмотров": `X просмотров` (из `view_count`)
- ✅ "В наличии": `в наличии X` (из `current_amount`)
- ✅ "Цена выросла/упала": стрелка ⬆️ (красный) / ⬇️ (зеленый) + процент
- ✅ "Рейтинг": ⭐ (из `avg_rating`)

**Где реализовано:**
- `src/entities/product/ui/product-card.tsx` (строки 150-320)
  - Вычисление метрик: `metricSales`, `metricViews`, `metricCurrentAmount`, `metricRating`
  - Рендер метрик: `displayTotalSold`, `displayViews`, `displayCurrentAmount`, `displayRating`
  - Стрелки и % для цены: `ArrowUpRight` / `ArrowDownRight`

**Как проверить:**
```
1. Перейти на /products или главную
2. Найти карточку товара
3. Проверить наличие:
   - "5 прод." ✅
   - "1000 просмотров" ✅
   - "в наличии 50" ✅
   - ⬆️ 15% (красный цвет) или ⬇️ -10% (зеленый) ✅
   - ⭐ 4.5 ✅
4. Разные товары имеют разные значения ✅
5. Город НЕ показывается ✅
```

**DevTools проверка:**
```javascript
// Получить все метрики с первой карточки
const card = document.querySelector('[class*="group"][class*="relative"]');
const text = card?.innerText;
console.log('Card content:', text);

// Проверить наличие метрик
const hasMetrics = {
  sales: /\d+ прод\./.test(text),
  views: /\d+ просмотров/.test(text),
  available: /в наличии \d+/.test(text),
  rating: /⭐ [\d.]+/.test(text),
  price: /₽/.test(text),
};
console.table(hasMetrics);

// Проверить отсутствие города
const hasCity = /москва|петербург|регион|город/i.test(text.toLowerCase());
console.log('City mentioned (should be false):', hasCity);
```

---

## 📊 ИТОГОВАЯ ТАБЛИЦА СТАТУСА

| # | Пункт ТЗ | Статус | Файл | Проверка |
|---|----------|--------|------|----------|
| 1 | Иерархические категории + аккордеон | ✅ | `src/widgets/categories/index.tsx` | Главная + скролл |
| 2 | Город в cookie, убрать из выдачи | ✅ | `src/entities/product/ui/product-card.tsx` + `src/shared/lib/city-utils.ts` | /products + DevTools |
| 3 | Header: телефон + часы + чат | ✅ | `src/widgets/header/index.tsx` | Все страницы, скролл |
| 4 | SMS авторизация (OTP) | ✅ | `src/feature/auth/phone-auth-sheet.tsx` + `src/entities/user/model/auth-store.ts` | "Вход в систему" |
| 5a | OTP безопасность (TTL, таймер) | ✅ | `src/entities/user/model/auth-store.ts` | DevTools Console |
| 5b | Метрики в товар | ✅ | `src/entities/product/ui/product-card.tsx` | /products, главная |

---

## 🚀 БЫСТРАЯ ПРОВЕРКА (30 СЕКУНД)

```bash
# Открыть главную страницу
http://localhost:3001

# Проверить:
1. Header с Email, Позвонить, Часы, Чат ✅
2. Скроллить → Категории с "Показать ещё" ✅
3. /products → Метрики на карточках, нет города ✅
4. "Вход в систему" → SMS авторизация ✅
5. DevTools → Cookies/SessionStorage с адресом и geo ✅
```

---

## 📝 ПРИМЕЧАНИЯ

- **SMS код (dev)**: Выводится в Console логе для тестирования
- **Часы работы**: Скрыты на мобильных (only lg screens)
- **Чат URL**: Placeholder ссылка на Telegram (замени на реальную)
- **Метрики**: Получаются с API, динамичны для каждого товара
- **Адрес в cookie**: Сохраняется при выборе в "Укажите адрес доставки"

---

## 🎥 СКРИНКАСТЫ ГОТОВЫ

Подробные инструкции по скринкастам см. в файле:
`SCREENCAST_INSTRUCTIONS_NEW_TZ.md`

Содержит:
- Пошаговые инструкции для каждого пункта
- Точные URL и клики
- DevTools команды для проверки
- Ожидаемые результаты
- Code snippets для Console
