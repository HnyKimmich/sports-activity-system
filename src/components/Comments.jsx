import { useState, useEffect } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

export default function Comments({ activityId, title = "活动评论" }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const currentUser = localStorage.getItem('username');

  // 获取评论列表
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/activities/${activityId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('获取评论失败');
    } finally {
      setLoading(false);
    }
  };

  // 提交新评论
  const handleSubmitComment = async (content) => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/activities/${activityId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser,
          content: content,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prevComments => [...prevComments, newComment]);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '评论提交失败');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/activities/${activityId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser,
        }),
      });

      if (response.ok) {
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '删除失败');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('删除失败，请稍后重试');
    }
  };

  useEffect(() => {
    if (activityId) {
      fetchComments();
    }
  }, [activityId]);

  if (loading) {
    return (
      <div className="bg-white/90 rounded-xl shadow-lg p-8">
        <div className="text-center text-blue-600">加载评论中...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-blue-800 mb-6">
        {title} ({comments.length})
      </h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 评论输入表单 */}
      {currentUser ? (
        <CommentForm 
          onSubmit={handleSubmitComment} 
          isSubmitting={submitting} 
        />
      ) : (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center text-gray-600">
          请先登录后再发表评论
        </div>
      )}

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无评论，快来发表第一条评论吧！
          </div>
        ) : (
          comments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 按时间倒序排列
            .map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onDelete={handleDeleteComment}
              />
            ))
        )}
      </div>
    </div>
  );
}
