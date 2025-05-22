import express from 'express';
import passport from 'passport';
import { StreamViStrategy } from 'passport-streamvi';
import dotenv from 'dotenv';
import { Profile } from 'passport';
import path from 'path';

// Loading environment variables
const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Check for required variables
const requiredEnvVars = ['STREAMVI_CLIENT_ID', 'STREAMVI_CLIENT_SECRET', 'CALLBACK_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const app = express();

// Setting up StreamVi strategy
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
      done: (error: any, user?: any, info?: any) => void
    ) => {
      console.log('Strategy received profile:', profile);
      
      if (!profile) {
        console.log('Profile not received');
        return done(null, false, { message: 'Failed to get user profile' });
      }
      
      // Here you can save tokens and profile to the database
      return done(null, { accessToken, refreshToken, profile });
    }
  )
);

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Routes
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Welcome! <a href="/auth/streamvi">Login with StreamVi</a>');
});

app.get('/login', (req: express.Request, res: express.Response) => {
  const errorMessage = req.query.error ? decodeURIComponent(req.query.error as string) : 'Authentication Error';
  console.log('/login page received error:', errorMessage);
  console.log('All request parameters:', req.query);
  
  res.send(`
    <h2>Authentication Error</h2>
    <p style="color: red">${errorMessage}</p>
    <p><strong>Request details:</strong> ${JSON.stringify(req.query)}</p>
    <a href="/auth/streamvi">Try again</a>
  `);
});

app.get('/auth/streamvi', passport.authenticate('streamvi'));

app.get('/auth/streamvi/callback', 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log('Received callback from StreamVi');
    console.log('Request parameters:', req.query);
    
    // Check if there's an error parameter in the URL (standard for OAuth2)
    if (req.query.error) {
      const errorMessage = req.query.error_description 
        ? decodeURIComponent(req.query.error_description as string) 
        : (req.query.error as string);
      console.log('OAuth error detected in URL:', errorMessage);
      return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
    
    passport.authenticate('streamvi', (err: any, user: any, info: any) => {
      console.log('Authentication result:');
      console.log('- Error:', err);
      console.log('- User:', user);
      console.log('- Info:', info);
      
      if (err) {
        // Server error
        console.log('Server error:', err.message);
        return res.redirect(`/login?error=${encodeURIComponent(err.message || 'Server error')}`);
      }
      if (!user) {
        // Authentication error
        let errorMessage = 'Authentication error';
        
        // Check if there's detailed error information
        if (info) {
          if (typeof info === 'string') {
            errorMessage = info;
          } else if (info.message) {
            errorMessage = info.message;
          } else if (info.toString && info.toString() !== '[object Object]') {
            errorMessage = info.toString();
          }
        }
        
        console.log('Authentication error:', errorMessage);
        return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
      }
      // Successful authentication
      return res.json({
        message: 'Successful authorization',
        user
      });
    })(req, res, next);
  }
);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}); 