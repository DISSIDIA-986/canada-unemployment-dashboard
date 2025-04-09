import React, { useEffect, useState } from 'react';

const ImageViewer = ({ src, alt, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-screen-xl max-h-screen">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-800 hover:text-gray-600 focus:outline-none z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 加载指示器 */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* 图片容器 - 添加白色背景 */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
            onLoad={() => setLoading(false)}
            style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }}
          />
        </div>
      </div>

      {/* 点击背景关闭 */}
      <button
        className="absolute inset-0 w-full h-full cursor-zoom-out bg-transparent"
        onClick={onClose}
        aria-label="Close image viewer"
      />

      {/* 提示信息 */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-white text-sm opacity-70">
        Press ESC or click outside to close
      </div>
    </div>
  );
};

export default ImageViewer;