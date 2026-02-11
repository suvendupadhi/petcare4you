import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  PawPrint, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  ChevronRight,
  Camera
} from 'lucide-react';
import Layout from '../components/Layout';
import { 
  userService, 
  petService, 
  User as UserType, 
  Pet, 
  PetType, 
  Breed 
} from '../services/petCareService';

export default function ProfileOwnerPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: ''
  });

  // Pet Modal state
  const [showPetModal, setShowPetModal] = useState(false);
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [petForm, setPetForm] = useState({
    name: '',
    petTypeId: 0,
    breedId: 0,
    age: 0,
    weight: 0,
    medicalNotes: ''
  });

  useEffect(() => {
    loadData();
    petService.getPetTypes().then(setPetTypes).catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      const [userData, petsData] = await Promise.all([
        userService.getCurrentUser(),
        petService.getMyPets()
      ]);
      setProfile(userData);
      setPets(petsData);
      setEditForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || ''
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await userService.updateProfile(editForm);
      setEditMode(false);
      loadData();
      alert('Profile updated successfully');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handlePetTypeChange = async (typeId: number) => {
    setPetForm({ ...petForm, petTypeId: typeId, breedId: 0 });
    try {
      const breedsData = await petService.getBreeds(typeId);
      setBreeds(breedsData);
    } catch (error) {
      console.error('Error loading breeds:', error);
    }
  };

  const handleAddPet = async () => {
    try {
      await petService.createPet(petForm);
      setShowPetModal(false);
      loadData();
      setPetForm({ name: '', petTypeId: 0, breedId: 0, age: 0, weight: 0, medicalNotes: '' });
      alert('Pet added successfully!');
    } catch (error) {
      alert('Failed to add pet');
    }
  };

  const handleDeletePet = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this pet?')) {
      try {
        await petService.deletePet(id);
        loadData();
      } catch (error) {
        alert('Failed to delete pet');
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Profile...</div>;

  return (
    <Layout userType="owner">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <User size={24} className="text-orange-600" />
              Personal Information
            </h2>
            <button 
              onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                editMode ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {editMode ? <><Save size={18} /> Save Changes</> : <><Edit size={18} /> Edit Profile</>}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 border-dashed relative group">
              <div className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-slate-400">
                {profile?.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} />
                )}
              </div>
              <button className="absolute bottom-6 right-1/2 translate-x-12 p-2 bg-orange-600 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                <Camera size={18} />
              </button>
              <div className="mt-4 text-center">
                <div className="text-lg font-bold text-slate-900">{profile?.firstName} {profile?.lastName}</div>
                <div className="text-sm text-slate-500">{profile?.email}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                {editMode ? (
                  <input 
                    type="text" 
                    value={editForm.firstName} 
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <div className="text-slate-700 font-semibold">{profile?.firstName}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                {editMode ? (
                  <input 
                    type="text" 
                    value={editForm.lastName} 
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <div className="text-slate-700 font-semibold">{profile?.lastName}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                {editMode ? (
                  <input 
                    type="text" 
                    value={editForm.phoneNumber} 
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <div className="text-slate-700 font-semibold">{profile?.phoneNumber || 'Not provided'}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Home Address</label>
                {editMode ? (
                  <input 
                    type="text" 
                    value={editForm.address} 
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <div className="text-slate-700 font-semibold">{profile?.address || 'Not provided'}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pets Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <PawPrint size={24} className="text-orange-600" />
              My Pets ({pets.length})
            </h2>
            <button 
              onClick={() => setShowPetModal(true)}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all"
            >
              <Plus size={18} />
              Add Pet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pets.map(pet => (
              <div key={pet.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4 group">
                <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-2xl">
                  {pet.profileImageUrl ? (
                    <img src={pet.profileImageUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    pet.name[0]
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-slate-900">{pet.name}</h3>
                    <button 
                      onClick={() => handleDeletePet(pet.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-sm text-slate-500 font-medium">{pet.petType?.name} • {pet.breed?.name}</div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-xs text-slate-400">
                      <span className="font-bold text-slate-600">{pet.age}</span> Years
                    </div>
                    <div className="text-xs text-slate-400">
                      <span className="font-bold text-slate-600">{pet.weight}</span> kg
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {pets.length === 0 && (
              <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-2">
                <div className="text-slate-300 flex justify-center"><PawPrint size={48} /></div>
                <div className="font-bold text-slate-500">No pets added yet</div>
                <p className="text-sm text-slate-400">Add your first pet to start booking services.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Pet Modal */}
      {showPetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Add New Pet</h3>
              <button onClick={() => setShowPetModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Pet Name</label>
                <input 
                  type="text" 
                  value={petForm.name}
                  onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                  placeholder="e.g. Buddy"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Pet Type</label>
                  <select 
                    value={petForm.petTypeId}
                    onChange={(e) => handlePetTypeChange(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={0}>Select Type</option>
                    {petTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Breed</label>
                  <select 
                    value={petForm.breedId}
                    onChange={(e) => setPetForm({ ...petForm, breedId: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={!petForm.petTypeId}
                  >
                    <option value={0}>Select Breed</option>
                    {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Age (Years)</label>
                  <input 
                    type="number" 
                    value={petForm.age}
                    onChange={(e) => setPetForm({ ...petForm, age: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={petForm.weight}
                    onChange={(e) => setPetForm({ ...petForm, weight: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Medical Notes</label>
                <textarea 
                  value={petForm.medicalNotes}
                  onChange={(e) => setPetForm({ ...petForm, medicalNotes: e.target.value })}
                  placeholder="Allergies, medications, etc."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowPetModal(false)}
                className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddPet}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700"
              >
                Add Pet
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
