import { useState } from 'react';

export default function CommentItem({ comment, currentUser, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(comment.id);
    }
    setShowDeleteConfirm(false);
  };

  const canDelete = currentUser === comment.username;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start gap-3">
        <img
          src={comment.avatar 
            ? `http://localhost:3001/avatars${comment.avatar}`
            : `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.username}`}
          alt={comment.username}
          className="w-10 h-10 rounded-full border object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-800">{comment.username}</span>
              <span className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
            {canDelete && (
              <div className="relative">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    删除
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">确认删除？</span>
                    <button
                      onClick={handleDelete}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}
