import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Request } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RequestDetailProps {
  request: Request | null;
  onClose: () => void;
}

function getMethodColor(
  method: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'default';
    case 'POST':
      return 'secondary';
    case 'PUT':
    case 'PATCH':
      return 'outline';
    case 'DELETE':
      return 'destructive';
    default:
      return 'outline';
  }
}

function tryFormatJson(text: string): { formatted: string; language: string } {
  try {
    const parsed = JSON.parse(text);
    return {
      formatted: JSON.stringify(parsed, null, 2),
      language: 'json',
    };
  } catch {
    return { formatted: text, language: 'text' };
  }
}

function tryFormatXml(text: string): { formatted: string; language: string } {
  // Simple check for XML-like content
  if (text.trim().startsWith('<') && text.trim().endsWith('>')) {
    return { formatted: text, language: 'xml' };
  }
  return { formatted: text, language: 'text' };
}

function detectContentType(
  contentType?: string,
  body?: string
): { formatted: string; language: string } {
  if (!body) {
    return { formatted: '', language: 'text' };
  }

  // Check content type first
  if (contentType?.includes('application/json')) {
    return tryFormatJson(body);
  }

  if (
    contentType?.includes('application/xml') ||
    contentType?.includes('text/xml')
  ) {
    return tryFormatXml(body);
  }

  // Try to auto-detect JSON
  if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
    const jsonResult = tryFormatJson(body);
    if (jsonResult.language === 'json') {
      return jsonResult;
    }
  }

  // Try to auto-detect XML
  const xmlResult = tryFormatXml(body);
  if (xmlResult.language === 'xml') {
    return xmlResult;
  }

  return { formatted: body, language: 'text' };
}

export function RequestDetail({ request, onClose }: RequestDetailProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, item: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    });
  };

  if (!request) {
    return null;
  }

  const contentType = request.headers['content-type'] || request.headers['Content-Type'];
  const { formatted: formattedBody, language } = detectContentType(
    contentType,
    request.body
  );

  const allHeadersText = Object.entries(request.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const rawRequest = `${request.method} ${request.query_params ? '?' + new URLSearchParams(request.query_params).toString() : ''}
${allHeadersText}

${request.body || ''}`;

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant={getMethodColor(request.method)}>
              {request.method}
            </Badge>
            Request Details
          </DialogTitle>
          <DialogDescription>
            {new Date(request.received_at).toLocaleString()} • ID:{' '}
            <code className="text-xs">{request.id}</code>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="headers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="headers">
              Headers ({Object.keys(request.headers).length})
            </TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>

          <TabsContent value="headers" className="space-y-2">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(allHeadersText, 'all-headers')}
                className="gap-2"
              >
                {copiedItem === 'all-headers' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy All Headers
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {Object.entries(request.headers).length === 0 ? (
                <p className="text-muted-foreground text-sm">No headers</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(request.headers).map(([key, value]) => (
                    <div
                      key={key}
                      className="space-y-1 group hover:bg-accent/50 p-2 rounded transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-medium">{key}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopy(`${key}: ${value}`, `header-${key}`)
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
                        >
                          {copiedItem === `header-${key}` ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground bg-muted p-2 rounded break-all">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="body" className="space-y-2">
            <div className="flex justify-end gap-2">
              {request.body && (
                <>
                  <Badge variant="outline" className="text-xs">
                    {language.toUpperCase()}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(formattedBody, 'body')}
                    className="gap-2"
                  >
                    {copiedItem === 'body' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Body
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
            <ScrollArea className="h-[400px] w-full rounded-md border">
              {request.body ? (
                <pre className={`text-sm whitespace-pre-wrap break-words p-4 ${language === 'json' ? 'font-mono bg-slate-950 text-emerald-400' : language === 'xml' ? 'font-mono bg-slate-950 text-blue-400' : ''}`}>
                  {formattedBody}
                </pre>
              ) : (
                <div className="p-4">
                  <p className="text-muted-foreground text-sm">No body</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="space-y-2">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(rawRequest, 'raw')}
                className="gap-2"
              >
                {copiedItem === 'raw' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Raw Request
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                {rawRequest}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
