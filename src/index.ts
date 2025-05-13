import express from 'express';
import passport from 'passport';
import { StreamViStrategy } from 'passport-streamvi';
import dotenv from 'dotenv';
import { Profile } from 'passport';
import path from 'path';

// Загрузка переменных окружения
const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (result.error) {
  console.error('Ошибка загрузки .env файла:', result.error);
  process.exit(1);
}

// Проверка наличия необходимых переменных
const requiredEnvVars = ['STREAMVI_CLIENT_ID', 'STREAMVI_CLIENT_SECRET', 'CALLBACK_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Отсутствуют необходимые переменные окружения:', missingEnvVars.join(', '));
  process.exit(1);
}

const app = express();

// Настройка стратегии StreamVi
passport.use(
  new StreamViStrategy(
    {
      clientID: process.env.STREAMVI_CLIENT_ID as string,
      clientSecret: process.env.STREAMVI_CLIENT_SECRET as string,
      callbackURL: process.env.CALLBACK_URL as string,
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      // Здесь вы можете сохранить токены и профиль в базу данных
      return done(null, { accessToken, refreshToken, profile });
    }
  )
);

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Маршруты
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Добро пожаловать! <a href="/auth/streamvi">Войти через StreamVi</a>');
});

app.get('/auth/streamvi', passport.authenticate('streamvi'));

app.get(
  '/auth/streamvi/callback',
  passport.authenticate('streamvi', { failureRedirect: '/login' }),
  (req: express.Request, res: express.Response) => {
    // Успешная авторизация
    res.json({
      message: 'Успешная авторизация',
      user: req.user
    });
  }
);

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 