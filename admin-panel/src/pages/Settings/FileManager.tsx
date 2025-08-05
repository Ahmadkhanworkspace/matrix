import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Folder, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';

const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState([
    { name: 'config.php', type: 'file', size: '2.5 KB', modified: '2024-01-15' },
    { name: 'admin.php', type: 'file', size: '15.2 KB', modified: '2024-01-14' },
    { name: 'uploads', type: 'folder', size: '1.2 MB', modified: '2024-01-13' },
    { name: 'images', type: 'folder', size: '5.8 MB', modified: '2024-01-12' },
    { name: 'backups', type: 'folder', size: '25.4 MB', modified: '2024-01-11' }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">File Manager</h1>
          <p className="text-gray-600">Manage system files and uploads</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <Card>
        <CardContent className="p-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <button
                  onClick={() => setCurrentPath('/')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Root
                </button>
              </li>
              {currentPath !== '/' && (
                <li className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-900">{currentPath}</span>
                </li>
              )}
            </ol>
          </nav>
        </CardContent>
      </Card>

      {/* File Browser */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Folder className="h-5 w-5 mr-2" />
            Files and Folders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Size</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Modified</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {file.type === 'folder' ? (
                          <Folder className="h-5 w-5 text-blue-500 mr-3" />
                        ) : (
                          <File className="h-5 w-5 text-gray-500 mr-3" />
                        )}
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={file.type === 'folder' ? 'secondary' : 'outline'}>
                        {file.type === 'folder' ? 'Folder' : 'File'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">{file.size}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{file.modified}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileManager; 
