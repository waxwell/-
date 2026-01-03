import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, RefreshCw } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { ResultCard } from './components/ResultCard';
import { generateStickerImage } from './services/geminiService';
import { fileToBase64, removeGreenScreen } from './utils/imageProcessing';
import { ProcessingStatus } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setStatus(ProcessingStatus.IDLE);
    setGeneratedImage(null);
    setProcessedImage(null);
    
    try {
      const base64 = await fileToBase64(selectedFile);
      setPreview(base64);
    } catch (err) {
      setError("读取图片失败");
    }
  };

  const handleGenerate = async () => {
    if (!preview) return;

    setStatus(ProcessingStatus.GENERATING);
    setError(null);

    try {
      // 1. Generate Sticker with Green Screen using Gemini
      const stickerWithBg = await generateStickerImage(preview);
      setGeneratedImage(stickerWithBg);

      setStatus(ProcessingStatus.PROCESSING);
      
      // 2. Remove Green Screen using Canvas
      // Add a slight delay to allow UI to update and show "Processing" state
      setTimeout(async () => {
        try {
          const finalSticker = await removeGreenScreen(stickerWithBg);
          setProcessedImage(finalSticker);
          setStatus(ProcessingStatus.COMPLETED);
        } catch (processErr) {
          console.error(processErr);
          setError("抠图处理失败，但生成已完成");
          setStatus(ProcessingStatus.COMPLETED); // Still show the result even if chroma key fails slightly
        }
      }, 500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "生成失败，请重试");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `sticker-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setStatus(ProcessingStatus.IDLE);
    setGeneratedImage(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              StickerAI
            </h1>
          </div>
          <div className="text-sm text-gray-500 font-medium hidden sm:block">
            Gemini 2.5 Flash Image Model
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Intro */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            将照片转化为<span className="text-blue-600">专属贴纸</span>
          </h2>
          <p className="text-lg text-gray-600">
            上传任意照片，AI 自动识别主体、添加白色描边并去除背景。
            制作属于你的表情包或打印素材。
          </p>
        </div>

        {/* Upload Section */}
        {!preview && (
          <div className="max-w-xl mx-auto animate-fade-in-up">
            <ImageUploader onImageSelected={handleImageSelect} />
          </div>
        )}

        {/* Processing View */}
        {preview && (
          <div className="space-y-8 animate-fade-in">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                 <img src={preview} alt="Mini preview" className="w-10 h-10 rounded object-cover border border-gray-200" />
                 <span className="text-sm font-medium text-gray-600 truncate max-w-[150px]">{file?.name}</span>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleReset} 
                  variant="secondary"
                  disabled={status === ProcessingStatus.GENERATING || status === ProcessingStatus.PROCESSING}
                >
                  <RefreshCw className="w-4 h-4" />
                  重新上传
                </Button>
                
                {status === ProcessingStatus.IDLE && (
                  <Button onClick={handleGenerate}>
                    <Wand2 className="w-4 h-4" />
                    开始生成贴纸
                  </Button>
                )}

                {(status === ProcessingStatus.GENERATING || status === ProcessingStatus.PROCESSING) && (
                  <Button isLoading disabled>
                    {status === ProcessingStatus.GENERATING ? 'AI生成中...' : '正在抠图...'}
                  </Button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-sm underline hover:text-red-800">关闭</button>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Original / Loading State */}
              <div className="relative">
                 <ResultCard 
                    title="原始图片" 
                    imageSrc={preview} 
                    badge="Input"
                 />
                 {(status === ProcessingStatus.GENERATING || status === ProcessingStatus.PROCESSING) && (
                   <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10 transition-all duration-500">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">正在施展 AI 魔法...</p>
                        <p className="text-gray-400 text-sm mt-1">这可能需要几秒钟</p>
                      </div>
                   </div>
                 )}
              </div>

              {/* Final Result */}
              {status === ProcessingStatus.COMPLETED && processedImage && (
                <div className="animate-fade-in-up">
                  <ResultCard 
                    title="生成的贴纸" 
                    imageSrc={processedImage} 
                    isTransparent 
                    onDownload={handleDownload}
                    badge="AI Generated"
                  />
                </div>
              )}
              
              {/* Placeholder for Result when not ready */}
              {status !== ProcessingStatus.COMPLETED && (
                 <div className="border-2 border-dashed border-gray-200 rounded-xl min-h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                    <Sparkles className="w-10 h-10 mb-3 opacity-20" />
                    <p>生成结果将显示在这里</p>
                 </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;