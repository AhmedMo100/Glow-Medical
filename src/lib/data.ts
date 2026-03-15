import type { Doctor, Service, BlogPost, Testimonial } from '@/types';

export const MOCK_DOCTORS: Doctor[] = [
  { id: 1, name: 'Dr. Sarah Mitchell', specialty: 'Cardiologist', experience: 14, bio: 'Board-certified cardiologist with 14 years of experience in preventive and interventional cardiology.', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop' },
  { id: 2, name: 'Dr. James Thornton', specialty: 'Neurologist', experience: 11, bio: 'Expert in neurological disorders with a focus on minimally invasive procedures and patient-centred care.', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop' },
  { id: 3, name: 'Dr. Layla Hassan', specialty: 'Dermatologist', experience: 9, bio: 'Specialist in medical and cosmetic dermatology helping patients achieve healthy, glowing skin.', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=500&fit=crop' },
  { id: 4, name: 'Dr. Robert Klein', specialty: 'Orthopedist', experience: 17, bio: 'Orthopedic surgeon specialising in joint replacement and sports medicine rehabilitation.', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=500&fit=crop' },
];

export const MOCK_SERVICES: Service[] = [
  { id: 1, title: 'Cardiology', description: 'Comprehensive heart care with advanced diagnostic tools and personalised treatment plans for lasting cardiac health.', icon: 'Heart' },
  { id: 2, title: 'Neurology', description: 'Expert neurological care covering stroke, epilepsy, headaches, and complex brain and spine conditions.', icon: 'Brain' },
  { id: 3, title: 'Dermatology', description: 'Medical and aesthetic skin treatments tailored to your unique skin type, concerns, and wellness goals.', icon: 'Sparkles' },
  { id: 4, title: 'Orthopedics', description: 'State-of-the-art bone, joint, and muscle care to restore mobility and improve your quality of life.', icon: 'Bone' },
  { id: 5, title: 'Ophthalmology', description: 'Complete eye care services from routine exams to advanced surgical procedures for clear, healthy vision.', icon: 'Eye' },
  { id: 6, title: 'Pediatrics', description: 'Dedicated child healthcare with a gentle, nurturing approach from infancy through adolescence.', icon: 'Baby' },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  { id: 1, name: 'Amira Saleh', review: 'Glow Medical completely changed my healthcare experience. The doctors are incredibly knowledgeable and the staff is warm and attentive.', rating: 5, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: 2, name: 'Mohamed Fathy', review: 'Outstanding care from start to finish. Dr. Mitchell spotted something other doctors had missed. I am truly grateful for the thorough attention I received.', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 3, name: 'Nour El-Din', review: 'The facility is world-class and the appointment process is seamless. I would not trust my family\'s health to anyone else.', rating: 5, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  { id: 1, title: 'Understanding Heart Health: 7 Habits to Adopt Today', slug: 'heart-health-habits', content: '', author: 'Dr. Sarah Mitchell', publishedAt: '2025-01-15', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop' },
  { id: 2, title: 'The Science Behind Glowing Skin at Every Age', slug: 'glowing-skin-science', content: '', author: 'Dr. Layla Hassan', publishedAt: '2025-01-28', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop' },
  { id: 3, title: 'Managing Chronic Pain: A Holistic Approach', slug: 'managing-chronic-pain', content: '', author: 'Dr. Robert Klein', publishedAt: '2025-02-10', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop' },
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
