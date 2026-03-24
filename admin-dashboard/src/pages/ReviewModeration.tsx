import { useState, useEffect } from 'react';
import api from '../services/api';
import { Star, MessageSquare, Trash2, FastForward } from 'lucide-react';
import { getImageUrl, FOOD_PLACEHOLDER, onImageError } from '../utils/imageUtils';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
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
                  <div className="flex gap-4 items-start">
                     <div className="h-16 w-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm bg-gray-50">
                        <img 
                           src={getImageUrl(review.menuItem?.image) || FOOD_PLACEHOLDER} 
                           alt={review.menuItem?.name}
                           className="h-full w-full object-cover"
                           onError={onImageError}
                        />
                     </div>
                     <div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                           <h3 className="font-bold text-gray-900">{review.user?.name || 'Anonymous'}</h3>
                           <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase font-semibold">reviewed</span>
                           <h4 className="text-primary font-bold text-sm">{review.menuItem?.name || 'Unknown Dish'}</h4>
                           <div className="flex items-center text-amber-500 ml-2">
                              {[...Array(5)].map((_, i) => (
                                 <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                              ))}
                           </div>
                        </div>
                        <p className="text-gray-600 mt-2 text-sm italic leading-relaxed">"{review.comment || 'No comment provided.'}"</p>
                        <span className="text-[10px] text-gray-400 mt-2 block font-medium">{new Date(review.createdAt).toLocaleString()}</span>
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
