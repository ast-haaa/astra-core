
import { z } from 'zod';
import { insertSampleSchema, insertRecallSchema, insertNotificationSchema, samples, recalls, notifications, users } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  samples: {
    list: {
      method: 'GET' as const,
      path: '/api/samples',
      responses: {
        200: z.array(z.custom<typeof samples.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/samples/:id',
      responses: {
        200: z.custom<typeof samples.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/samples',
      input: insertSampleSchema,
      responses: {
        201: z.custom<typeof samples.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/samples/:id',
      input: insertSampleSchema.partial(),
      responses: {
        200: z.custom<typeof samples.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  recalls: {
    list: {
      method: 'GET' as const,
      path: '/api/recalls',
      responses: {
        200: z.array(z.custom<typeof recalls.$inferSelect>()),
      },
    },
  },
  notifications: {
    list: {
      method: 'GET' as const,
      path: '/api/notifications',
      responses: {
        200: z.array(z.custom<typeof notifications.$inferSelect>()),
      },
    },
    markRead: {
      method: 'PATCH' as const,
      path: '/api/notifications/:id/read',
      responses: {
        200: z.custom<typeof notifications.$inferSelect>(),
      },
    },
  },
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.validation,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.internal, // Not authenticated
      }
    }
  }
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
