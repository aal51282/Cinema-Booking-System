import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, X } from 'lucide-react'
import { Movie } from '@/util/types'

interface ReviewsSectionProps {
  reviews: Movie['reviews']
  onChange: (newReviews: Movie['reviews']) => void
}

export default function ReviewsSection({ reviews, onChange }: ReviewsSectionProps) {
  // const [reviewList, setReviewList] = useState(reviews)

  const handleReviewChange = (index: number, field: keyof Movie['reviews'][0], value: string | number) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    onChange(newReviews);
  };

  const addReview = () => {
    onChange([...reviews, { reviewer: '', comment: '', rating: 0 }]);
  };

  const removeReview = (index: number) => {
    const newReviews = reviews.filter((_, i) => i !== index);
    onChange(newReviews);
  };

  return (
    <div className="grid items-start gap-4">
      <Label>Reviews</Label>
      <div className="space-y-2">
        {reviews.map((review, index) => (
          <div key={index} className="flex items-start space-x-2">
            <Input
              placeholder="Reviewer"
              value={review.reviewer}
              onChange={(e) => handleReviewChange(index, 'reviewer', e.target.value)}
              className="flex-grow"
            />
            <Input
              placeholder="Comment"
              value={review.comment}
              onChange={(e) => handleReviewChange(index, 'comment', e.target.value)}
              className="flex-grow"
            />
            <Input
              type="number"
              placeholder="Rating"
              value={review.rating}
              onChange={(e) => handleReviewChange(index, 'rating', Number(e.target.value))}
              className="w-20"
              min="0"
              max="5"
              step="0.1"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeReview(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addReview}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Review
        </Button>
      </div>
    </div>
  )
}

