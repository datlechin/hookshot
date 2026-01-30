import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { responseTemplates, type ResponseTemplate } from '@/lib/response-templates';
import type { Endpoint } from '@/types';

interface ResponseConfigProps {
  endpoint: Endpoint;
  onUpdate: () => void;
}

interface HeaderRow {
  id: string;
  key: string;
  value: string;
}

export function ResponseConfig({ endpoint, onUpdate }: ResponseConfigProps) {
  const [enabled, setEnabled] = useState(endpoint.custom_response_enabled);
  const [status, setStatus] = useState(endpoint.response_status.toString());
  const [headers, setHeaders] = useState<HeaderRow[]>([]);
  const [body, setBody] = useState(endpoint.response_body || '');
  const [errors, setErrors] = useState<{ status?: string; headers?: string; body?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize headers from endpoint data
  useEffect(() => {
    if (endpoint.response_headers) {
      try {
        const parsed = JSON.parse(endpoint.response_headers);
        const headerRows: HeaderRow[] = Object.entries(parsed).map(([key, value], index) => ({
          id: `header-${index}`,
          key,
          value: value as string,
        }));
        setHeaders(headerRows.length > 0 ? headerRows : [{ id: 'header-0', key: '', value: '' }]);
      } catch {
        setHeaders([{ id: 'header-0', key: '', value: '' }]);
      }
    } else {
      setHeaders([{ id: 'header-0', key: '', value: '' }]);
    }
  }, [endpoint.response_headers]);

  const validateStatus = (value: string): boolean => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 100 || num > 599) {
      setErrors((prev) => ({ ...prev, status: 'Status code must be between 100 and 599' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, status: undefined }));
    return true;
  };

  const validateHeaders = (): boolean => {
    const headersObj: Record<string, string> = {};
    for (const row of headers) {
      if (row.key.trim()) {
        if (!row.value.trim()) {
          setErrors((prev) => ({ ...prev, headers: 'Header value cannot be empty' }));
          return false;
        }
        headersObj[row.key.trim()] = row.value.trim();
      }
    }
    setErrors((prev) => ({ ...prev, headers: undefined }));
    return true;
  };

  const validateBody = (): boolean => {
    // Check if Content-Type is JSON
    const contentTypeHeader = headers.find(
      (h) => h.key.toLowerCase() === 'content-type' && h.value.toLowerCase().includes('application/json')
    );

    if (contentTypeHeader && body.trim()) {
      try {
        JSON.parse(body);
        setErrors((prev) => ({ ...prev, body: undefined }));
        return true;
      } catch {
        setErrors((prev) => ({ ...prev, body: 'Invalid JSON format' }));
        return false;
      }
    }

    setErrors((prev) => ({ ...prev, body: undefined }));
    return true;
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    validateStatus(value);
  };

  const handleHeaderChange = (id: string, field: 'key' | 'value', value: string) => {
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const addHeader = () => {
    setHeaders((prev) => [...prev, { id: `header-${Date.now()}`, key: '', value: '' }]);
  };

  const removeHeader = (id: string) => {
    if (headers.length === 1) {
      setHeaders([{ id: 'header-0', key: '', value: '' }]);
    } else {
      setHeaders((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const applyTemplate = (template: ResponseTemplate) => {
    setStatus(template.status.toString());
    setBody(template.body);

    const headerRows: HeaderRow[] = Object.entries(template.headers).map(([key, value], index) => ({
      id: `header-${Date.now()}-${index}`,
      key,
      value,
    }));
    setHeaders(headerRows);

    setErrors({});
  };

  const handleSave = async () => {
    // Validate all fields
    const isStatusValid = validateStatus(status);
    const areHeadersValid = validateHeaders();
    const isBodyValid = validateBody();

    if (!isStatusValid || !areHeadersValid || !isBodyValid) {
      return;
    }

    setIsSaving(true);

    try {
      // Build headers object
      const headersObj: Record<string, string> = {};
      for (const row of headers) {
        if (row.key.trim()) {
          headersObj[row.key.trim()] = row.value.trim();
        }
      }

      const response = await fetch(`/api/endpoints/${endpoint.id}/response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled,
          status: parseInt(status, 10),
          headers: Object.keys(headersObj).length > 0 ? JSON.stringify(headersObj) : null,
          body: body.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to update response config:', error);
      setErrors((prev) => ({ ...prev, status: 'Failed to save configuration' }));
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewContent = () => {
    const headersObj: Record<string, string> = {};
    for (const row of headers) {
      if (row.key.trim()) {
        headersObj[row.key.trim()] = row.value.trim();
      }
    }

    return {
      status: parseInt(status, 10) || 200,
      headers: headersObj,
      body: body.trim() || '(empty)',
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custom Response Configuration</CardTitle>
            <CardDescription>
              Configure how this endpoint responds to incoming webhook requests
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="response-enabled">Enable Custom Response</Label>
            <Switch
              id="response-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Buttons */}
        <div className="space-y-2">
          <Label>Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            {responseTemplates.map((template) => (
              <Button
                key={template.name}
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(template)}
                disabled={!enabled}
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Code */}
        <div className="space-y-2">
          <Label htmlFor="status-code">Status Code</Label>
          <Input
            id="status-code"
            type="number"
            min="100"
            max="599"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={!enabled}
            className={errors.status ? 'border-destructive' : ''}
          />
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status}</p>
          )}
        </div>

        {/* Headers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Response Headers</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addHeader}
              disabled={!enabled}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Header
            </Button>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Header Name</TableHead>
                  <TableHead className="w-[50%]">Value</TableHead>
                  <TableHead className="w-[10%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {headers.map((header) => (
                  <TableRow key={header.id}>
                    <TableCell>
                      <Input
                        placeholder="Content-Type"
                        value={header.key}
                        onChange={(e) => handleHeaderChange(header.id, 'key', e.target.value)}
                        disabled={!enabled}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="application/json"
                        value={header.value}
                        onChange={(e) => handleHeaderChange(header.id, 'value', e.target.value)}
                        disabled={!enabled}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHeader(header.id)}
                        disabled={!enabled || headers.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {errors.headers && (
            <p className="text-sm text-destructive">{errors.headers}</p>
          )}
        </div>

        {/* Response Body */}
        <div className="space-y-2">
          <Label htmlFor="response-body">Response Body</Label>
          <Textarea
            id="response-body"
            placeholder="Enter response body (text or JSON)..."
            value={body}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setBody(e.target.value);
              validateBody();
            }}
            disabled={!enabled}
            rows={10}
            className={errors.body ? 'border-destructive font-mono text-sm' : 'font-mono text-sm'}
          />
          {errors.body && (
            <p className="text-sm text-destructive">{errors.body}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!enabled || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            disabled={!enabled}
          >
            {showPreview ? 'Hide Preview' : 'Preview Response'}
          </Button>
        </div>

        {/* Preview */}
        {showPreview && enabled && (
          <div className="space-y-2 p-4 bg-muted rounded-md">
            <h4 className="font-semibold text-sm">Response Preview</h4>
            <div className="space-y-2 text-sm font-mono">
              <div>
                <span className="text-muted-foreground">Status:</span>{' '}
                <span className="font-semibold">{getPreviewContent().status}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Headers:</span>
                <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                  {JSON.stringify(getPreviewContent().headers, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-muted-foreground">Body:</span>
                <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                  {getPreviewContent().body}
                </pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
