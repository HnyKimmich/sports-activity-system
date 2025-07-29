import { useState } from 'react';

export default function CommentForm({ onSubmit, isSubmitting }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    onSubmit(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你对这个活动的评论..."
          className="flex-1 px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="3"
          disabled={isSubmitting}
          maxLength={500}
        />
        <div className="flex flex-col">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '提交中...' : '发表评论'}
          </button>
          <div className="text-xs text-gray-500 mt-2">
            {content.length}/500
          </div>
        </div>
      </div>
    </form>
  );
}
