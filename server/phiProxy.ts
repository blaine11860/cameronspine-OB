import type { Request, Response, NextFunction, RequestHandler } from "express";
import axios from "axios";
import qs from "querystring";

const {
  COGNITO_DOMAIN,
  COGNITO_CLIENT_ID,
  COGNITO_CLIENT_SECRET,
  COGNITO_REDIRECT_URI,
  COGNITO_LOGOUT_REDIRECT_URI,
  AWS_PHI_API_BASE_URL,
  SESSION_SECRET
} = process.env;

function redactPotentialPhi(input: any): any {
  if (!input) return input;
  let str = String(input);
  str = str.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]');
  str = str.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]');
  str = str.replace(/\b\d{9,}\b/g, '[REDACTED_ID]');
  str = str.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');
  str = str.replace(/\b(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}\b/g, '[REDACTED_DOB]');
  return str;
}

export const safeLog = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    const sanitized = args.map(a => {
      if (typeof a === 'object' && a !== null) {
        try {
          return redactPotentialPhi(JSON.stringify(a));
        } catch {
          return '[OBJECT]';
        }
      }
      return redactPotentialPhi(a);
    });
    console.log('[SAFE_LOG]', ...sanitized);
  }
};

export const requirePhiAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const token = (req as any).signedCookies?.access_token || (req as any).cookies?.access_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - PHI access requires authentication' });
  }
  next();
};

async function proxyToPhiApi(
  req: Request, 
  res: Response, 
  path: string, 
  method: 'get' | 'post' | 'put' | 'delete' = 'post'
) {
  const accessToken = (req as any).signedCookies?.access_token || (req as any).cookies?.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!AWS_PHI_API_BASE_URL) {
    return res.status(503).json({ error: 'PHI service not configured' });
  }

  try {
    const url = `${AWS_PHI_API_BASE_URL}${path}`;

    const axiosConfig: any = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (method !== 'get' && req.body) {
      axiosConfig.data = req.body;
    }

    const response = await axios(axiosConfig);
    res.status(response.status).json(response.data);
  } catch (err: any) {
    safeLog('Error proxying to PHI API:', {
      path,
      status: err.response?.status,
      message: err.message
    });
    
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Session expired' });
    }
    
    res.status(err.response?.status || 500).json({ 
      error: 'Backend error',
      message: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
}

export function registerPhiRoutes(app: any) {
  app.get('/auth/login', ((req: Request, res: Response) => {
    if (!COGNITO_DOMAIN || !COGNITO_CLIENT_ID || !COGNITO_REDIRECT_URI) {
      return res.status(503).json({ 
        error: 'Authentication not configured',
        message: 'Please configure Cognito environment variables'
      });
    }

    const loginUrl = `${COGNITO_DOMAIN}/oauth2/authorize?` + qs.stringify({
      client_id: COGNITO_CLIENT_ID,
      response_type: 'code',
      redirect_uri: COGNITO_REDIRECT_URI,
      scope: 'openid profile email'
    });

    res.redirect(loginUrl);
  }) as RequestHandler);

  app.get('/auth/callback', (async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    if (!COGNITO_DOMAIN || !COGNITO_CLIENT_ID || !COGNITO_CLIENT_SECRET || !COGNITO_REDIRECT_URI) {
      return res.status(503).json({ error: 'Authentication not configured' });
    }

    try {
      const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;

      const authHeader = Buffer.from(
        `${COGNITO_CLIENT_ID}:${COGNITO_CLIENT_SECRET}`
      ).toString('base64');

      const tokenResponse = await axios.post(
        tokenUrl,
        qs.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: COGNITO_REDIRECT_URI
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${authHeader}`
          }
        }
      );

      const { access_token, id_token, refresh_token, expires_in } = tokenResponse.data;

      const MAX_SESSION_MS = 30 * 60 * 1000; // 30 minutes max for security

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        signed: !!SESSION_SECRET,
        maxAge: Math.min(expires_in * 1000, MAX_SESSION_MS)
      };

      res.cookie('access_token', access_token, cookieOptions);
      res.cookie('id_token', id_token, cookieOptions);

      if (refresh_token) {
        res.cookie('refresh_token', refresh_token, {
          ...cookieOptions,
          maxAge: MAX_SESSION_MS
        });
      }

      res.redirect('/dashboard');
    } catch (err: any) {
      safeLog('Error exchanging code for tokens:', err.message);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }) as RequestHandler);

  app.get('/auth/logout', ((req: Request, res: Response) => {
    res.clearCookie('access_token');
    res.clearCookie('id_token');
    res.clearCookie('refresh_token');

    if (COGNITO_DOMAIN && COGNITO_CLIENT_ID && COGNITO_LOGOUT_REDIRECT_URI) {
      const logoutUrl = `${COGNITO_DOMAIN}/logout?` + qs.stringify({
        client_id: COGNITO_CLIENT_ID,
        logout_uri: COGNITO_LOGOUT_REDIRECT_URI
      });
      return res.redirect(logoutUrl);
    }

    res.redirect('/');
  }) as RequestHandler);

  app.get('/auth/status', ((req: Request, res: Response) => {
    const token = (req as any).signedCookies?.access_token || (req as any).cookies?.access_token;
    res.json({ 
      authenticated: !!token,
      configured: !!(COGNITO_DOMAIN && COGNITO_CLIENT_ID)
    });
  }) as RequestHandler);

  app.post('/phi/intake', requirePhiAuth, (async (req: Request, res: Response) => {
    return proxyToPhiApi(req, res, '/phi/intake', 'post');
  }) as RequestHandler);

  app.get('/phi/summary', requirePhiAuth, (async (req: Request, res: Response) => {
    const accessToken = (req as any).signedCookies?.access_token || (req as any).cookies?.access_token;
    if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!AWS_PHI_API_BASE_URL) {
      return res.status(503).json({ error: 'PHI service not configured' });
    }

    try {
      const url = `${AWS_PHI_API_BASE_URL}/phi/summary`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      res.status(response.status).json(response.data);
    } catch (err: any) {
      safeLog('Error getting PHI summary:', {
        status: err.response?.status,
        message: err.message
      });
      res.status(500).json({ error: 'Backend error' });
    }
  }) as RequestHandler);

  app.get('/phi/records', requirePhiAuth, (async (req: Request, res: Response) => {
    return proxyToPhiApi(req, res, '/phi/records', 'get');
  }) as RequestHandler);

  app.post('/phi/records', requirePhiAuth, (async (req: Request, res: Response) => {
    return proxyToPhiApi(req, res, '/phi/records', 'post');
  }) as RequestHandler);

  app.get('/phi/appointments', requirePhiAuth, (async (req: Request, res: Response) => {
    return proxyToPhiApi(req, res, '/phi/appointments', 'get');
  }) as RequestHandler);

  app.post('/phi/appointments', requirePhiAuth, (async (req: Request, res: Response) => {
    return proxyToPhiApi(req, res, '/phi/appointments', 'post');
  }) as RequestHandler);

  safeLog('PHI proxy routes registered');
}
