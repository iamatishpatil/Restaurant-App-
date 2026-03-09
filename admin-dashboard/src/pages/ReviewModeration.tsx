import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageSquare, Trash2 } from 'lucide-react';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Review Moderation</h1>
          <p className="text-gray-500">Monitor and manage customer feedback.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y overflow-hidden min-h-[300px] flex flex-col">
        {isLoading && !reviews.length ? (
           <div className="flex-1 flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-500">Loading feedback...</p>
           </div>
        ) : reviews.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              No customer reviews found.
           </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="p-6 hover:bg-gray-50 transition">
               <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                     <div className="bg-primary/10 p-2 rounded-lg h-10 w-10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-gray-800">{review.user?.name || 'Anonymous'}</h3>
                           <div className="flex items-center text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                 <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                              ))}
                           </div>
                        </div>
                        <p className="text-gray-600 mt-1">{review.comment || 'No comment provided.'}</p>
                        <span className="text-xs text-gray-400 mt-2 block">{new Date(review.createdAt).toLocaleString()}</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleDelete(review.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-5 w-5" /></button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewModeration;
