import React, { useState } from 'react';
import { Appointment, Doctor, Patient, Review } from '../types';
import Modal from './Modal';
import Spinner from './Spinner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id'>) => Promise<void>;
  appointment: Appointment;
  patient: Patient;
  doctor: Doctor;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, appointment, patient, doctor }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    await onSubmit({
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentId: appointment.id,
      rating,
      comment,
      date: new Date().toISOString(),
    });
    // Parent handles closing modal, component will unmount
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review for ${doctor.name}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Your overall rating</p>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Share your experience
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3"
            placeholder={`What did you like or dislike about your appointment with ${doctor.name}?`}
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-75"
          >
            {isSubmitting ? <Spinner size="sm" color="text-white" /> : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;
