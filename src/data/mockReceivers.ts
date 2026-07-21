import type {BadgeTone} from '../components/ui';

export type ReceiverStatus = 'Active' | 'Inactive' | 'Pending Review';

export type ReceiverListItem = {
  id: string;
  name: string;
  level: number;
  status: ReceiverStatus;
  totalHours: number;
  earnings: number;
};

export type KycDocument = {
  id: string;
  title: string;
  sizeLabel: string;
  thumbnail: string;
  url?: string;
};

export type ReceiverProfile = ReceiverListItem & {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bio: string;
  languages: string[];
  photos: string[];
  submittedAgo: string;
  bank: {
    holderName: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };
  kyc: {
    videoUrl?: string;
    videoThumb: string;
    documents: KycDocument[];
  };
};

export function levelTone(level: number): BadgeTone {
  if (level <= 1) return 'level1';
  if (level === 2) return 'level2';
  return 'level3';
}

export function statusTone(status: ReceiverStatus): BadgeTone {
  if (status === 'Active') return 'success';
  if (status === 'Pending Review') return 'pending';
  return 'neutral';
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

const PHOTO_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-64432c78bfcd?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7ddece?w=200&h=200&fit=crop',
];

const DOC_THUMB =
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=120&h=160&fit=crop';

export const RECEIVER_STATS = [
  {id: 'total', label: 'Total Receivers', value: '5'},
  {id: 'active', label: 'Active', value: '4'},
  {id: 'calls', label: 'Total Calls', value: '786'},
  {id: 'earnings', label: 'Total Earnings', value: '₹1,49,380'},
];

export const RECEIVERS: ReceiverProfile[] = [
  {
    id: 'RCV-100',
    name: 'Priya Sharma',
    level: 2,
    status: 'Pending Review',
    totalHours: 142,
    earnings: 24680,
    age: 24,
    gender: 'Female',
    bio: 'Friendly and energetic conversationalist who loves music, travel stories, and helping people unwind after a long day.',
    languages: ['Hindi', 'English', 'Bengali'],
    photos: PHOTO_PLACEHOLDERS,
    submittedAgo: '2 hours ago',
    bank: {
      holderName: 'Priya Sharma',
      accountNumber: 'XXXXXX4821',
      ifsc: 'HDFC0001234',
      upiId: 'priya.sharma@upi',
    },
    kyc: {
      videoThumb: PHOTO_PLACEHOLDERS[0],
      documents: [
        {id: 'aadhaar', title: 'Aadhaar Card', sizeLabel: '523 kb', thumbnail: DOC_THUMB},
        {id: 'pan', title: 'PAN Card', sizeLabel: '412 kb', thumbnail: DOC_THUMB},
        {id: 'passbook', title: 'Bank Passbook', sizeLabel: '680 kb', thumbnail: DOC_THUMB},
      ],
    },
  },
  {
    id: 'RCV-200',
    name: 'Ananya Patel',
    level: 3,
    status: 'Active',
    totalHours: 198,
    earnings: 38230,
    age: 26,
    gender: 'Female',
    bio: 'Warm and witty companion who enjoys movies, fitness chat, and meaningful conversations.',
    languages: ['Hindi', 'English', 'Gujarati'],
    photos: PHOTO_PLACEHOLDERS,
    submittedAgo: '1 day ago',
    bank: {
      holderName: 'Ananya Patel',
      accountNumber: 'XXXXXX1190',
      ifsc: 'ICIC0002211',
      upiId: 'ananya.patel@upi',
    },
    kyc: {
      videoThumb: PHOTO_PLACEHOLDERS[1],
      documents: [
        {id: 'aadhaar', title: 'Aadhaar Card', sizeLabel: '498 kb', thumbnail: DOC_THUMB},
        {id: 'pan', title: 'PAN Card', sizeLabel: '390 kb', thumbnail: DOC_THUMB},
        {id: 'passbook', title: 'Bank Passbook', sizeLabel: '710 kb', thumbnail: DOC_THUMB},
      ],
    },
  },
  {
    id: 'RCV-300',
    name: 'Kavya Reddy',
    level: 1,
    status: 'Active',
    totalHours: 87,
    earnings: 12450,
    age: 22,
    gender: 'Female',
    bio: 'Cheerful and soft-spoken, great for casual evening chats and music recommendations.',
    languages: ['Telugu', 'English', 'Hindi'],
    photos: PHOTO_PLACEHOLDERS.slice(0, 4),
    submittedAgo: '3 days ago',
    bank: {
      holderName: 'Kavya Reddy',
      accountNumber: 'XXXXXX7742',
      ifsc: 'SBIN0004455',
      upiId: 'kavya.reddy@upi',
    },
    kyc: {
      videoThumb: PHOTO_PLACEHOLDERS[2],
      documents: [
        {id: 'aadhaar', title: 'Aadhaar Card', sizeLabel: '540 kb', thumbnail: DOC_THUMB},
        {id: 'pan', title: 'PAN Card', sizeLabel: '401 kb', thumbnail: DOC_THUMB},
        {id: 'passbook', title: 'Bank Passbook', sizeLabel: '655 kb', thumbnail: DOC_THUMB},
      ],
    },
  },
  {
    id: 'RCV-400',
    name: 'Meera Singh',
    level: 2,
    status: 'Active',
    totalHours: 156,
    earnings: 28900,
    age: 25,
    gender: 'Female',
    bio: 'Calm listener with a passion for books, cooking, and thoughtful late-night conversations.',
    languages: ['Hindi', 'English'],
    photos: PHOTO_PLACEHOLDERS,
    submittedAgo: '5 days ago',
    bank: {
      holderName: 'Meera Singh',
      accountNumber: 'XXXXXX3308',
      ifsc: 'AXIS0007788',
      upiId: 'meera.singh@upi',
    },
    kyc: {
      videoThumb: PHOTO_PLACEHOLDERS[3],
      documents: [
        {id: 'aadhaar', title: 'Aadhaar Card', sizeLabel: '510 kb', thumbnail: DOC_THUMB},
        {id: 'pan', title: 'PAN Card', sizeLabel: '377 kb', thumbnail: DOC_THUMB},
        {id: 'passbook', title: 'Bank Passbook', sizeLabel: '690 kb', thumbnail: DOC_THUMB},
      ],
    },
  },
  {
    id: 'RCV-500',
    name: 'Diya Jain',
    level: 3,
    status: 'Inactive',
    totalHours: 203,
    earnings: 45120,
    age: 27,
    gender: 'Female',
    bio: 'Expressive and fun — loves fashion talk, travel tips, and keeping conversations lively.',
    languages: ['Hindi', 'English', 'Marathi'],
    photos: PHOTO_PLACEHOLDERS,
    submittedAgo: '1 week ago',
    bank: {
      holderName: 'Diya Jain',
      accountNumber: 'XXXXXX9055',
      ifsc: 'KKBK0003322',
      upiId: 'diya.jain@upi',
    },
    kyc: {
      videoThumb: PHOTO_PLACEHOLDERS[4],
      documents: [
        {id: 'aadhaar', title: 'Aadhaar Card', sizeLabel: '560 kb', thumbnail: DOC_THUMB},
        {id: 'pan', title: 'PAN Card', sizeLabel: '420 kb', thumbnail: DOC_THUMB},
        {id: 'passbook', title: 'Bank Passbook', sizeLabel: '702 kb', thumbnail: DOC_THUMB},
      ],
    },
  },
];

