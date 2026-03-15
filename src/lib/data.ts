import type { Doctor } from '@/types';

export const MOCK_DOCTORS: Doctor[] = [
  { id: 1, name: 'Dr. Sarah Mitchell', specialty: 'Cardiologist', experience: 14, bio: 'Board-certified cardiologist with 14 years of experience in preventive and interventional cardiology.', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop' },
  { id: 2, name: 'Dr. James Thornton', specialty: 'Neurologist', experience: 11, bio: 'Expert in neurological disorders with a focus on minimally invasive procedures and patient-centred care.', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop' },
  { id: 3, name: 'Dr. Layla Hassan', specialty: 'Dermatologist', experience: 9, bio: 'Specialist in medical and cosmetic dermatology helping patients achieve healthy, glowing skin.', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=500&fit=crop' },
  { id: 4, name: 'Dr. Robert Klein', specialty: 'Orthopedist', experience: 17, bio: 'Orthopedic surgeon specialising in joint replacement and sports medicine rehabilitation.', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=500&fit=crop' },
];

export const STATS = [
  { value: '25+', label: 'Years of Excellence' },
  { value: '120+', label: 'Expert Physicians' },
  { value: '98%', label: 'Patient Satisfaction' },
  { value: '50K+', label: 'Lives Transformed' },
];

export const SERVICES_LIST = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Orthopedics',
  'Ophthalmology',
  'Pediatrics',
  'Gynecology',
];
