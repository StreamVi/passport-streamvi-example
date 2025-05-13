# Тестовый проект авторизации через StreamVi

Этот проект демонстрирует как настроить авторизацию через StreamVi с использованием passport-streamvi.

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` в корневой директории и добавьте следующие переменные:
```
PORT=3000
STREAMVI_CLIENT_ID=your_client_id
STREAMVI_CLIENT_SECRET=your_client_secret
CALLBACK_URL=http://localhost:3000/auth/streamvi/callback
```

## Запуск

Для запуска в режиме разработки:
```bash
npm run dev
```

Для запуска в production режиме:
```bash
npm start
```

## Использование

1. Откройте http://localhost:3000 в браузере
2. Нажмите на ссылку "Войти через StreamVi"
3. После успешной авторизации вы будете перенаправлены обратно на сайт

## Структура проекта

- `src/index.ts` - основной файл приложения
- `.env` - файл с переменными окружения
- `package.json` - зависимости и скрипты
- `tsconfig.json` - конфигурация TypeScript 