/** List view rows matching Figma Receivers table */
export const RECEIVER_TABLE_ROWS: ReceiverListItem[] = [
  {id: 'RCV-100', name: 'Priya Sharma', level: 2, status: 'Active', totalHours: 142, earnings: 24680},
  {id: 'RCV-200', name: 'Ananya Patel', level: 3, status: 'Active', totalHours: 198, earnings: 38230},
  {id: 'RCV-300', name: 'Kavya Reddy', level: 1, status: 'Active', totalHours: 87, earnings: 12450},
  {id: 'RCV-400', name: 'Meera Singh', level: 2, status: 'Active', totalHours: 156, earnings: 28900},
  {id: 'RCV-500', name: 'Diya Jain', level: 3, status: 'Inactive', totalHours: 203, earnings: 45120},
];

export type PendingApprovalRow = {
  id: string;
  name: string;
  photoCount: number;
  submittedAgo: string;
};

export const PENDING_APPROVAL_ROWS: PendingApprovalRow[] = [
  {id: 'RCV-100', name: 'Priya Sharma', photoCount: 5, submittedAgo: '2 hours ago'},
  {id: 'RCV-200', name: 'Ananya Patel', photoCount: 6, submittedAgo: '5 hours ago'},
  {id: 'RCV-300', name: 'Kavya Reddy', photoCount: 4, submittedAgo: '1 day ago'},
  {id: 'RCV-400', name: 'Meera Singh', photoCount: 5, submittedAgo: '1 day ago'},
  {id: 'RCV-500', name: 'Diya Jain', photoCount: 6, submittedAgo: '2 days ago'},
];

export function getReceiverById(id: string): ReceiverProfile | undefined {
  return RECEIVERS.find(receiver => receiver.id === id);
}

export type ReceiverCredentials = {
  loginId: string;
  temporaryPassword: string;
};

export function getReceiverCredentials(
  receiver: Pick<ReceiverProfile, 'id' | 'name'>,
): ReceiverCredentials {
  const slug = receiver.name.trim().toLowerCase().replace(/\s+/g, '');
  return {
    loginId: `${slug}@callkaro.com`,
    temporaryPassword: `${slug}@callkaro`,
  };
}
