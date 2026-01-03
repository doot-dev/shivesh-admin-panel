import { useState } from "react";
import { Icon, ICON_NAMES } from "../icons";
const FileUploadField = ({ label, accept, onChange, file, onRemove }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputId = `file-${label.toLowerCase().replace(/['\s]/g, '-')}`;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {!file ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id={inputId}
            className="hidden"
            onChange={handleChange}
            accept={accept}
          />
          
          <label htmlFor={inputId} className="cursor-pointer flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 border border-gray-200">
               <Icon name={ICON_NAMES.UPLOAD} size={18} />
            </div>
            
            <p className="text-sm font-medium text-gray-700 mb-1">
              Upload files
            </p>
            
            <p className="text-xs text-gray-500">
              PNG, JPG, PDF up to 10 MB
            </p>
          </label>
        </div>
      ) : (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name={ICON_NAMES.FILE_TEXT} className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
          >
           X
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploadField