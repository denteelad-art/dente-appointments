export interface Patient {
  id: string; // Internal unique patient reference
  nationalId: string; // Professional ID entered by the clinic
  firstName: string;
  familyName: string;
  city: string;
  phoneNumber: string;
  createdAt: string;
  representative?: string; // Clinic representative registered under this client
}

export interface Appointment {
  id: string;
  patientId: string;
  title: string;
  start: string; // ISO date string (YYYY-MM-DDTHH:mm:ss)
  end: string;   // ISO date string (YYYY-MM-DDTHH:mm:ss)
  firstReminder: boolean;     // Confirms booking for tomorrow (triggers V / Checkmark icon)
  finalConfirmation: boolean; // Next day follow-up call confirmed (triggers Airplane icon)
  notes?: string;
  color?: 'mint' | 'orange' | 'pink'; // Custom pastel colors requested by user
  arrivalConfirmed?: boolean; // Highlighted icon to indicate patient confirmed attendance (✓✓ Double V)
  dealClosed?: boolean;       // Patient closed a deal and paid (👑 Crown)
  dealAmount?: number;        // NEW: Sum of the closed deal
  jawPromotion?: 'none' | 'one' | 'two'; // NEW: Campaign jaw selection
  bookedBy?: string;          // Name of the clinic representative who booked the appointment
  smsStatus?: 'idle' | 'pending' | 'sent' | 'failed';
  smsTextSent?: string;
  noShow?: boolean; // NEW: Representative missed the meeting / did not show up (🚫 or ❌ icon)
}

export interface Representative {
  id: string;
  name: string;
  gender: 'male' | 'female';
  role: 'admin' | 'representative';
  createdAt: string;
}
