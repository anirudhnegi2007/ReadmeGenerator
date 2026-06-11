import React from 'react';
import { 
  Folder, File, ChevronDown, ChevronRight, Check, Code, 
  FileText, Database, Zap, Image as ImageIcon 
} from 'lucide-react';

const getFileIcon = (file) => {
  if (file.type === 'folder') return <Folder className="w-4 h-4 text-blue-400" />;

  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <Code className="w-4 h-4 text-yellow-400" />;
    case 'md':
      return <FileText className="w-4 h-4 text-blue-400" />;
    case 'json':
      return <Database className="w-4 h-4 text-green-400" />;
    case 'html':
      return <Code className="w-4 h-4 text-orange-400" />;
    case 'css':
      return <Zap className="w-4 h-4 text-pink-400" />;
    case 'png':
    case 'jpg':
    case 'svg':
    case 'ico':
      return <ImageIcon className="w-4 h-4 text-purple-400" />;
    default:
      return <File className="w-4 h-4 text-slate-400" />;
  }
};

const FileTree = ({ 
  items, 
  level = 0, 
  expandedFolders, 
  selectedFiles, 
  onToggleFolder, 
  onToggleFile 
}) => {
  return items.map((item) => (
    <div key={item.path}>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 hover:bg-slate-700/50 cursor-pointer rounded transition-colors ${
          selectedFiles.has(item.path) ? 'bg-slate-700' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => {
          if (item.type === 'folder') {
            onToggleFolder(item.path);
          } else {
            onToggleFile(item.path);
          }
        }}
      >
        {item.type === 'folder' && (
          expandedFolders.has(item.path) ? 
            <ChevronDown className="w-4 h-4 text-slate-400" /> : 
            <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
        {getFileIcon(item)}
        <span className="text-sm text-slate-200 flex-1">{item.name}</span>
        {item.type === 'file' && selectedFiles.has(item.path) && (
          <Check className="w-4 h-4 text-green-400" />
        )}
      </div>
      {item.type === 'folder' && expandedFolders.has(item.path) && item.children && (
        <div>
          <FileTree 
            items={item.children} 
            level={level + 1} 
            expandedFolders={expandedFolders} 
            selectedFiles={selectedFiles} 
            onToggleFolder={onToggleFolder} 
            onToggleFile={onToggleFile} 
          />
        </div>
      )}
    </div>
  ));
};

export default FileTree;
