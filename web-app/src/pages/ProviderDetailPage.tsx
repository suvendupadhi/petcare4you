import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Check,
  Calendar as CalendarIcon,
  MessageSquare,
  Building2,
  Image as ImageIcon,
  PawPrint
} from 'lucide-react';
import Layout from '../components/Layout';
import { 
  providerService, 
  availabilityService, 
  petService,
  appointmentService,
  recentProviderService,
  reviewService,
  Provider, 
  Availability,
  Pet,
  ServiceType,
  Review,
  Appointment
} from '../services/petCareService';

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [completedAppointmentId, setCompletedAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [providerData, availabilityData, petsData, reviewsData, appointmentsData] = await Promise.all([
          providerService.getProvider(parseInt(id)),
          availabilityService.getProviderAvailability(parseInt(id)),
          petService.getMyPets(),
          reviewService.getProviderReviews(parseInt(id)),
          appointmentService.getOwnerAppointments().catch(() => [])
        ]);
        setProvider(providerData);
        setAvailabilities(availabilityData.filter(a => !a.isBooked));
        setPets(petsData);
        setReviews(reviewsData);

        if (petsData.length > 0) setSelectedPet(petsData[0].id);
        recentProviderService.addRecentProvider(parseInt(id));

        // Check if user has a completed appointment with this provider that hasn't been reviewed
        const completedApt = appointmentsData.find(apt => 
          apt.providerId === parseInt(id) && 
          apt.status === 3 // Completed
        );
        
        if (completedApt) {
          const alreadyReviewed = reviewsData.some(r => r.appointmentId === completedApt.id);
          if (!alreadyReviewed) {
            setCanReview(true);
            setCompletedAppointmentId(completedApt.id);
          }
        }
      } catch (error) {
        console.error('Error loading provider details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedSlot || !selectedPet || !provider) {
      alert('Please select a time slot and a pet');
      return;
    }

    setBookingLoading(true);
    try {
      await appointmentService.createAppointment({
        providerId: provider.id,
        petId: selectedPet,
        appointmentDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        description: description,
        totalPrice: provider.hourlyRate, // Basic calculation
      });
      alert('Booking request sent successfully!');
      navigate('/appointments-owner');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!completedAppointmentId || !provider) return;
    
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        appointmentId: completedAppointmentId,
        providerId: provider.id,
        rating: userRating,
        comment: userComment
      });
      
      alert('Review submitted successfully!');
      setCanReview(false);
      setUserComment('');
      // Reload provider and reviews
      const [providerData, reviewsData] = await Promise.all([
        providerService.getProvider(provider.id),
        reviewService.getProviderReviews(provider.id)
      ]);
      setProvider(providerData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Profile...</div>;
  if (!provider) return <div className="flex items-center justify-center h-screen">Provider not found</div>;

  return (
    <Layout userType="owner">
      <div className="space-y-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-bold"
        >
          <ArrowLeft size={20} />
          Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-orange-600/5" />
              <div className="relative pt-8 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 bg-slate-100 rounded-3xl border-4 border-white shadow-md overflow-hidden flex-shrink-0">
                  {provider.profileImageUrl ? (
                    <img src={provider.profileImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Building2 size={64} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">{provider.companyName}</h1>
                      <div className="flex items-center gap-2 text-slate-500 mt-2">
                        <MapPin size={18} />
                        <span className="font-medium">{provider.address}, {provider.city}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold">
                        <Star size={16} fill="currentColor" />
                        {provider.rating.toFixed(1)}
                      </div>
                      <span className="text-xs text-slate-400 mt-1 font-bold">{provider.reviewCount} Reviews</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                      <DollarSign size={16} />
                      ${provider.hourlyRate}/hr
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                      <ShieldCheck size={16} />
                      Verified Provider
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                <h2 className="text-xl font-bold text-slate-800">About the Provider</h2>
                <p className="text-slate-600 leading-relaxed">{provider.description}</p>
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Services Offered</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {provider.serviceTypes?.map(st => (
                    <div key={st.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-orange-600 shadow-sm">
                        <Check size={16} />
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{st.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">Reviews ({reviews.length})</h2>
                </div>

                {canReview && (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                    <h3 className="font-bold text-slate-800">Rate your experience</h3>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="text-yellow-500 transition-transform hover:scale-110"
                        >
                          <Star size={32} fill={star <= userRating ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Tell others about your experience..."
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 h-32"
                    />
                    <button
                      onClick={handleReviewSubmit}
                      disabled={submittingReview || !userComment.trim()}
                      className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-md hover:bg-orange-700 transition-all disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {reviews.length > 0 ? reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                            {review.owner?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{review.owner?.firstName} {review.owner?.lastName}</div>
                            <div className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
                          <Star size={14} fill="currentColor" />
                          {review.rating}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  )) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                      <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No reviews yet. Be the first to leave one!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Placeholder - Commented out
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon size={24} className="text-slate-400" />
                Photo Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                    <ImageIcon size={32} />
                  </div>
                ))}
              </div>
            </div>
            */}
          </div>

          {/* Right Column: Booking Widget */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg space-y-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-800">Book a Service</h2>
              
              {/* Pet Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <PawPrint size={16} />
                  Select Your Pet
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {pets.map(pet => (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPet(pet.id)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all truncate ${
                        selectedPet === pet.id 
                          ? 'bg-orange-600 border-orange-600 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-orange-300'
                      }`}
                    >
                      {pet.name}
                    </button>
                  ))}
                </div>
                {pets.length === 0 && (
                  <button 
                    onClick={() => navigate('/profile-owner')}
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    + Add a pet first
                  </button>
                )}
              </div>

              {/* Time Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <Clock size={16} />
                  Available Slots
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availabilities.length > 0 ? availabilities.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full p-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-between ${
                        selectedSlot?.id === slot.id 
                          ? 'bg-orange-50 border-orange-600 text-orange-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={14} />
                        {new Date(slot.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs">{slot.startTime} - {slot.endTime}</div>
                    </button>
                  )) : (
                    <div className="text-center py-4 text-xs text-slate-400 font-medium">
                      No available slots found.
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Booking Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Special instructions for the provider..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                />
              </div>

              {/* Summary */}
              {selectedSlot && (
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Service Fee</span>
                    <span className="font-bold text-slate-700">${provider.hourlyRate}</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-orange-600">${provider.hourlyRate}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={bookingLoading || !selectedSlot || !selectedPet}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {bookingLoading ? 'Processing...' : 'Request Booking'}
              </button>
              <p className="text-[10px] text-center text-slate-400 font-medium">
                You won't be charged until the provider confirms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
