export interface ResponseTemplate {
  name: string;
  status: number;
  headers: Record<string, string>;
  body: string;
}

export const responseTemplates: ResponseTemplate[] = [
  {
    name: '200 OK',
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ success: true, message: 'Request received' }, null, 2),
  },
  {
    name: '201 Created',
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Location': '/resource/123',
    },
    body: JSON.stringify({ id: '123', created_at: new Date().toISOString() }, null, 2),
  },
  {
    name: '400 Bad Request',
    status: 400,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Bad Request', message: 'Invalid request parameters' }, null, 2),
  },
  {
    name: '404 Not Found',
    status: 404,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Not Found', message: 'Resource not found' }, null, 2),
  },
  {
    name: '500 Server Error',
    status: 500,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Internal Server Error', message: 'Something went wrong' }, null, 2),
  },
];
