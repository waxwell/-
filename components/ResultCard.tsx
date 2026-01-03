import React from 'react';
import { Download, Check, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface ResultCardProps {
  title: string;
  imageSrc: string;
  isTransparent?: boolean;
  onDownload?: () => void;
  badge?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  title, 
  imageSrc, 
  isTransparent = false,
  onDownload,
  badge
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          {title}
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
              {badge}
            </span>
          )}
        </h3>
      </div>
      
      <div className={`relative flex-1 min-h-[300px] flex items-center justify-center p-6 ${isTransparent ? 'bg-checkerboard' : 'bg-gray-100'}`}>
         <img 
          src={imageSrc} 
          alt={title} 
          className="max-h-[350px] w-auto object-contain drop-shadow-sm transition-transform hover:scale-105 duration-300"
        />
      </div>

      {onDownload && (
        <div className="p-4 bg-white border-t border-gray-100">
          <Button onClick={onDownload} className="w-full" variant="secondary">
            <Download className="w-4 h-4" />
            下载贴纸
          </Button>
        </div>
      )}
    </div>
  );
};