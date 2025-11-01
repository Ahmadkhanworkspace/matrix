import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Mail, CheckCircle, XCircle, Upload, Download, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ValidationResult {
  email: string;
  valid: boolean;
  reason?: string;
}

const EmailValidation: React.FC = () => {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [validating, setValidating] = useState(false);

  const validateEmail = (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const basicCheck = emailRegex.test(email);
    
    if (!basicCheck) {
      return { email, valid: false, reason: 'Invalid email format' };
    }

    // Additional checks
    if (email.length > 254) {
      return { email, valid: false, reason: 'Email too long (max 254 characters)' };
    }

    const [local, domain] = email.split('@');
    if (local.length > 64) {
      return { email, valid: false, reason: 'Local part too long (max 64 characters)' };
    }

    // Common disposable email domains (simplified)
    const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com'];
    if (disposableDomains.includes(domain.toLowerCase())) {
      return { email, valid: true, reason: 'May be disposable email' };
    }

    return { email, valid: true };
  };

  const handleSingleValidation = () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const result = validateEmail(email.trim());
    setResults([result]);
    if (result.valid) {
      toast.success('Email is valid');
    } else {
      toast.error(`Email is invalid: ${result.reason}`);
    }
  };

  const handleBulkValidation = (emails: string[]) => {
    setValidating(true);
    const validationResults = emails.map(e => validateEmail(e.trim()));
    setResults(validationResults);
    setValidating(false);

    const validCount = validationResults.filter(r => r.valid).length;
    toast.success(`Validated ${emails.length} emails: ${validCount} valid, ${emails.length - validCount} invalid`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const emails = text.split('\n').map(line => line.trim()).filter(line => line);
      handleBulkValidation(emails);
    };
    reader.readAsText(file);
  };

  const exportResults = () => {
    const csv = 'Email,Valid,Reason\n' + 
      results.map(r => `${r.email},${r.valid ? 'Yes' : 'No'},${r.reason || ''}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-validation-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.filter(r => !r.valid).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Validation</h1>
          <p className="text-gray-600">Validate email addresses and check for disposable emails</p>
        </div>
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Validated</p>
                  <p className="text-2xl font-bold">{results.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valid Emails</p>
                  <p className="text-2xl font-bold text-green-600">{validCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Invalid Emails</p>
                  <p className="text-2xl font-bold text-red-600">{invalidCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Single Email Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Single Email Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address to validate"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSingleValidation()}
              className="flex-1"
            />
            <Button onClick={handleSingleValidation}>
              Validate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Email Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                Upload CSV/Text File
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={validating}
                />
              </label>
              <p className="text-sm text-gray-600">
                Upload a file with one email per line
              </p>
            </div>
            {validating && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Validating emails...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Validation Results ({results.length})</span>
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {result.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{result.email}</p>
                      {result.reason && (
                        <p className="text-sm text-gray-600">{result.reason}</p>
                      )}
                    </div>
                    <Badge className={result.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {result.valid ? 'Valid' : 'Invalid'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailValidation;