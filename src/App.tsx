import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Plus, 
  Users, 
  Calendar as CalendarIcon, 
  Check, 
  Plane, 
  ShieldCheck, 
  Clock, 
  Activity,
  AlertCircle,
  LogIn,
  LogOut,
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  User as UserIcon,
  Lock,
  Database,
  RefreshCw,
  Search,
  Trash,
  Edit3,
  Crown
} from 'lucide-react';

import { Patient, Appointment, Representative } from './types';
import PatientForm from './components/PatientForm';
import AppointmentModal from './components/AppointmentModal';

import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, deleteDoc, onSnapshot, collection, getDocFromServer } from 'firebase/firestore';

// Recharts components for beautiful responsive sales performance and admin metrics visualization
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Custom 80s Rock Anthem Synthesizer in Web Audio API.
 * Synthesizes a premium motivational driving rock anthem with drums (Kick, Snare, Hats)
 * and deep detuned analog supersaw chords to excite and motivate the team!
 */
const playDenteRockAnthem = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Main compression & master glue to blend synthesizers beautifully
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, ctx.currentTime);
    compressor.knee.setValueAtTime(12, ctx.currentTime);
    compressor.ratio.setValueAtTime(4, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.08, ctx.currentTime);
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, ctx.currentTime); // perfectly balanced sweet dynamic volume
    
    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);
    
    // Fast generation of high quality white noise for snares and cymbal hats
    const bufferSize = ctx.sampleRate * 2.0;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    // 1. Kick Drum Synthesizer (deep warm punchy sine sweep)
    const triggerKick = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(compressor);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime + time);
      osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + time + 0.12);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.22);
      
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.25);
    };
    
    // 2. Snare Synthesizer (classic gated rock snare sound)
    const triggerSnare = (time: number, isHuge = false) => {
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(950, ctx.currentTime + time);
      noiseFilter.Q.setValueAtTime(1.6, ctx.currentTime + time);
      
      const noiseGain = ctx.createGain();
      const snareDecay = isHuge ? 0.38 : 0.26;
      
      noiseGain.gain.setValueAtTime(0, ctx.currentTime + time);
      noiseGain.gain.linearRampToValueAtTime(0.42, ctx.currentTime + time + 0.008);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + snareDecay);
      
      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(compressor);
      
      // Pitch/Tone element for the drum meat sound
      const toneOsc = ctx.createOscillator();
      const toneGain = ctx.createGain();
      
      toneOsc.type = 'triangle';
      toneOsc.frequency.setValueAtTime(175, ctx.currentTime + time);
      toneOsc.frequency.exponentialRampToValueAtTime(95, ctx.currentTime + time + 0.09);
      
      toneGain.gain.setValueAtTime(0, ctx.currentTime + time);
      toneGain.gain.linearRampToValueAtTime(0.48, ctx.currentTime + time + 0.005);
      toneGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.18);
      
      toneOsc.connect(toneGain);
      toneGain.connect(compressor);
      
      noiseNode.start(ctx.currentTime + time);
      noiseNode.stop(ctx.currentTime + time + 0.45);
      toneOsc.start(ctx.currentTime + time);
      toneOsc.stop(ctx.currentTime + time + 0.22);
    };
    
    // 3. Hi-Hat Synthesizer (clean crisp clock tick)
    const triggerHat = (time: number) => {
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(8200, ctx.currentTime + time);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.045);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(compressor);
      
      source.start(ctx.currentTime + time);
      source.stop(ctx.currentTime + time + 0.08);
    };

    // 4. Premium Polyphonic Supersaw Synth Voice with Resonant Dynamic Filter Sweep
    const playPowerChord = (rootFreq: number, startTime: number, duration: number) => {
      const isMinor = true;
      const thirdFactor = isMinor ? 1.1892 : 1.2599; // Classic rock chord intervals
      
      // Warm chord voicing: Deep Sub, Core Root, Minor 3rd, Fifth, Double Octave, Higher 10th
      const notes = [
        rootFreq * 0.5,
        rootFreq,
        rootFreq * thirdFactor,
        rootFreq * 1.5,
        rootFreq * 2.0,
        rootFreq * 2.0 * thirdFactor,
      ];
      
      notes.forEach((freq, index) => {
        // Multi-voice detuning to create thick acoustic analog chorusing width
        const voiceCount = 2;
        for (let v = 0; v < voiceCount; v++) {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          const filterNode = ctx.createBiquadFilter();
          
          osc.type = index === 0 ? 'sine' : 'sawtooth'; // Deep sub is clean sine; main chord is rich sawtooth
          
          // Micro detune coefficients (detuning voices for rich stereo width feeling)
          const detuneCoeff = 1 + (v === 0 ? 0.0038 : -0.0038) + (index * 0.001);
          osc.frequency.setValueAtTime(freq * detuneCoeff, ctx.currentTime + startTime);
          
          // Organic brief pitch glide up/down on strike
          osc.frequency.exponentialRampToValueAtTime(freq * detuneCoeff * 1.009, ctx.currentTime + startTime + 0.08);
          osc.frequency.exponentialRampToValueAtTime(freq * detuneCoeff, ctx.currentTime + startTime + 0.28);
          
          // Classic analog resonant LPF envelope sweep
          filterNode.type = 'lowpass';
          filterNode.Q.setValueAtTime(4.2, ctx.currentTime + startTime); // beautiful resonance sweep
          filterNode.frequency.setValueAtTime(260, ctx.currentTime + startTime);
          filterNode.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + startTime + 0.09); // filter opens
          filterNode.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + startTime + duration); // sweeps back down
          
          // Gain Amplitude Envelope
          gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
          gainNode.gain.linearRampToValueAtTime(0.19, ctx.currentTime + startTime + 0.04); // solid attack punch
          gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + startTime + 0.15); // gentle decay
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration); // ringout
          
          osc.connect(filterNode);
          filterNode.connect(gainNode);
          gainNode.connect(compressor);
          
          osc.start(ctx.currentTime + startTime);
          osc.stop(ctx.currentTime + startTime + duration);
        }
      });
    };

    // Riff note frequencies (A minor pentatonic driving sequence)
    const A = 220.00; // Am
    const G = 196.00; // G
    const F = 174.61; // F

    // Beat timeline (BPM ~110, step duration is 0.54s)
    const step = 0.54;
    
    // Beat loops (Total 14 beats = exactly ~7.56 seconds duration)
    for (let beat = 0; beat < 14; beat++) {
      const time = beat * step;
      
      // Drum Kick schedule (steady pulse on 1 & 3, with motivational double kick)
      if (beat % 2 === 0) {
        triggerKick(time);
      }
      if (beat === 1 || beat === 5 || beat === 9 || beat === 13) {
        triggerKick(time + step * 0.5); // double kick push
      }
      
      // Drum Snare schedule (steady driving snare on 2 & 4, final hit is huge)
      if (beat % 2 === 1) {
        triggerSnare(time, beat === 13);
      }
      
      // Running crisp hi-hats
      triggerHat(time);
      triggerHat(time + step * 0.5);
    }
    
    // Choreographed motivational rock riff timeline:
    // Bar 1
    playPowerChord(A, 0.0 * step, 0.95 * step); // Heavy intro hit
    
    // Bar 2
    playPowerChord(A, 2.0 * step, 0.45 * step);
    playPowerChord(G, 2.5 * step, 0.45 * step);
    playPowerChord(A, 3.0 * step, 1.35 * step);
    
    // Bar 3
    playPowerChord(A, 5.0 * step, 0.45 * step);
    playPowerChord(G, 5.5 * step, 0.45 * step);
    playPowerChord(F, 6.0 * step, 1.35 * step);
    
    // Bar 4 (Build-up)
    playPowerChord(F, 8.0 * step, 0.45 * step);
    playPowerChord(G, 8.5 * step, 1.85 * step); // rising tone
    
    // Bar 5 (Resolving ultimate peak motivational power chord!)
    playPowerChord(A, 11.0 * step, 2.75 * step); // Holds strong to the end (~7.5s)

  } catch (err) {
    console.warn("Failed to play synth opening anthem:", err);
  }
};

// --- 30 PREMIUM GENDER-TAILORED MOTIVATIONAL SALES QUOTES (FEMALE) ---
const MOTIVATIONAL_FEMALE_QUOTES = [
  "בוקר מנצח אלופה! האנרגיה והחיוך שלך בטלפון הם המנוע האמיתי של סגירת המכירות היום, קדימה!",
  "אלופה, כל שיחת טלפון היא הזדמנות לעזור לעוד מטופל לקבל החלטה בריאה ונכונה עבורו.",
  "זכרי: כל התנגדות מהלקוח היא לא מילה סופית אלא הזדמנות מצוינת להראות לו את הערך שלנו.",
  "אין אתגר שיכול לעמוד בפני הסבלנות והחיוך שאת מביאה איתך לכל שיחה ושיחה.",
  "שמרי על קלף המקצועיות שלך קרוב ללב: להקשיב לצרכי המטופל זו האמנות האמיתית של המכירה.",
  "כל שיחה שעשית מקרבת אותך לסגירה הבאה. התעקשות מנומסת ועקביות מביאות את העסקאות!",
  "את לא סתם יוצרת פגישה – את מעניקה למטופל הזדמנות לשפר את איכות חייו ואת הבריאות שלו.",
  "שימי לב לטון הדיבור שלך – הרוגע והביטחון שלך מדבקים ומעניקים שקט נפשי למטופלים.",
  "כל יום הוא דף נקי שבו את יכולה לקבוע את השיא החדש של עצמך. לכי על זה בכל הכוח!",
  "מדהימה! את הופכת התלבטויות לפגישות ייעוץ מוצלחות בזכות חדות, רגישות והבנה עמוקה.",
  "מכירות מעולות מתחילות ביצירת קשר אישי חם בשניות הראשונות בשיחה – ואת פשוט מעולה בזה!",
  "כשאת מציגה את המחיר של הטיפול, תזכרי תמיד שאת מציגה את השקט והביטחון שהם קונים.",
  "ממשיכה תמיד בנחישות! כל סגירה טובה מתחילה בלב אמין שרוצה לעזור ולתת את הפתרון הטוב ביותר.",
  "אלופה, אין שום דבר שאת לא יכולה להשיג היום. התמקדי, חייכי, והעסקאות יזרמו בהתאם!",
  "זכרי: הצלחה נוצרת מעבודה שיטתית, סדר ועיקשות בריאה בתיאום תורים ובשיחות מעקב.",
  "כאשר הלקוח חש את האכפתיות הכנה שבקול שלך, כל מחסום וחצץ נעלמים ברגע.",
  "כוח העל שלך הוא היכולת לחבר אנשים להזדמנות הנכונה בזמן הנכון. האמיני בעצמך!",
  "שום שיחת לא מבוזבזת – כולם שומעים את המותג החזק שלנו, וההשפעה שלך נשמרת לטווח הרחוק.",
  "שילוב קסום של שירות מעומק הלב עם מקצועיות של ברזל הופך אותך לנציגה הכי חזקה במרפאה.",
  "אל תוותרי על המשך מעקב ופולו-אפ! רוב העסקאות הכי גדולות נסגרות בדיוק בסבלנות הנוספת הזו.",
  "יום פורה ומלא בסגירות מצפה לך! קחי נשימה עמוקה, האירי את היום של המטופלים ותנצחי.",
  "זכרי שהמילים שלך בונות את הבטחון של המטופלים במרפאה עוד לפני שהם דרכו בה פעם אחת.",
  "נחישות מתגברת על כל מכשול. תהיי בטוחה בערך המוביל והאיכות של הסניף שלנו.",
  "כל תיאום תור שנעשה היום משפר למטופל את החיוך החל ממחר. משימה קדושה ומנצחת!",
  "הביטי קדימה והציבי מטרות גבוהות. את מסוגלת להגיע לכל יעד מכירות שיובא לפנייך.",
  "אלופה, כל הצלחה שמגיעה היא תוצאה מוצדקת של העבודה והלב שהשקעת בטיפול בשיחה.",
  "מכירות מבוססות על מציאת פתרונות אמיתיים, והיצירתיות שלך פותרת בעיות בצורה מדהימה.",
  "כשאת פותחת שיחה בחיבוק קולי ואנרגיה מדהימה, הלקוחות פשוט נפתחים ומקשיבים לך.",
  "את המלכה של המשרד היום! המשיכי להנחות את המטופלים ברוגע והובילי את טבלת ההצלחות.",
  "כל יום מחדש את מוכיחה שהשילוב של חיוך ואכפתיות אמיתית היא הדרך הקלה והבטוחה לסגירה!"
];

// --- 30 PREMIUM GENDER-TAILORED MOTIVATIONAL SALES QUOTES (MALE) ---
const MOTIVATIONAL_MALE_QUOTES = [
  "בוקר מנצח אלוף! האנרגיה והחיוך שלך בטלפון הם המנוע האמיתי של סגירת המכירות היום, קדימה!",
  "אלוף, כל שיחת טלפון היא הזדמנות לעזור לעוד מטופל לקבל החלטה בריאה ונכונה עבורו.",
  "זכור: כל התנגדות מהלקוח היא לא מילה סופית אלא הזדמנות מצוינת להראות לו את הערך שלנו.",
  "אין אתגר שיכול לעמוד בפני הסבלנות והחיוך שאתה מביא איתך לכל שיחה ושיחה.",
  "שמור על קלף המקצועיות שלך קרוב ללב: להקשיב לצרכי המטופל זו האמנות האמיתית של המכירה.",
  "כל שיחה שעשית מקרבת אותך לסגירה הבאה. התעקשות מנומסת ועקביות מביאות את העסקאות!",
  "אתה לא סתם יוצר פגישה – אתה מעניק למטופל הזדמנות לשפר את איכות חייו ואת הבריאות שלו.",
  "שים לב לטון הדיבור שלך – הרוגע והביטחון שלך מדבקים ומעניקים שקט נפשי למטופלים.",
  "כל יום הוא דף נקי שבו אתה יכול לקבוע את השיא החדש של עצמך. לך על זה בכל הכוח!",
  "תותח! אתה הופך התלבטויות לפגישות ייעוץ מוצלחות בזכות חדות, רגישות והבנה עמוקה.",
  "מכירות מעולות מתחילות ביצירת קשר אישי חם בשניות הראשונות בשיחה – ואתה פשוט מעולה בזה!",
  "כשאתה מציג את המחיר של הטיפול, תזכור תמיד שאתה מציג את השקט והביטחון שהם קונים.",
  "ממשיך תמיד בנחישות! כל סגירה טובה מתחילה בלב אמין שרוצה לעזור ולתת את הפתרון הטוב ביותר.",
  "אלוף, אין שום דבר שאתה לא יכול להשיג היום. התמקד, חייך, והעסקאות יזרמו בהתאם!",
  "זכור: הצלחה נוצרת מעבודה שיטתית, סדר ועיקשות בריאה בתיאום תורים ובשיחות מעקב.",
  "כאשר הלקוח חש את האכפתיות הכנה שבקול שלך, כל מחסום וחצץ נעלמים ברגע.",
  "כוח העל שלך הוא היכולת לחבר אנשים להזדמנות הנכונה בזמן הנכון. האמן בעצמך!",
  "שום שיחת לא מבוזבזת – כולם שומעים את המותג החזק שלנו, וההשפעה שלך נשמרת לטווח הרחוק.",
  "שילוב קסום של שירות מעומק הלב עם מקצועיות של ברזל הופך אותך לנציג הכי חזק במרפאה.",
  "אל תוותר על המשך מעקב ופולו-אפ! רוב העסקאות הכי גדולות נסגרות בדיוק בסבלנות הנוספת הזו.",
  "יום פורה ומלא בסגירות מצפה לך! קח נשימה עמוקה, האר את היום של המטופלים ותנצח.",
  "זכור שהמילים שלך בונות את הבטחון של המטופלים במרפאה עוד לפני שהם דרכו בה פעם אחת.",
  "נחישות מתגברת על כל מכשול. תהיה בטוח בערך המוביל והאיכות של הסניף שלנו.",
  "כל תיאום תור שנעשה היום משפר למטופל את החיוך החל ממחר. משימה קדושה ומנצחת!",
  "הבט קדימה והצב מטרות גבוהות. אתה מסוגל להגיע לכל יעד מכירות שיובא לפניך.",
  "אלוף, כל הצלחה שמגיעה היא תוצאה מוצדקת של העבודה והלב שהשקעת בטיפול בשיחה.",
  "מכירות מבוססות על מציאת פתרונות אמיתיים, והיצירתיות שלך פותרת בעיות בצורה מדהימה.",
  "כשאתה פותח שיחה בחיבוק קולי ואנרגיה מדהימה, הלקוחות פשוט נפתחים ומקשיבים לך.",
  "אתה המלך של המשרד היום! המשך להנחות את המטופלים ברוגע והובל את טבלת ההצלחות.",
  "כל יום מחדש אתה מוכיח שהשילוב של חיוך ואכפתיות אמיתית היא הדרך הקלה והבטוחה לסגירה!"
];


// --- SEED PATIENTS IN HEBREW FOR A BEAUTIFUL DEMO ---
const SEED_REPRESENTATIVES: Representative[] = [
  {
    id: 'rep-1',
    name: 'יובל כהן',
    gender: 'male',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rep-2',
    name: 'קורל אטיאס',
    gender: 'female',
    role: 'representative',
    createdAt: new Date().toISOString()
  }
];

const SEED_PATIENTS: Patient[] = [
  {
    id: 'p-1',
    nationalId: '312456789',
    firstName: 'אליזבת',
    familyName: 'הרגרוב',
    city: 'תל אביב',
    phoneNumber: '052-5550143',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p-2',
    nationalId: '201948576',
    firstName: 'מרקוס',
    familyName: 'ואנס',
    city: 'רעננה',
    phoneNumber: '054-5550188',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p-3',
    nationalId: '339281741',
    firstName: 'אוליבר',
    familyName: 'היגינס',
    city: 'גבעתיים',
    phoneNumber: '050-5550129',
    createdAt: new Date().toISOString()
  }
];

const getSeedAppointments = (): Appointment[] => {
  const today = new Date();
  
  // Appointment 1: Today 11:00 AM to 12:00 PM (Confirmed Coming Tomorrow -> Checkmark)
  const app1Start = new Date(today);
  app1Start.setHours(11, 0, 0, 0);
  const app1End = new Date(today);
  app1End.setHours(12, 0, 0, 0);

  // Appointment 2: Today 14:00 PM to 15:30 PM (Follow-up Flight confirmed -> Airplane)
  const app2Start = new Date(today);
  app2Start.setHours(14, 0, 0, 0);
  const app2End = new Date(today);
  app2End.setHours(15, 30, 0, 0);

  return [
    {
      id: 'a-1',
      patientId: 'p-1',
      title: 'בדיקת שיניים תקופתית',
      start: app1Start.toISOString(),
      end: app1End.toISOString(),
      firstReminder: true,
      finalConfirmation: false,
      notes: 'יש לדון בתוצאות הבקרה המקדמית',
      bookedBy: 'יובל כהן',
      dealClosed: true,
      arrivalConfirmed: true
    },
    {
      id: 'a-2',
      patientId: 'p-2',
      title: 'ייעוץ כירורגי מורכב',
      start: app2Start.toISOString(),
      end: app2End.toISOString(),
      firstReminder: true,
      finalConfirmation: true,
      notes: 'תיאום תור מיוחד לעקירה ביום שני הבא',
      bookedBy: 'שיר לוי',
      dealClosed: false,
      arrivalConfirmed: true
    }
  ];
};

const DENTE_THEMES = {
  'hospital-mint': {
    bg: 'bg-[#f0f9f6]',
    border: 'border-teal-100',
    accentText: 'text-[#0d9488]',
    primaryBg: 'bg-[#f0fdfa]',
    primaryButton: 'bg-[#0d9488] hover:bg-[#0f766e] border-[#0d9488]',
    headerBorder: 'border-[#0d9488]/15',
    statsBg: 'bg-[#f0fdfa]/60',
    statsBorder: 'border-[#0d9488]/20',
    statsText: 'text-[#0d9488]',
    bannerGradient: 'from-teal-50/60 to-sky-50/50'
  },
  'spicy-peach': {
    bg: 'bg-[#fdf9f4]',
    border: 'border-amber-200/60',
    accentText: 'text-[#d97706]',
    primaryBg: 'bg-[#fffbeb]',
    primaryButton: 'bg-[#d97706] hover:bg-[#b45309] border-[#d97706]',
    headerBorder: 'border-[#d97706]/15',
    statsBg: 'bg-[#fffbeb]/60',
    statsBorder: 'border-[#d97706]/20',
    statsText: 'text-[#d97706]',
    bannerGradient: 'from-amber-50/60 to-orange-50/40'
  },
  'pink-strawberry': {
    bg: 'bg-[#fef5f8]',
    border: 'border-pink-200/65',
    accentText: 'text-[#db2777]',
    primaryBg: 'bg-[#fdf2f8]',
    primaryButton: 'bg-[#db2777] hover:bg-[#be185d] border-[#db2777]',
    headerBorder: 'border-[#db2777]/15',
    statsBg: 'bg-[#fdf2f8]/60',
    statsBorder: 'border-[#db2777]/20',
    statsText: 'text-[#db2777]',
    bannerGradient: 'from-rose-50/40 to-pink-50/40'
  },
  'sapphire-sky': {
    bg: 'bg-[#f5f8ff]',
    border: 'border-sky-200',
    accentText: 'text-[#2563eb]',
    primaryBg: 'bg-[#eff6ff]',
    primaryButton: 'bg-[#2563eb] hover:bg-[#1d4ed8] border-[#2563eb]',
    headerBorder: 'border-[#2563eb]/15',
    statsBg: 'bg-[#eff6ff]/60',
    statsBorder: 'border-[#2563eb]/20',
    statsText: 'text-[#2563eb]',
    bannerGradient: 'from-sky-50/60 to-indigo-50/40'
  },
  'royal-gold': {
    bg: 'bg-[#faf9f5]',
    border: 'border-[#ca8a04]/35',
    accentText: 'text-[#a16207]',
    primaryBg: 'bg-[#fef9c3]/35',
    primaryButton: 'bg-[#C59B27] hover:bg-[#b0871d] border-[#C59B27]',
    headerBorder: 'border-[#ca8a04]/20',
    statsBg: 'bg-[#fef9c3]/20',
    statsBorder: 'border-[#ca8a04]/25',
    statsText: 'text-[#a16207]',
    bannerGradient: 'from-amber-50/40 to-yellow-50/30'
  }
};

export interface SMSLogEntry {
  id: string;
  patientName: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'failed' | 'pending';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>(SEED_REPRESENTATIVES);
  const [activeRepresentativeId, setActiveRepresentativeId] = useState<string>(
    () => localStorage.getItem('active_rep_id') || 'rep-1'
  );

  useEffect(() => {
    localStorage.setItem('active_rep_id', activeRepresentativeId);
  }, [activeRepresentativeId]);

  // Daily motivation banner controls
  const [showMotivationalBanner, setShowMotivationalBanner] = useState(false);
  const [motivationTimeLeft, setMotivationTimeLeft] = useState(20);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const trackerKey = `dente_motivation_views_${todayStr}_${activeRepresentativeId}`;
    const viewCount = parseInt(localStorage.getItem(trackerKey) || '0', 10);
    
    if (viewCount < 2) {
      setShowMotivationalBanner(true);
      setMotivationTimeLeft(20);
      localStorage.setItem(trackerKey, (viewCount + 1).toString());
    } else {
      setShowMotivationalBanner(false);
    }
  }, [activeRepresentativeId]);

  useEffect(() => {
    if (!showMotivationalBanner) return;
    if (motivationTimeLeft <= 0) {
      setShowMotivationalBanner(false);
      return;
    }
    const timer = setTimeout(() => {
      setMotivationTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [showMotivationalBanner, motivationTimeLeft]);

  // Reset analytics multi-rep chart tab if the logged-in staff is not an admin (manager)
  useEffect(() => {
    const activeStaff = representatives.find(r => r.id === activeRepresentativeId);
    if (activeStaff && activeStaff.role !== 'admin') {
      setAnalyticsChartTab('pie');
    }
  }, [activeRepresentativeId, representatives]);
  
  // Theme & Sound states requested by user
  type ThemeType = 'hospital-mint' | 'spicy-peach' | 'pink-strawberry' | 'sapphire-sky' | 'royal-gold';
  const [systemTheme, setSystemTheme] = useState<ThemeType>('hospital-mint');
  const [audioPlayed, setAudioPlayed] = useState(false);

  // SMS Portal States (to interface, pay, simulated logs and API keys)
  const [smsApiKey, setSmsApiKey] = useState('dente_premium_api_key_77bc');
  const [smsSenderId, setSmsSenderId] = useState('DENTE');
  const [smsTemplate, setSmsTemplate] = useState('שלום [שם], ברצוננו להזכירך לגבי תורך לטיפול במרפאת DENTE ב-[תאריך] בשעה [שעה]. נא אשרו הגעה.');
  const [smsCredit, setSmsCredit] = useState(350);
  const [smsProvider, setSmsProvider] = useState<'sms193' | 'twilio' | 'inforu' | 'leadic'>('sms193');
  const [smsLog, setSmsLog] = useState<SMSLogEntry[]>([
    {
      id: 'sms-1',
      patientName: 'אליזבת הרגרוב',
      phoneNumber: '052-5550143',
      message: 'שלום אליזבת, תזכורת לתורך במרפאת DENTE מומחים פה ולסת מחר בשעה 09:30. נא אשרו הגעה.',
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'}),
      status: 'sent'
    },
    {
      id: 'sms-2',
      patientName: 'מרקוס ואנס',
      phoneNumber: '054-5550188',
      message: 'שלום מרקוס, תזכורת לתורך במרפאת DENTE מומחים פה ולסת מחר בשעה 14:00. נא אשרו הגעה.',
      timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'}),
      status: 'sent'
    }
  ]);

  // Automated Backups & Database Isolation states
  const [lastAutoBackupDate, setLastAutoBackupDate] = useState<string>(
    () => localStorage.getItem('dente_last_auto_backup_date') || ''
  );
  const [autoBackupHistory, setAutoBackupHistory] = useState<{date: string, timestamp: string, size: number}[]>(() => {
    try {
      const stored = localStorage.getItem('dente_auto_backup_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string } | null>(null);
  const [selectedRep, setSelectedRep] = useState<string>('יובל כהן');
  const [analyticsChartTab, setAnalyticsChartTab] = useState<'pie' | 'bar'>('pie');
  const [dashboardTab, setDashboardTab] = useState<'calendar' | 'performance' | 'admin-overview'>('calendar');
  const [newRepFirstName, setNewRepFirstName] = useState('');
  const [newRepLastName, setNewRepLastName] = useState('');
  const [newRepGender, setNewRepGender] = useState<'male' | 'female'>('male');
  const [newRepRole, setNewRepRole] = useState<'admin' | 'representative'>('representative');
  const [adminTimeFilter, setAdminTimeFilter] = useState<'day' | 'week' | 'month'>('month');

  // Rescheduling state for moving appointments with free navigation
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);

  // Delayed hovered event state & timeout ref for showing full details after 1 second (1000ms) hover
  const [hoveredEventData, setHoveredEventData] = useState<{
    appointment: Appointment;
    patient?: Patient;
    x: number;
    y: number;
  } | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeHidingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Custom dialog state to replace native browser window.confirm & alert
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    isAlert?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void, 
    confirmText = 'אישור וביצוע', 
    cancelText = 'ביטול',
    isAlert = false
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        if (onCancel) onCancel();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      confirmText,
      cancelText,
      isAlert
    });
  };

  // Live Time status
  const [currentTime, setCurrentTime] = useState(new Date());

  // Track the currently active calendar date and view to dynamically adjust slot bounds
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [currentCalendarView, setCurrentCalendarView] = useState<string>("timeGridDay");

  // Secure Toast notification state for system confirmations (like automated and manual backups)
  const [toast, setToast] = useState<{ isOpen: boolean; title: string; desc?: string; type?: 'success' | 'info' | 'error' }>({
    isOpen: false,
    title: '',
    desc: '',
    type: 'success'
  });
  const toastTimerRef = useRef<any>(null);

  const showToast = (title: string, desc?: string, type: 'success' | 'info' | 'error' = 'success', duration = 5500) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ isOpen: true, title, desc, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, isOpen: false }));
      toastTimerRef.current = null;
    }, duration);
  };

  // State to track if the application's software version has just been updated
  const [updateAlert, setUpdateAlert] = useState<{ isOpen: boolean; version: string }>({
    isOpen: false,
    version: ''
  });

  const CURRENT_CODE_VERSION = "v3.5.7";

  const [appVersion, setAppVersion] = useState(CURRENT_CODE_VERSION);

  // Daily appointment list, print and CSV export states
  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState(false);
  const [reportSelectedDate, setReportSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modals for Design options, User management, and Backup & Restore
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isUsersManagementModalOpen, setIsUsersManagementModalOpen] = useState(false);
  const [isBackupRestoreModalOpen, setIsBackupRestoreModalOpen] = useState(false);

  // Protection states for Manager password verification (Code 2020)
  const [adminPasswordPrompt, setAdminPasswordPrompt] = useState<{
    isOpen: boolean;
    pendingRepId: string | null;
    errorMsg: string;
  }>({
    isOpen: false,
    pendingRepId: null,
    errorMsg: ''
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // User login status for secure DENTE: 2020 access
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('dente_logged_in') === 'true');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Table vs Calendar view state for responsive customer appointment management
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState<'all' | 'confirmed' | 'unconfirmed' | 'dealClosed' | 'reminded' | 'finalConfirmed'>('all');
  const [tableRepFilter, setTableRepFilter] = useState<string>('all');
  const [tableSortOrder, setTableSortOrder] = useState<'asc' | 'desc'>('asc');

  // Background effect to register/publish the active code version on load if running in Cloud
  useEffect(() => {
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalHost) {
      const publishCloudVersion = async () => {
        try {
          await setDoc(doc(db, 'system_info', 'version_tracker'), {
            id: 'version_tracker',
            latest_version: CURRENT_CODE_VERSION,
            updatedAt: new Date().toISOString()
          });
          console.log("Automatically registered cloud version in Firestore tracker:", CURRENT_CODE_VERSION);
        } catch (dbErr) {
          console.warn("Could not register cloud version in Firestore Tracker:", dbErr);
        }
      };
      publishCloudVersion();
    }
  }, []);

  // Trigger a full check against the server and reload if there is actually a newer version
  const forceUpdateAppCode = async () => {
    try {
      // Show loading/progress message
      showToast("מבצע בדיקת גרסה...", "מתחבר לשרת העדכונים של DENTE...", "info", 2000);

      let serverVersion = CURRENT_CODE_VERSION;
      let fetchedSuccessfully = false;

      // 1. Try to fetch the latest published version from Firestore first (this is CORS-safe and works beautifully from local PC!)
      try {
        const docRef = doc(db, 'system_info', 'version_tracker');
        const docSnap = await getDocFromServer(docRef);
        if (docSnap.exists()) {
          const versionData = docSnap.data();
          if (versionData && versionData.latest_version) {
            serverVersion = versionData.latest_version;
            fetchedSuccessfully = true;
            console.log("Fetched latest version pointer from Firestore:", serverVersion);
          }
        }
      } catch (remoteErr) {
        console.warn("Could not query Firestore cloud tracker, checking live URL...", remoteErr);
      }

      // 2. Try to fetch from the live global production URL as fallback
      if (!fetchedSuccessfully) {
        try {
          const liveServerUrl = 'https://ais-pre-pofnvus47knnkbmwh6bzpt-889839026222.europe-west2.run.app/version.json';
          const remoteResponse = await fetch(`${liveServerUrl}?cb=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            signal: AbortSignal.timeout(4000) // 4 seconds timeout
          });
          if (remoteResponse.ok) {
            const remoteData = await remoteResponse.json();
            serverVersion = remoteData.version || CURRENT_CODE_VERSION;
            fetchedSuccessfully = true;
            console.log("Fetched latest version pointer from live cloud JSON:", serverVersion);
          }
        } catch (remoteErr) {
          console.warn("Could not query live cloud version.json, checking local host...", remoteErr);
        }
      }

      // 3. Check local server version as final fallback
      if (!fetchedSuccessfully) {
        try {
          const localResponse = await fetch(`/version.json?cb=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          if (localResponse.ok) {
            const localData = await localResponse.json();
            serverVersion = localData.version || CURRENT_CODE_VERSION;
          }
        } catch (localErr) {
          console.warn("Could not check local version.json", localErr);
        }
      }

      console.log("Current built-in version:", CURRENT_CODE_VERSION);
      console.log("Latest version available on server/disk:", serverVersion);

      // Determine local environment context
      const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (isLocalHost) {
        if (serverVersion !== CURRENT_CODE_VERSION) {
          // There is a higher version on the remote cloud server (AI Studio) than what is running locally on their disk
          showConfirm(
            `🔄 עדכון גרסה חדש זמין בשרת! (${serverVersion})`,
            `קיימת גרסה מעודכנת יותר בשרת DENTE הראשי של AI Studio (גרסה בשרת: ${serverVersion}, מופעלת אצלך: ${CURRENT_CODE_VERSION}).\n\nכדי להחיל את השדרוג בקלות:\n1. היכנס לחלון ה-AI Studio שלך בדפדפן.\n2. לחץ על כפתור ה-Export למעלה (ליד כפתור ה-Share) כדי להוריד את קובץ ה-ZIP העדכני ביותר.\n3. חלץ את ה-ZIP החדש לתוך אותה תיקיית תוכנה במחשבך (ובחר "החלף קבצים ביעד").\n4. הפעל מחדש את dente-launcher.bat והשינויים כגון המילים שהוחלפו והשיפורים יופיעו מיד!\n\nהאם ברצונך לבצע ניקוי מטמון ורענון מקומי כעת?`,
            async () => {
              // Clear cache and hard reload so they start clean
              if ('serviceWorker' in navigator) {
                try {
                  const registrations = await navigator.serviceWorker.getRegistrations();
                  for (const registration of registrations) {
                    await registration.unregister();
                  }
                } catch (e) {}
              }
              if ('caches' in window) {
                try {
                  const cacheNames = await caches.keys();
                  for (const cacheName of cacheNames) {
                    await caches.delete(cacheName);
                  }
                } catch (e) {}
              }
              localStorage.removeItem('dente_saved_app_version');
              window.location.href = window.location.origin + window.location.pathname + '?force-cache-bust=' + Date.now();
            },
            () => {},
            "בצע ניקוי מטמון ורענון 🔄",
            "סגור",
            false
          );
        } else {
          // Local is already equal to cloud version
          showConfirm(
            "גרסת המערכת מעודכנת מקומית ✨",
            `התוכנה המקומית במחשבך מעודכנת לגרסת הענן העדכנית ביותר (${CURRENT_CODE_VERSION}).\n\nאם שינויי קוד אחרונים שבוצעו עדיין אינם משתקפים, ייתכן שמדובר במטמון דפדפן (Cache) עקשן השמור ב-Edge/Chrome במחשבך.\n\nלחץ על הכפתור למטה כדי לבצע מחיקת מטמון מלאה ורענון עמוק כפוי של דפי התוכנה ישירות מהדיסק!`,
            async () => {
              // Force fully clear service workers, cache storage and reload
              if ('serviceWorker' in navigator) {
                try {
                  const registrations = await navigator.serviceWorker.getRegistrations();
                  for (const registration of registrations) {
                    await registration.unregister();
                  }
                } catch (e) {}
              }
              if ('caches' in window) {
                try {
                  const cacheNames = await caches.keys();
                  for (const cacheName of cacheNames) {
                    await caches.delete(cacheName);
                  }
                } catch (e) {}
              }
              localStorage.removeItem('dente_app_build_number');
              localStorage.removeItem('dente_saved_app_version');
              localStorage.removeItem('dente_app_build_number_pending');
              
              window.location.href = window.location.origin + window.location.pathname + '?force-cache-bust=' + Date.now();
            },
            () => {},
            "בצע ניקוי מטמון ורענון עמוק 🔄",
            "סגור",
            false
          );
        }
      } else {
        // Cloud Server Environment
        if (serverVersion !== CURRENT_CODE_VERSION) {
          showConfirm(
            "🔄 עדכון גרסה חדש זמין בשרת!",
            `נמצא עדכון קוד חדש וחשוב בשרת הענן (גרסה חדשה בשרת: ${serverVersion}, גרסה מופעלת אצלך: ${CURRENT_CODE_VERSION}).\n\nהאם ברצונך להחיל שדרוג זה כעת בצורה בטוחה?`,
            async () => {
              // Unregister service workers and clear cache to make absolutely sure they load the latest cloud bundle!
              if ('serviceWorker' in navigator) {
                try {
                  const registrations = await navigator.serviceWorker.getRegistrations();
                  for (const registration of registrations) {
                    await registration.unregister();
                  }
                } catch (e) {}
              }
              if ('caches' in window) {
                try {
                  const cacheNames = await caches.keys();
                  for (const cacheName of cacheNames) {
                    await caches.delete(cacheName);
                  }
                } catch (e) {}
              }
              localStorage.setItem('dente_app_build_number_pending', serverVersion);
              localStorage.removeItem('dente_saved_app_version');
              
              window.location.href = window.location.origin + window.location.pathname + '?force-cache-bust=' + Date.now();
            },
            () => {},
            "כן, עדכן גרסה כעת",
            "ביטול",
            false
          );
        } else {
          showConfirm(
            "גרסת המערכת מעודכנת ✨",
            `תוכנת הענן שלך כבר מעודכנת לגרסה העדכנית ביותר (${CURRENT_CODE_VERSION}).\n\nאם שינויי קוד אחרונים אינם משתקפים, תוכל לבצע כעת מחיקת מטמון מלאה ורענון עמוק כפוי של דפי המערכת מהשרת.`,
            async () => {
              if ('serviceWorker' in navigator) {
                try {
                  const registrations = await navigator.serviceWorker.getRegistrations();
                  for (const registration of registrations) {
                    await registration.unregister();
                  }
                } catch (e) {}
              }
              if ('caches' in window) {
                try {
                  const cacheNames = await caches.keys();
                  for (const cacheName of cacheNames) {
                    await caches.delete(cacheName);
                  }
                } catch (e) {}
              }
              localStorage.removeItem('dente_saved_app_version');
              window.location.href = window.location.origin + window.location.pathname + '?force-cache-bust=' + Date.now();
            },
            () => {},
            "בצע ניקוי מטמון ורענון עמוק 🔄",
            "סגור",
            false
          );
        }
      }
    } catch (error) {
      console.error("Error verifying version against server:", error);
      showConfirm(
        "שגיאת אימות גרסה",
        "לא ניתן היה לגשת לשרת העדכונים של DENTE לצורך אימות אוטומטי. האם ברצונך לבצע ניקוי מטמון ורענון כפוי בכל זאת כדי לנסות לפתור בעיות טעינה?",
        () => {
          window.location.href = window.location.origin + window.location.pathname + '?force-cache-bust=' + Date.now();
        },
        () => {},
        "כן, רענן בכל זאת",
        "ביטול",
        false
      );
    }
  };

  // Intercept F5 keypress inside the browser window to bypass Chromium caching
  useEffect(() => {
    const handleWindowF5 = (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        forceUpdateAppCode();
      }
    };
    window.addEventListener('keydown', handleWindowF5);
    return () => window.removeEventListener('keydown', handleWindowF5);
  }, []);

  // Check version on load to notify the user of successful updates (e.g. upon F5)
  useEffect(() => {
    const hasCacheBust = window.location.search.includes('force-cache-bust');
    const prevStored = localStorage.getItem('dente_app_build_number');
    
    // Always force the state and stored tracker to match the physical compiled running version
    localStorage.setItem('dente_app_build_number', CURRENT_CODE_VERSION);
    setAppVersion(CURRENT_CODE_VERSION);

    // If the stored version changed or we had a cache-bust refresh, notify the user with a nice banner!
    if (prevStored !== CURRENT_CODE_VERSION || hasCacheBust) {
      setUpdateAlert({ isOpen: true, version: CURRENT_CODE_VERSION });
      localStorage.setItem('dente_saved_app_version', CURRENT_CODE_VERSION);
      
      if (hasCacheBust && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      const timer = setTimeout(() => {
        setUpdateAlert(prev => ({ ...prev, isOpen: false }));
      }, 3500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Connection validation indicator
  useEffect(() => {
    if (!currentUser) return;
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setDbConnected(true);
      } catch (error) {
        console.warn("Connection test status: ", error);
        setDbConnected(false);
      }
    }
    testConnection();
  }, [currentUser]);

  // Auth changed listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is authenticated:", user.uid);
        setCurrentUser(user);
        setAuthLoading(false);
      } else {
        console.log("No authenticated user, signing in anonymously...");
        setAuthLoading(true);
        try {
          const cred = await signInAnonymously(auth);
          console.log("Anonymous authentication successful:", cred.user.uid);
          setCurrentUser(cred.user);
        } catch (err: any) {
          console.warn("Failed to authenticate user anonymously (auth/admin-restricted-operation). Using high-reliability fallback mock user:", err);
          
          // Instantiate a valid mock user payload so the app initializes database listeners seamlessly
          const fallbackUser = {
            uid: "fallback-anonymous-user",
            isAnonymous: true,
            email: null,
            emailVerified: false,
          } as unknown as FirebaseUser;
          setCurrentUser(fallbackUser);
        } finally {
          setAuthLoading(false);
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore synchronizer for Patients, Appointments, and Settings
  useEffect(() => {
    if (!currentUser) {
      setPatients([]);
      setAppointments([]);
      return;
    }

    // 1. Snapshot patients
    const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
      const data: Patient[] = [];
      snapshot.forEach((doc) => {
        const item = doc.data() as Patient;
        data.push({
          ...item,
          id: item.id || doc.id
        });
      });
      
      // If collection is empty, seed it only if we have not performed seeding before in this workspace
      if (data.length === 0) {
        const hasSeededBefore = localStorage.getItem('dente_has_seeded_patients_v2') === 'true';
        if (!hasSeededBefore) {
          localStorage.setItem('dente_has_seeded_patients_v2', 'true');
          SEED_PATIENTS.forEach(async (p) => {
            try {
              await setDoc(doc(db, 'patients', p.id), p);
            } catch (e) {
              console.error("Error seeding patient:", e);
            }
          });
        } else {
          setPatients([]);
        }
      } else {
        localStorage.setItem('dente_has_seeded_patients_v2', 'true');
        // Sort by createdAt descending
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPatients(data);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients');
    });

    // 2. Snapshot appointments
    const unsubAppointments = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const data: Appointment[] = [];
      snapshot.forEach((doc) => {
        const item = doc.data() as Appointment;
        data.push({
          ...item,
          id: item.id || doc.id
        });
      });

      // If empty, seed only once during first run
      if (data.length === 0) {
        const hasSeededBefore = localStorage.getItem('dente_has_seeded_appointments_v2') === 'true';
        if (!hasSeededBefore) {
          localStorage.setItem('dente_has_seeded_appointments_v2', 'true');
          getSeedAppointments().forEach(async (appt) => {
            try {
              await setDoc(doc(db, 'appointments', appt.id), appt);
            } catch (e) {
              console.error("Error seeding appointment:", e);
            }
          });
        } else {
          setAppointments([]);
        }
      } else {
        localStorage.setItem('dente_has_seeded_appointments_v2', 'true');
        setAppointments(data);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    // 3. Snapshot global settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const val = docSnap.data();
        if (val.systemTheme) setSystemTheme(val.systemTheme as ThemeType);
        if (val.smsApiKey) setSmsApiKey(val.smsApiKey);
        if (val.smsSenderId) setSmsSenderId(val.smsSenderId);
        if (val.smsTemplate) setSmsTemplate(val.smsTemplate);
        if (val.smsCredit !== undefined) setSmsCredit(Number(val.smsCredit));
        if (val.smsProvider) setSmsProvider(val.smsProvider);
      } else {
        // Set default settings if not exists
        setDoc(doc(db, 'settings', 'global'), {
          id: 'global',
          systemTheme: 'hospital-mint',
          smsApiKey: 'dente_premium_api_key_77bc',
          smsSenderId: 'DENTE',
          smsTemplate: 'שלום [שם], ברצוננו להזכירך לגבי תורך לטיפול במרפאת DENTE ב-[תאריך] בשעה [שעה]. נא אשרו הגעה.',
          smsCredit: 350,
          smsProvider: 'sms193'
        }).catch(e => console.error("Error writing default settings doc:", e));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
    });

    // 4. Snapshot representatives
    const unsubRepresentatives = onSnapshot(collection(db, 'representatives'), (snapshot) => {
      const data: Representative[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as Representative;
        data.push({
          ...item,
          id: item.id || docSnap.id
        });
      });

      if (data.length === 0) {
        const hasSeededBefore = localStorage.getItem('dente_has_seeded_reps_v2') === 'true';
        if (!hasSeededBefore) {
          localStorage.setItem('dente_has_seeded_reps_v2', 'true');
          setRepresentatives(SEED_REPRESENTATIVES);
          SEED_REPRESENTATIVES.forEach(async (rep) => {
            try {
              await setDoc(doc(db, 'representatives', rep.id), rep);
            } catch (e) {
              console.error("Error seeding representative:", e);
            }
          });
        } else {
          setRepresentatives([]);
        }
      } else {
        localStorage.setItem('dente_has_seeded_reps_v2', 'true');
        const sortedList = [...data];
        sortedList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setRepresentatives(sortedList);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'representatives');
    });

    // Load custom sms logs locally
    const storedSmsLog = localStorage.getItem('clinic_sms_logs');
    if (storedSmsLog) setSmsLog(JSON.parse(storedSmsLog));

    return () => {
      unsubPatients();
      unsubAppointments();
      unsubSettings();
      unsubRepresentatives();
    };
  }, [currentUser]);

  // Automated Daily Backup triggers when patient and appointment records are populated
  useEffect(() => {
    if (patients.length > 0 && appointments.length > 0) {
      const todayStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
      const storedLastBackup = localStorage.getItem('dente_last_auto_backup_date');
      
      if (storedLastBackup !== todayStr) {
        // Execute automatic daily backup
        try {
          const autoBackupPayload = {
            date: new Date().toISOString(),
            patients,
            appointments,
            smsApiKey,
            smsSenderId,
            smsTemplate,
            smsCredit,
            smsProvider,
            systemTheme
          };
          
          // Save this backup under dente_backup_[date]
          localStorage.setItem(`dente_backup_${todayStr}`, JSON.stringify(autoBackupPayload));
          
          // Update history list in localStorage to keep last 7 backups
          const storedHistory = localStorage.getItem('dente_auto_backup_history');
          let history = storedHistory ? JSON.parse(storedHistory) : [];
          
          // Filter out if today already exists to prevent duplication
          history = history.filter((h: any) => h.date !== todayStr);
          
          // Unshift today
          history.unshift({
            date: todayStr,
            timestamp: new Date().toISOString(),
            size: JSON.stringify(autoBackupPayload).length
          });
          
          // Trim to max 7 historical backups
          while (history.length > 7) {
            const popped = history.pop();
            localStorage.removeItem(`dente_backup_${popped.date}`);
          }
          
          localStorage.setItem('dente_auto_backup_history', JSON.stringify(history));
          localStorage.setItem('dente_last_auto_backup_date', todayStr);
          
          setLastAutoBackupDate(todayStr);
          setAutoBackupHistory(history);
          console.log(`✅ Automatic Daily Backup successfully validated and saved offline for date: ${todayStr}`);
          
          showToast(
            "בוצע גיבוי יומי אוטומטי בהצלחה",
            `כל הנתונים וההגדרות של המרפאה מאובטחים כעת בזיכרון המקומי ליום (${todayStr})`,
            'success'
          );
        } catch (e) {
          console.error("Failed to compile automatic daily backup", e);
        }
      }
    }
  }, [patients, appointments]);

  // Update live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio Synthesis for Copyright-Free 7-Eleven Sweet Double Bell Chime Sound
  const playOpeningChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playBellComponent = (frequency: number, startTime: number, volume: number) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Authentic clean dual-bell chime using sine with a subtle triangle harmonic overlay
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(frequency, startTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(frequency * 2, startTime); // upper octave harmonic

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05); // warm bell attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2); // sweet decay

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + 1.3);
        osc2.stop(startTime + 1.3);
      };

      const now = ctx.currentTime;
      // Classic 7-Eleven High-to-Low double-tone ding-dong chime
      playBellComponent(659.25, now, 0.2); // Ding (E5) at t=0
      playBellComponent(523.25, now + 0.32, 0.18); // Dong (C5) at t=0.32s seconds later
      setAudioPlayed(true);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  // Helper to trigger chime once on first user interaction with document body
  useEffect(() => {
    const triggerFirstTimeAudio = () => {
      if (!audioPlayed) {
        playOpeningChime();
        document.removeEventListener('click', triggerFirstTimeAudio);
      }
    };
    document.addEventListener('click', triggerFirstTimeAudio);
    return () => document.removeEventListener('click', triggerFirstTimeAudio);
  }, [audioPlayed]);


  // Print Daily Appointments Sheet with elegant clean design and layouts
  const printDailyReport = (targetDate: string, apptsList: Appointment[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast(
        "פרסום חלון נחסם",
        "נא לאשר קופצים (Pop-ups) בדפדפן כדי לאפשר הדפסה של הדוח היומי.",
        "error"
      );
      return;
    }
    
    // Sort appointments by start time
    const sorted = [...apptsList].sort((a, b) => a.start.localeCompare(b.start));
    
    // Create rows HTML
    const rowsHtml = sorted.map((appt, idx) => {
      const patient = patients.find(p => p.id === appt.patientId);
      const patName = patient ? `${patient.firstName} ${patient.familyName}` : "לא ידוע";
      const patPhone = patient ? patient.phoneNumber : "";
      const time = appt.start.split('T')[1]?.substring(0, 5) || "";
      
      let status = "ממתין לתור";
      if (appt.noShow) status = "אל-חזור / הברזה (🚫)";
      else if (appt.arrivalConfirmed) status = "אושר הגעה (✓✓)";
      else if (appt.dealClosed) status = "סגר עסקה לשלם (👑)";
      else if (appt.firstReminder) status = "תזכורת 1 נשלחה (✓)";
      else if (appt.finalConfirmation) status = "תזכורת סופית אושרה (✈️)";

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 10px; font-weight: bold; text-align: center; border-bottom: 1px solid #e2e8f0;">${idx + 1}</td>
          <td style="padding: 10px; font-weight: bold; text-align: center; color: #0d9488; border-bottom: 1px solid #e2e8f0;">${time}</td>
          <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${patName}</td>
          <td style="padding: 10px; font-family: monospace; border-bottom: 1px solid #e2e8f0;">${patPhone}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${appt.title || ""}</td>
          <td style="padding: 10px; text-align: center; font-size: 10.5px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${status}</td>
          <td style="padding: 10px; color: #475569; font-size: 10.5px; border-bottom: 1px solid #e2e8f0;">${appt.bookedBy || ""}</td>
        </tr>
      `;
    }).join('');

    const displayDate = new Date(targetDate).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="he" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>דוח תורים יומי - DENTE מומחים פה ולסת</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #1e293b;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px double #0f766e;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .logo {
            font-size: 20px;
            font-weight: 800;
            color: #0f766e;
          }
          .clinic-info {
            text-align: left;
            font-size: 11px;
            color: #64748b;
            line-height: 1.4;
          }
          h1 {
            font-size: 18px;
            font-weight: 800;
            margin: 0 0 5px 0;
            color: #0f766e;
          }
          .date {
            font-size: 13px;
            color: #475569;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th {
            background-color: #f1f5f9;
            color: #0f766e;
            font-size: 11px;
            font-weight: 800;
            padding: 12px 10px;
            border-bottom: 2px solid #cbd5e1;
            text-align: right;
          }
          th.center, td.center {
            text-align: center;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
          }
          @media print {
            body { margin: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>דוח תורים יומי</h1>
            <div class="date">ליום ${displayDate}</div>
          </div>
          <div class="clinic-info">
            <span style="font-weight: bold; color: #0f766e; font-size: 13px;">DENTE מומחים פה ולסת</span><br>
            רוזנסקי 4, ראשון לציון (קומה 3)<br>
            טלפון: 03-904-4444 | עמדת מורשי יומן
          </div>
        </div>

        <table dir="rtl">
          <thead>
            <tr>
              <th class="center" style="width: 5.5%;">#</th>
              <th class="center" style="width: 10%;">שעה</th>
              <th style="width: 21%;">שם המטופל</th>
              <th style="width: 15%;">טלפון</th>
              <th style="width: 24%;">סוג טיפול / הערות</th>
              <th class="center" style="width: 13%;">סטטוס תור</th>
              <th style="width: 11.5%;">עודכן ע"י</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="7" style="padding: 25px; text-align: center; color: #94a3b8; font-weight: bold;">אין תורים רשומים לתאריך זה.</td></tr>'}
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: left;">
          <p style="font-size: 11px; font-weight: bold; color: #64748b;">סך הכל תורים יומיים בקליניקה: ${sorted.length}</p>
        </div>

        <div class="footer">
          מערכת ניהול DENTE &copy; 2026 מרפאת מומחים פה ולסת. הופק באופן מאובטח.
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Export Daily report to beautifully formatted Excel CSV WITH Hebrew UTF-8 BOM representation
  const exportDailyReportToCSV = (targetDate: string, apptsList: Appointment[]) => {
    const sorted = [...apptsList].sort((a, b) => a.start.localeCompare(b.start));
    
    const csvRows = [
      ['מספר', 'שעה', 'שם מטופל', 'טלפון', 'סוג טיפול והערות', 'סטטוס', 'נרשם על ידי']
    ];
    
    sorted.forEach((appt, idx) => {
      const patient = patients.find(p => p.id === appt.patientId);
      const patName = patient ? `${patient.firstName} ${patient.familyName}` : "לא ידוע";
      const patPhone = patient ? patient.phoneNumber : "";
      const time = appt.start.split('T')[1]?.substring(0, 5) || "";
      
      let status = "ממתין לתור";
      if (appt.noShow) status = "אל-חזור / הברזה";
      else if (appt.arrivalConfirmed) status = "אושר הגעה";
      else if (appt.dealClosed) status = "סגר עסקה לשלם";
      else if (appt.firstReminder) status = "תזכורת 1 נשלחה";
      else if (appt.finalConfirmation) status = "תזכורת סופית אושרה";
      
      csvRows.push([
        String(idx + 1),
        time,
        patName,
        patPhone,
        appt.notes || appt.title || "",
        status,
        appt.bookedBy || ""
      ]);
    });
    
    // Create clean quoted CSV string to prevent cell formatting glitches
    const csvString = csvRows.map(e => e.map(val => {
      const cleanVal = String(val).replace(/"/g, '""');
      return `"${cleanVal}"`;
    }).join(",")).join("\r\n");
    
    // Prefix UTF-8 Byte Order Mark (BOM) for native Hebrew loading in Microsoft Excel
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DENTE_תורים_יומי_${targetDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(
      "ייצוא דוח יומי הושלם",
      `קובץ Excel/CSV עם ${sorted.length} תורים נשמר בתיקיית ההורדות במחשב בהצלחה.`,
      'success'
    );
  };


  // Export all system database info as beautiful local offline .json backup
  const exportBackupFile = () => {
    try {
      const backupData = {
        patients,
        appointments,
        smsApiKey,
        smsSenderId,
        smsTemplate,
        smsCredit,
        smsProvider,
        systemTheme,
        backupDate: new Date().toISOString()
      };
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      
      const formattedDate = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
      downloadAnchor.setAttribute('download', `DENTE-Backup-${formattedDate}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Backup failed", err);
      alert("שגיאה ביצירת קובץ הגיבוי. אנא נסה שוב.");
    }
  };

  // Import existing backup .json file
  const importBackupFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (Array.isArray(importedData.patients) && Array.isArray(importedData.appointments)) {
          showConfirm(
            "אישור שחזור נתוני מרפאה",
            `קובץ גיבוי תקין זוהה! שחזור הנתונים יחליף את כל המטופלים (${importedData.patients.length}) והתורים (${importedData.appointments.length}) הנוכחיים במערכת בנתונים מן הקובץ. האם להמשיך?`,
            async () => {
              // Import patients
              importedData.patients.forEach(async (p: Patient) => {
                try {
                  await setDoc(doc(db, 'patients', p.id), p);
                } catch (err) {
                  console.error("Error importing patient:", err);
                }
              });

              // Import appointments
              importedData.appointments.forEach(async (a: Appointment) => {
                try {
                  await setDoc(doc(db, 'appointments', a.id), a);
                } catch (err) {
                  console.error("Error importing appointment:", err);
                }
              });
              
              const targetApiKey = importedData.smsApiKey || smsApiKey;
              const targetSenderId = importedData.smsSenderId || smsSenderId;
              const targetTemplate = importedData.smsTemplate || smsTemplate;
              const targetCredit = importedData.smsCredit !== undefined ? Number(importedData.smsCredit) : smsCredit;
              const targetProvider = importedData.smsProvider || smsProvider;
              const targetTheme = importedData.systemTheme || systemTheme;

              try {
                await setDoc(doc(db, 'settings', 'global'), {
                  id: 'global',
                  systemTheme: targetTheme,
                  smsApiKey: targetApiKey,
                  smsSenderId: targetSenderId,
                  smsTemplate: targetTemplate,
                  smsCredit: targetCredit,
                  smsProvider: targetProvider
                });
              } catch (err) {
                console.error("Error importing settings:", err);
              }
              
              event.target.value = '';
              playOpeningChime();
              alert("שחזור הנתונים הושלם בהצלחה מרובה! הנתונים סונכרנו לתוך מסד הנתונים בענן ויעודכנו בכל המסכים באופן מיידי.");
            },
            () => {
              event.target.value = '';
            },
            "כן, שחזר נתונים",
            "ביטול"
          );
        } else {
          alert("קובץ הגיבוי שנבחר אינו בפורמט תקין של מערכת DENTE.");
          event.target.value = '';
        }
      } catch (err) {
        alert("שגיאה בקריאת קובץ הגיבוי. ודא כי בחרת קובץ JSON תקין שיוצא מהמערכת.");
        event.target.value = '';
      }
    };
    fileReader.readAsText(file);
  };

  // Manual trigger to force-compile a fresh automatic backup point instantly
  const forceManualBackup = () => {
    try {
      const todayStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
      const autoBackupPayload = {
        date: new Date().toISOString(),
        patients,
        appointments,
        smsApiKey,
        smsSenderId,
        smsTemplate,
        smsCredit,
        smsProvider,
        systemTheme
      };
      
      localStorage.setItem(`dente_backup_${todayStr}`, JSON.stringify(autoBackupPayload));
      
      // Update history list in localStorage
      const storedHistory = localStorage.getItem('dente_auto_backup_history');
      let history = storedHistory ? JSON.parse(storedHistory) : [];
      history = history.filter((h: any) => h.date !== todayStr);
      history.unshift({
        date: todayStr,
        timestamp: new Date().toISOString(),
        size: JSON.stringify(autoBackupPayload).length
      });
      
      while (history.length > 7) {
        const popped = history.pop();
        localStorage.removeItem(`dente_backup_${popped.date}`);
      }
      
      localStorage.setItem('dente_auto_backup_history', JSON.stringify(history));
      localStorage.setItem('dente_last_auto_backup_date', todayStr);
      
      setLastAutoBackupDate(todayStr);
      setAutoBackupHistory(history);
      playOpeningChime();
      showToast(
        "נוצר גיבוי נקודתי מהיר בהצלחה",
        `עותק הנתונים המעודכן ביותר מאובטח כעת בזיכרון המקומי ומוכן לשחזור או להורדה בכל עת.`,
        'success'
      );
    } catch (e) {
      console.error(e);
      alert("שגיאה ביצירת הגיבוי המקומי המהיר.");
    }
  };

  // Download a specific historical backup as a JSON file
  const downloadSpecificBackup = (date: string) => {
    try {
      const dataStr = localStorage.getItem(`dente_backup_${date}`);
      if (!dataStr) {
        alert("לא נמצא קובץ גיבוי לסימון שנבחר.");
        return;
      }
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `DENTE-Backup-Auto-${date}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
      alert("שגיאה בהורדת הגיבוי הספציפי.");
    }
  };

  // Restore database state from a specific historical backup
  const restoreSpecificBackup = (date: string) => {
    try {
      const dataStr = localStorage.getItem(`dente_backup_${date}`);
      if (!dataStr) {
        alert("לא נמצא קובץ גיבוי לסימון שנבחר.");
        return;
      }
      const importedData = JSON.parse(dataStr);
      
      if (Array.isArray(importedData.patients) && Array.isArray(importedData.appointments)) {
        showConfirm(
          "אישור שחזור מגיבוי אוטומטי",
          `האם לשחזר את הנתונים לנקודת הגיבוי מתאריך ${date}? פעולה זו תחליף את כל המטופלים והתורים הנוכחיים בנתונים השמורים בגיבוי.`,
          async () => {
            // Import patients
            importedData.patients.forEach(async (p: Patient) => {
              try {
                await setDoc(doc(db, 'patients', p.id), p);
              } catch (err) {
                console.error("Error importing patient:", err);
              }
            });

            // Import appointments
            importedData.appointments.forEach(async (a: Appointment) => {
              try {
                await setDoc(doc(db, 'appointments', a.id), a);
              } catch (err) {
                console.error("Error importing appointment:", err);
              }
            });
            
            const targetApiKey = importedData.smsApiKey || smsApiKey;
            const targetSenderId = importedData.smsSenderId || smsSenderId;
            const targetTemplate = importedData.smsTemplate || smsTemplate;
            const targetCredit = importedData.smsCredit !== undefined ? Number(importedData.smsCredit) : smsCredit;
            const targetProvider = importedData.smsProvider || smsProvider;
            const targetTheme = importedData.systemTheme || systemTheme;

            try {
              await setDoc(doc(db, 'settings', 'global'), {
                id: 'global',
                systemTheme: targetTheme,
                smsApiKey: targetApiKey,
                smsSenderId: targetSenderId,
                smsTemplate: targetTemplate,
                smsCredit: targetCredit,
                smsProvider: targetProvider
              });
            } catch (err) {
              console.error("Error importing settings:", err);
            }
            
            playOpeningChime();
            alert("השחזור ההיסטורי הושלם בהצלחה! הנתונים סונכרנו בהצלחה עם שרת מסד הנתונים בענן.");
          },
          () => {},
          "כן, שחזר לגרסה זו",
          "ביטול"
        );
      }
    } catch (e) {
      console.error(e);
      alert("שגיאה בביצוע השחזור ההיסטורי.");
    }
  };

  // --- REGISTRATION ACTIONS ---
  const handleAddPatient = async (meta: Omit<Patient, 'id' | 'createdAt'>) => {
    const newId = `p-${Date.now()}`;
    const newPatient: Patient = {
      ...meta,
      id: newId,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'patients', newId), newPatient);
      playOpeningChime(); // Play the chime when adding a patient as requested!
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `patients/${newId}`);
    }
  };

  const handleAddPatientInline = async (meta: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
    const newId = `p-${Date.now()}`;
    const newPatient: Patient = {
      ...meta,
      id: newId,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'patients', newId), newPatient);
      playOpeningChime(); // Play the chime when adding a patient as requested!
      return newPatient;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `patients/${newId}`);
      throw error;
    }
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
      await setDoc(doc(db, 'patients', updatedPatient.id), updatedPatient);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `patients/${updatedPatient.id}`);
    }
  };

  const handleDeletePatient = (id: string) => {
    showConfirm(
      "מחיקת כרטיס מטופל",
      "האם אתם בטוחים שברצונכם למחוק את כרטיס המטופל? התורים שנקבעו עבורו יישארו ביומן אך לא יהיו מקושרים למפרט המטופל המלא.",
      async () => {
        try {
          await deleteDoc(doc(db, 'patients', id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `patients/${id}`);
        }
      },
      undefined,
      "כן, למחוק",
      "ביטול"
    );
  };

  // --- CALENDAR SELECTION ACTIONS ---
  const handleDateSelect = (selectInfo: any) => {
    if (selectInfo.view?.calendar?.unselect) {
      selectInfo.view.calendar.unselect();
    }
    
    // If clicking a day in Month View (dayGridMonth), automatically navigate to the Day View of that selected date
    if (selectInfo.view?.type === 'dayGridMonth') {
      const calendarApi = selectInfo.view.calendar;
      if (calendarApi) {
        calendarApi.changeView('timeGridDay', selectInfo.start);
        return;
      }
    }

    // Direct clinical schedule hour bounding checks (Thursday vs other weekdays)
    const checkDate = new Date(selectInfo.start);
    const dayOfWeek = checkDate.getDay();
    const hours = checkDate.getHours();
    const minutes = checkDate.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (dayOfWeek === 4) { // Thursday (יום חמישי)
      if (totalMinutes > 18 * 60) {
        alert("שגיאה בקליניקה: בימי חמישי המרפאה פעילה רק עד השעה 18:15 (משבצת שיבוץ אחרונה מותרת: 18:00).");
        return;
      }
    } else { // Other days (שאר ימי השבוע)
      if (totalMinutes > 18 * 60 + 30) {
        alert("שגיאה בקליניקה: משבצת השיבוץ האחרונה המותרת בשאר ימי השבוע היא 18:30 (מסתיים ב-18:45).");
        return;
      }
    }
    
    if (reschedulingAppt) {
      const newStartStr = selectInfo.startStr || selectInfo.start?.toISOString();
      if (!newStartStr) return;
      
      const originalStart = new Date(reschedulingAppt.start);
      const originalEnd = new Date(reschedulingAppt.end);
      const durationMs = originalEnd.getTime() - originalStart.getTime();
      
      const newStart = new Date(newStartStr);
      const newEnd = new Date(newStart.getTime() + durationMs);
      
      const patient = patients.find(p => p.id === reschedulingAppt.patientId);
      const patientName = patient ? `${patient.firstName} ${patient.familyName}` : reschedulingAppt.title;
      
      const dateString = newStart.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const timeString = newStart.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
      
      showConfirm(
        "אישור העברת תור",
        `האם להעביר את התור של ${patientName} ליום ${dateString} בשעה ${timeString}?`,
        async () => {
          const updatedAppt: Appointment = {
            ...reschedulingAppt,
            start: newStart.toISOString(),
            end: newEnd.toISOString()
          };
          try {
            await setDoc(doc(db, 'appointments', reschedulingAppt.id), updatedAppt);
            playOpeningChime(); // Play the chime to confirm success!
            setReschedulingAppt(null);
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `appointments/${reschedulingAppt.id}`);
          }
        },
        undefined,
        "העבר תור",
        "השאר במועד המקורי"
      );
      return;
    }

    setSelectedDate({
      start: selectInfo.startStr,
      end: selectInfo.endStr
    });
    setModalMode('create');
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleDateClick = (info: any) => {
    // Direct date click logic for rescheduling slot selection
    if (reschedulingAppt) {
      handleDateSelect({
        startStr: info.dateStr,
        start: info.date,
        view: info.view
      });
      return;
    }

    // Switch view to timeGridDay of the clicked date if we are currently in Month search/view
    if (info.view?.type === 'dayGridMonth') {
      const calendarApi = info.view.calendar;
      if (calendarApi) {
        calendarApi.changeView('timeGridDay', info.date);
      }
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const apptId = clickInfo.event.id;
    
    if (reschedulingAppt) {
      if (reschedulingAppt.id === apptId) {
        setReschedulingAppt(null);
        showConfirm(
          "העברת תור בוטלה",
          "בוטל מצב העברת התור.",
          () => {},
          undefined,
          "הבנתי",
          "",
          true
        );
        return;
      }
      showConfirm(
        "מצב העברת תור פעיל כעת",
        "מצב העברת תור פעיל כעת. האם ברצונכם לבטל את העברת התור הנוכחי כדי להציג את פרטי תור זה?",
        () => {
          setReschedulingAppt(null);
          const matched = appointments.find(a => a.id === apptId);
          if (matched) {
            setSelectedAppointment(matched);
            setModalMode('edit');
            setIsModalOpen(true);
          }
        },
        undefined,
        "כן, בטל העברה",
        "לא, המשך במצב העברה"
      );
      return;
    }

    const matched = appointments.find(a => a.id === apptId);
    if (matched) {
      setSelectedAppointment(matched);
      setModalMode('edit');
      setIsModalOpen(true);
    }
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleEventDrop = async (info: any) => {
    const { event } = info;
    const appt = appointments.find(a => a.id === event.id);
    if (!appt) return;
    const itemStart = event.startStr || event.start?.toISOString() || appt.start;
    const startDate = new Date(itemStart);

    // Validation (Thursday vs other weekdays)
    const dayOfWeek = startDate.getDay();
    const hours = startDate.getHours();
    const minutes = startDate.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (dayOfWeek === 4) { // Thursday (יום חמישי)
      if (totalMinutes > 18 * 60) {
        alert("שגיאה בקליניקה: בימי חמישי המרפאה פעילה רק עד השעה 18:15 (משבצת שיבוץ אחרונה מותרת: 18:00). התור הוחזר למיקומו המקורי.");
        info.revert();
        return;
      }
    } else { // Other days (שאר ימי השבוע)
      if (totalMinutes > 18 * 60 + 30) {
        alert("שגיאה בקליניקה: משבצת השיבוץ האחרונה המותרת בשאר ימי השבוע היא 18:30 (מסתיים ב-18:45). התור הוחזר למיקומו המקורי.");
        info.revert();
        return;
      }
    }

    const endDate = new Date(startDate.getTime() + 15 * 60 * 1000);
    const updatedAppt: Appointment = {
      ...appt,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
    try {
      await setDoc(doc(db, 'appointments', event.id), updatedAppt);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${event.id}`);
    }
  };

  const handleEventResize = async (info: any) => {
    const { event } = info;
    const appt = appointments.find(a => a.id === event.id);
    if (!appt) return;
    const itemStart = event.startStr || event.start?.toISOString() || appt.start;
    const startDate = new Date(itemStart);

    // Validation (Thursday vs other weekdays)
    const dayOfWeek = startDate.getDay();
    const hours = startDate.getHours();
    const minutes = startDate.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (dayOfWeek === 4) { // Thursday (יום חמישי)
      if (totalMinutes > 18 * 60) {
        alert("שגיאה בקליניקה: בימי חמישי המרפאה פעילה רק עד השעה 18:15 (משבצת שיבוץ אחרונה מותרת: 18:00). התור הוחזר למיקומו המקורי.");
        info.revert();
        return;
      }
    } else { // Other days (שאר ימי השבוע)
      if (totalMinutes > 18 * 60 + 30) {
        alert("שגיאה בקליניקה: משבצת השיבוץ האחרונה המותרת בשאר ימי השבוע היא 18:30 (מסתיים ב-18:45). התור הוחזר למיקומו המקורי.");
        info.revert();
        return;
      }
    }

    const endDate = new Date(startDate.getTime() + 15 * 60 * 1000);
    const updatedAppt: Appointment = {
      ...appt,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
    try {
      await setDoc(doc(db, 'appointments', event.id), updatedAppt);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${event.id}`);
    }
  };

  // --- APPOINTMENT PERSISTENCE ---
  const handleSaveAppointment = async (data: Omit<Appointment, 'id'> & { id?: string }) => {
    // Check if the appointment modal trigger set smsStatus to sent, if so, append to log feed!
    const wasSmsSent = data.smsStatus === 'sent';
    const patientObj = patients.find(p => p.id === data.patientId);

    if (wasSmsSent && patientObj) {
      // Check if already in log or append a new entry
      const sampleText = `שלום ${patientObj.firstName}, תזכורת לתורך במרפאת DENTE מומחים פה ולסת ב-${new Date(data.start).toLocaleDateString('he-IL')} בשעה ${new Date(data.start).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}. לאישור נא השב 1.`;
      const isAlreadyLogged = smsLog.some(l => l.message === sampleText);
      
      if (!isAlreadyLogged) {
        const newLog: SMSLogEntry = {
          id: `sms-${Date.now()}`,
          patientName: `${patientObj.firstName} ${patientObj.familyName}`,
          phoneNumber: patientObj.phoneNumber,
          message: sampleText,
          timestamp: new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'}),
          status: 'sent'
        };
        const updatedLogs = [newLog, ...smsLog].slice(0, 15);
        setSmsLog(updatedLogs);
        localStorage.setItem('clinic_sms_logs', JSON.stringify(updatedLogs));
        
        // deduct balance
        setSmsCredit(c => {
          const val = Math.max(0, c - 1);
          setDoc(doc(db, 'settings', 'global'), {
            id: 'global',
            systemTheme,
            smsApiKey,
            smsSenderId,
            smsTemplate,
            smsCredit: val,
            smsProvider
          }, { merge: true }).catch(err => console.error("Error writing SMS credits to settings:", err));
          return val;
        });
      }
    }

    const targetId = data.id || `a-${Date.now()}`;
    const newAppt: Appointment = {
      ...data,
      id: targetId
    } as Appointment;

    try {
      await setDoc(doc(db, 'appointments', targetId), newAppt);
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, data.id ? OperationType.UPDATE : OperationType.CREATE, `appointments/${targetId}`);
    }
  };

  const handleDeleteAppointment = (id: string) => {
    const appt = appointments.find(a => a.id === id);
    const patient = appt ? patients.find(p => p.id === appt.patientId) : null;
    const patientName = patient 
      ? `${patient.firstName} ${patient.familyName}` 
      : (appt ? appt.title : 'התור המבוקש');

    showConfirm(
      'אזהרה: ביטול תור בקליניקה ⚠️',
      `האם אתה בטוח לחלוטין שברצונך לבטל ולמחוק לצמיתות את התור של ${patientName}? פעולה זו תסיר את הפגישה מכל יומני המרפאה ואינה ניתנת לשיחזור.`,
      async () => {
        try {
          await deleteDoc(doc(db, 'appointments', id));
          setIsModalOpen(false);
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
        }
      },
      undefined,
      'כן, בטל תור',
      'לא, אל תבטל'
    );
  };

  // Format appointments into FullCalendar Events with custom color and arrival confirmation metadata
  const calendarEvents = appointments.map(appt => {
    const patient = patients.find(p => p.id === appt.patientId);
    return {
      id: appt.id,
      title: appt.title,
      start: appt.start,
      end: appt.end,
      extendedProps: {
        patient,
        firstReminder: appt.firstReminder,
        finalConfirmation: appt.finalConfirmation,
        notes: appt.notes,
        color: appt.color || 'mint',
        arrivalConfirmed: appt.arrivalConfirmed || false,
        dealClosed: appt.dealClosed || false,
        bookedBy: appt.bookedBy || '',
        smsStatus: appt.smsStatus || 'idle',
        noShow: appt.noShow || false
      }
    };
  });

  // Custom Rendering of events inside Calendar cells with high-visibility professional layout
  const renderEventContent = (eventInfo: any) => {
    const { patient, color, firstReminder, finalConfirmation, arrivalConfirmed, dealClosed, bookedBy, noShow } = eventInfo.event.extendedProps;
    
    // Custom fine pastel classifications with high-contrast text tones & matching right solid borders
    let bgClasses = "bg-[#f0fdf4] hover:bg-[#e1fbf0]";
    let accentBorderClass = "border-[#10b981]";
    let subTextColor = "text-teal-900/80";
    let dashedBorderColor = "border-teal-300/80";
    
    if (color === 'orange') {
      bgClasses = "bg-[#fefce8] hover:bg-[#fef9c3]";
      accentBorderClass = "border-amber-500";
      subTextColor = "text-amber-900/80";
      dashedBorderColor = "border-amber-300/80";
    } else if (color === 'pink') {
      bgClasses = "bg-[#fdf4ff] hover:bg-[#fae8ff]";
      accentBorderClass = "border-pink-500";
      subTextColor = "text-pink-900/80";
      dashedBorderColor = "border-pink-300/80";
    }

    // Helper to format start/end times precisely
    const formatTimeStr = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
      } catch {
        return '';
      }
    };

    const startTime = formatTimeStr(eventInfo.event.start);
    const displayName = patient 
      ? `${patient.firstName} ${patient.familyName}` 
      : eventInfo.event.title;
    const treatmentTitle = patient ? eventInfo.event.title : '';

    // Check View type
    const isDayView = eventInfo.view?.type === 'timeGridDay';

    // Hover event handlers matching user's instruction (At least 1 second stay triggers popup)
    const handleMouseEnter = (e: React.MouseEvent) => {
      if (activeHidingTimerRef.current) {
        clearTimeout(activeHidingTimerRef.current);
        activeHidingTimerRef.current = null;
      }
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      const rect = e.currentTarget.getBoundingClientRect();
      // Store centered horizontal position and bottom vertical position for tooltip placement
      const x = rect.left + rect.width / 2;
      const y = rect.bottom + window.scrollY;

      const matchingAppt = appointments.find(a => a.id === eventInfo.event.id);
      if (matchingAppt) {
        hoverTimerRef.current = setTimeout(() => {
          setHoveredEventData({
            appointment: matchingAppt,
            patient,
            x,
            y
          });
        }, 1000); // 1 second delay
      }
    };

    const handleMouseLeave = () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      activeHidingTimerRef.current = setTimeout(() => {
        setHoveredEventData(null);
      }, 350); // 350ms delay to allow moving to popup
    };

    const hasAnyActiveBadge = noShow || dealClosed || arrivalConfirmed || firstReminder || finalConfirmation;

    // If NOT Day View, render simplified layout prioritizing the name and status badges
    if (!isDayView) {
      return (
        <div 
          className={`relative w-full h-full p-2 rounded-xl border-y border-l border-dashed ${dashedBorderColor} border-r-[5px] ${accentBorderClass} ${bgClasses} transition-all duration-150 flex flex-col justify-between overflow-hidden text-right leading-tight select-none shadow-3xs cursor-pointer`}
          id={`calendar-event-render-${eventInfo.event.id}`}
          dir="rtl"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {hasAnyActiveBadge && (
            <div className="absolute left-1 top-1 flex items-center gap-0.5 z-10 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-slate-200/50 shadow-3xs text-[10px] font-black shrink-0">
              {noShow && <span className="text-[11px] leading-none text-rose-600 font-extrabold" title="❌ הבריז / לא הגיע">❌</span>}
              {dealClosed && <span className="text-[12px] inline-block animate-bounce text-amber-500" title="👑 לקוח סגר עסקה משלמת" style={{ animationDuration: '3s' }}>👑</span>}
              {arrivalConfirmed && <span className="text-[9px] text-emerald-600 font-extrabold" title="✓✓ אישר הגעה בטוחה">✓✓</span>}
              {firstReminder && !arrivalConfirmed && <span className="w-3 h-3 bg-emerald-500 text-white rounded flex items-center justify-center text-[8px] font-bold shadow-3xs" title="✓ תזכורת ראשונה אושרה">✓</span>}
              {finalConfirmation && <span className="text-[11px] inline-block text-sky-600 animate-pulse font-extrabold" title="✈️ אישור מעקב סופי - מעקב">✈️</span>}
            </div>
          )}
          <div className="flex flex-col min-w-0 h-full justify-between gap-1">
            {/* Header: Name and Time side-by-side or stacked cleanly */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <span className="font-mono text-[9px] font-black text-[#0f766e]">
                ⏰ {startTime}
              </span>
              <span className="text-[11px] sm:text-[12px] font-black text-slate-950 whitespace-normal break-words leading-tight" title={displayName}>
                {displayName}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Full Detailed Render for Day View (where plenty of width is available)
    return (
      <div 
        className={`relative w-full h-full p-2.5 sm:p-3 rounded-xl border-y border-l border-dashed ${dashedBorderColor} border-r-[6px] ${accentBorderClass} ${bgClasses} transition-all duration-150 flex flex-col justify-between overflow-hidden text-right leading-tight select-none shadow-3xs cursor-pointer`}
        id={`calendar-event-render-${eventInfo.event.id}`}
        dir="rtl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hasAnyActiveBadge && (
          <div className="absolute left-1.5 top-1.5 flex items-center gap-0.5 z-10 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-lg border border-slate-200/50 shadow-3xs text-[11px] font-black shrink-0">
            {noShow && <span className="text-[12px] leading-none text-rose-600 font-extrabold" title="❌ הבריז / לא הגיע">❌</span>}
            {dealClosed && <span className="text-[13px] inline-block animate-bounce text-amber-500" title="👑 לקוח סגר עסקה משלמת" style={{ animationDuration: '3s' }}>👑</span>}
            {arrivalConfirmed && <span className="text-[10px] text-emerald-600 font-extrabold" title="✓✓ אישר הגעה בטוחה">✓✓</span>}
            {firstReminder && !arrivalConfirmed && <span className="w-3.5 h-3.5 bg-emerald-500 text-white rounded flex items-center justify-center text-[8.5px] font-bold shadow-3xs" title="✓ תזכורת ראשונה אושרה">✓</span>}
            {finalConfirmation && <span className="text-[12px] inline-block text-sky-600 animate-pulse font-extrabold" title="✈️ אישור מעקב סופי - מעקב">✈️</span>}
          </div>
        )}
        <div className="flex flex-col min-w-0 h-full justify-between gap-1">
          
          {/* Row 1: Patient Name (Bold, High Contrast Black & Fully visible) and Start Hour */}
          <div className="flex items-center justify-between text-[11px] sm:text-[12.8px] font-black text-slate-950 border-b border-slate-900/10 pb-1.5 shrink-0">
            <span className="whitespace-normal break-words font-black text-slate-950 max-w-[80%]" title={displayName}>
              {displayName}
            </span>
            <span className="font-mono text-[9.5px] sm:text-[11px] font-black text-black bg-white/90 px-1 py-0.2 rounded border border-slate-200 shadow-3xs shrink-0 select-all">
              {startTime}
            </span>
          </div>

          {/* Row 2: Treatment Details & Representative details */}
          <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
            <p className={`text-[10px] sm:text-[11.5px] font-extrabold ${subTextColor} truncate`}>
              {treatmentTitle ? `🦷 ${treatmentTitle}` : '📅 פגישה כללית'}
            </p>
            {bookedBy && (
              <p className="text-[8px] sm:text-[9.5px] text-slate-600 font-bold truncate mt-0.5 flex items-center gap-0.5">
                <span>👤 נקבע ע"י:</span>
                <span className="text-slate-900 font-extrabold">{bookedBy}</span>
              </p>
            )}
          </div>

          {/* Row 3: Bottom Meta Info - Phone Number, Status Badges */}
          {patient && (
            <div className="mt-auto pt-1 rounded-sm border-t border-slate-900/10 flex items-center justify-between text-[9px] sm:text-[10px] shrink-0 font-medium text-slate-800">
              <span className="font-mono font-black tracking-tight text-slate-955 flex items-center gap-0.5 select-all">
                <span>📞</span>
                <span>{patient.phoneNumber}</span>
              </span>
              
              {/* Dynamic Status Symbols combined elegantly */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="opacity-40 hover:opacity-95 text-[10px] transition-opacity cursor-pointer font-bold text-[#0f766e]" title="תור פעיל קליני">↺</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Active Representative computed info
  const activeRep = representatives.find(r => r.id === activeRepresentativeId) || {
    id: 'rep-1',
    name: 'יובל כהן',
    role: 'admin' as const,
    gender: 'male' as const
  };

  // Stable pseudorandom gender-tailored motivational banner picker
  const motivationalMessage = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const halfDay = new Date().getHours() < 14 ? 'am' : 'pm';
    const seed = `${todayStr}-${halfDay}-${activeRep.name}`;
    
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % 30;

    const pool = activeRep.gender === 'female' ? MOTIVATIONAL_FEMALE_QUOTES : MOTIVATIONAL_MALE_QUOTES;
    return pool[index];
  }, [activeRep.name, activeRep.gender]);

  // Stats calculation
  const firstReminderCount = appointments.filter(a => a.firstReminder).length;
  const finalConfirmationCount = appointments.filter(a => a.finalConfirmation).length;
  const arrivalConfirmedCount = appointments.filter(a => a.arrivalConfirmed).length;
  const dealClosedCount = appointments.filter(a => a.dealClosed).length;

  const themeConfig = DENTE_THEMES[systemTheme] || DENTE_THEMES['hospital-mint'];

  if (!isLoggedIn) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (loginUsername.trim().toLowerCase() === 'dente' && loginPassword === '2020') {
        setIsLoggedIn(true);
        localStorage.setItem('dente_logged_in', 'true');
        showToast("חיבור מאובטח אושר", "ברוכים הבאים למערכת DENTE!", "success");
        setLoginError('');
        playDenteRockAnthem(); // Play the custom motivating sound!
      } else {
        setLoginError("שם משתמש או סיסמה שגויים. נסו שוב.");
      }
    };

    return (
      <div className="min-h-screen bg-[#f0f9f6] flex items-center justify-center p-4 relative overflow-hidden" dir="rtl" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Soft aesthetic background glows with elegant pastel colors */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl" />

        <div className="bg-white/95 backdrop-blur-md border border-teal-100/80 max-w-sm w-full rounded-2xl shadow-xl shadow-teal-950/5 p-8 text-right space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-4 bg-[#f0f9f6] rounded-2xl border border-teal-100/65 shadow-inner">
              <span className="text-3xl text-teal-600 animate-bounce">🔐</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">כניסה מאובטחת - DENTE</h2>
              <p className="text-[10px] text-slate-500 font-bold">אנא הזן את פרטי הגישה האישיים שלך עבור DENTE</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-slate-600">שם משתמש:</label>
              <input
                type="text"
                required
                placeholder="הזן שם משתמש"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full font-sans text-xs py-2.5 px-4 bg-slate-50/65 border border-slate-250 text-slate-800 placeholder-slate-400 outline-none rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-slate-600">סיסמה סודית:</label>
              <input
                type="password"
                required
                placeholder="הזן סיסמה סודית"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full font-mono text-xs tracking-widest py-2.5 px-4 bg-slate-50/65 border border-slate-250 text-slate-800 placeholder-slate-400 outline-none rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-center"
              />
            </div>

            {loginError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-500 font-bold leading-relaxed text-right animate-pulse">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 border-none mt-2 active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5 ml-1" />
              <span>התחבר למערכת</span>
            </button>
          </form>

          <div className="border-t border-slate-100 pt-3 text-center">
            <p className="text-[9px] text-slate-400 font-extrabold tracking-wide uppercase">
              DENTE SPECIALISTS © 2026 - כניסה מורשית בלבד
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeConfig.bg} text-slate-700 flex flex-col font-sans transition-colors duration-200`} id="app-root-container" dir="rtl" data-theme={systemTheme}>
      
      {/* Top Professional Header Bar in soothing pastel gradients with DENTE Specialists brand */}
      <header className={`bg-white border-b ${themeConfig.headerBorder} px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-40`} id="clinic-header">
        <div className="flex items-center gap-4">
          {/* Custom SVG Logo representation of DENTE מומחים פה ולסת using professional Golden Tooth & Implant Screw design without dark background */}
          <div className="flex items-center justify-center p-1 hover:scale-105 transition-transform duration-200" id="dente-specialists-logo">
            <svg width="70" height="70" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* THE SHINY SOLID GOLD TOOTH CROWN & CLINICAL IMPLANT SCREW - Rendered beautifully directly on modern background */}
              {/* Soft gold backing aura glow to make the implant look magnificent and pop */}
              <circle cx="60" cy="60" r="30" fill="url(#gold-aura-glow)" opacity="0.12" />
              
              {/* THE SHINY SOLID GOLD TOOTH CROWN & CLINICAL IMPLANT SCREW */}
              {/* 1. SOLID GOLD TOOTH CROWN (Detailed organic dental shape with two root cusps and left-right bevels) */}
              <path 
                d="M 60 26
                   C 53 19, 41 18, 35 26
                   C 31 31.5, 30 40, 31 48
                   C 32.5 59, 39 71, 45 74
                   C 47.5 75, 49.5 73.5, 50.5 70
                   C 52.5 63, 54 55, 55 50
                   C 56 46, 56.5 44, 58 44
                   C 59.5 44, 60 46, 61 50
                   C 62 55, 63.5 63, 65.5 70
                   C 66.5 73.5, 68.5 75, 71 74
                   C 77 71, 83.5 59, 85 48
                   C 86 40, 85 31.5, 81 26
                   C 75 18, 67 19, 60 26 Z" 
                fill="url(#gold-metallic-3d)" 
                stroke="url(#gold-stroke-3d)" 
                strokeWidth="1.5" 
                strokeLinejoin="round"
              />
              
              {/* Elegant white/gold glossy edge highlight to produce immediate 3D depth */}
              <path 
                d="M 40 25
                   C 35 30, 34 38, 35 46" 
                stroke="#FFFFFF" 
                strokeWidth="2" 
                strokeLinecap="round" 
                opacity="0.65" 
              />
              <path 
                d="M 60 29
                   C 57 26, 52 23, 44 24" 
                stroke="#FFFFFF" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                opacity="0.45" 
              />

              {/* Shading crease in the center of the crown */}
              <path 
                d="M 60 28 V 44" 
                stroke="url(#gold-shadow-3d)" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                opacity="0.6"
              />

              {/* 2. THE GOLD DENTAL IMPLANT SCREW THREADS (Detailed vertical stack matching the image) */}
              {/* Abutment base plate */}
              <path 
                d="M 52.5 50 H 67.5 V 53.5 H 52.5 Z" 
                fill="url(#gold-implant-threads)" 
                stroke="url(#gold-stroke-3d)" 
                strokeWidth="0.8" 
              />

              {/* Thread 1 */}
              <path 
                d="M 48 55 H 72 C 73.5 55, 73.5 59, 72 59 H 48 C 46.5 59, 46.5 55, 48 55 Z" 
                fill="url(#gold-implant-threads)" 
                stroke="url(#gold-stroke-3d)" 
                strokeWidth="0.8" 
              />

              {/* Thread 2 */}
              <path 
                d="M 49.5 60.5 H 70.5 C 72 60.5, 72 64.5, 70.5 64.5 H 49.5 C 48 64.5, 48 60.5, 49.5 60.5 Z" 
                fill="url(#gold-implant-threads)" 
                stroke="url(#gold-stroke-3d)" 
                strokeWidth="0.8" 
              />

              {/* Thread 3 */}
              <path 
                d="M 51 66 H 69 C 70.5 66, 70.5 70, 69 70 H 51 C 49.5 70, 49.5 66, 51 66 Z" 
                fill="url(#gold-implant-threads)" 
                stroke="url(#gold-stroke-3d)" 
                strokeWidth="0.8" 
              />

              {/* Thread 4 */}
              <path 
                d="M 52.5 71.5 H 67.5 C 69 71.5, 69 75.5, 67.5 75.5 H 52.5 C 51 75.5, 51 71.5, 52.5 71.5 Z" 
                fill="url(#gold-implant-threads)" 
                stroke="url(#gold-stroke-3d)" 
                strokeWidth="0.8" 
              />

              {/* Thread 5 */}
              <path 
                d="M 54 77 H 66 C 67.5 77, 67.5 81, 66 81 H 54 C 52.5 81, 52.5 77, 54 77 Z" 
                fill="url(#gold-implant-threads)" 
                stroke="url(#gold-stroke-3d)" 
                strokeWidth="0.8" 
              />

              {/* Thread 6 */}
              <path 
                d="M 55.5 82.5 H 64.5 C 66 82.5, 66 86.5, 64.5 86.5 H 55.5 C 54 86.5, 54 82.5, 55.5 82.5 Z" 
                fill="url(#gold-implant-threads)" 
                stroke="url(#gold-stroke-3d)" 
                strokeWidth="0.8" 
              />

              {/* Tapered final screw apical tip */}
              <path 
                d="M 57 88 C 57 88, 57.5 91, 58 93 C 58.5 95, 61.5 95, 62 93 C 62.5 91, 63 88, 63 88 Z" 
                fill="url(#gold-implant-threads)" 
                stroke="url(#gold-stroke-3d)" 
                strokeWidth="0.8" 
                strokeLinejoin="round" 
              />

              {/* Vertical core highlight running through the screw center for metallic 3D sheen */}
              <path d="M 60 51 V 91" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.65" strokeLinecap="round" />

              {/* Premium luxury diamond sparkle overlays like on the picture frame */}
              <path d="M 82 22 L 84 25 L 87 22 L 84 19 Z" fill="#FFFBE6" opacity="0.9" />
              <path d="M 33 68 L 34.5 70 L 36 68 L 34.5 66 Z" fill="#FFFBE6" opacity="0.95" />

              <defs>
                {/* 3D Gold Frame Multi-stop Luxury Gradient */}
                <linearGradient id="gold-frame-gradient" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFF2B1" />
                  <stop offset="15%" stopColor="#ECC663" />
                  <stop offset="30%" stopColor="#AF831B" />
                  <stop offset="45%" stopColor="#F9EAA2" />
                  <stop offset="60%" stopColor="#E2B73F" />
                  <stop offset="75%" stopColor="#815B06" />
                  <stop offset="90%" stopColor="#ECC663" />
                  <stop offset="100%" stopColor="#AA7A12" />
                </linearGradient>

                <linearGradient id="gold-highlight-gradient" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#E2B73F" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>

                {/* Dark obsidian stone background with subtle dynamic tones */}
                <radialGradient id="dark-obsidian-marble" cx="60" cy="60" r="52" fx="35" fy="35" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1E262A" />
                  <stop offset="40%" stopColor="#0E1214" />
                  <stop offset="100%" stopColor="#040607" />
                </radialGradient>

                {/* Highly reflective organic golden tooth gradient */}
                <linearGradient id="gold-metallic-3d" x1="30" y1="18" x2="85" y2="74" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFEE9" />
                  <stop offset="20%" stopColor="#F3D172" />
                  <stop offset="40%" stopColor="#C99B22" />
                  <stop offset="60%" stopColor="#FAEA9C" />
                  <stop offset="80%" stopColor="#B4820B" />
                  <stop offset="100%" stopColor="#7F5600" />
                </linearGradient>

                {/* Shading/outline gradient to carve out the beautiful structural boundaries */}
                <linearGradient id="gold-stroke-3d" x1="30" y1="18" x2="85" y2="74" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFF2B1" />
                  <stop offset="50%" stopColor="#9C710E" />
                  <stop offset="100%" stopColor="#553A00" />
                </linearGradient>

                {/* Dark rich gold shadows for the organic curves */}
                <linearGradient id="gold-shadow-3d" x1="60" y1="28" x2="60" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6C4E04" />
                  <stop offset="100%" stopColor="#FFF2B1" stopOpacity="0" />
                </linearGradient>

                {/* Implant screw gradient emphasizing surgical precision */}
                <linearGradient id="gold-implant-threads" x1="45" y1="50" x2="75" y2="95" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FAEA9C" />
                  <stop offset="25%" stopColor="#D2A429" />
                  <stop offset="50%" stopColor="#916407" />
                  <stop offset="75%" stopColor="#FAEA9C" />
                  <stop offset="100%" stopColor="#604100" />
                </linearGradient>

                {/* Soft backdrop glow to make the logo look magical */}
                <radialGradient id="gold-aura-glow" cx="60" cy="60" r="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ECC663" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ECC663" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="gold-matte-gradient" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#8A6D1C" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="text-right">
            <h1 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              DENTE מרפאת מומחים פה ולסת
            </h1>
            <p className="text-[11px] text-slate-500 font-bold flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className={themeConfig.accentText}>רוזנסקי 4, ראשון לציון (קומה 3)</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-semibold">לוח תיאום וניהול תורים</span>
            </p>
          </div>
        </div>

        {/* Live System Time and Statistics */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6" id="header-metadata-box">

          <div className={`${themeConfig.statsBg} px-3.5 py-1.5 rounded-xl border ${themeConfig.statsBorder} flex items-center gap-2`}>
            <UserIcon className={`w-4 h-4 ${themeConfig.statsText} shrink-0`} />
            <div className="text-right font-medium">
              <span className={`block text-[8px] font-extrabold ${themeConfig.statsText} uppercase font-sans tracking-wider`}>משתמש תחנה פעיל</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                שלום, {activeRep.name}
                <span className={`text-[8px] px-1.5 py-0.2 rounded-full border font-black ${
                  activeRep.role === 'admin' 
                    ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-3xs' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  {activeRep.role === 'admin' ? 'מנהל 👑' : 'נציג מורשה'}
                </span>
              </span>
            </div>
          </div>

          <div className={`${themeConfig.statsBg} px-4 py-1.5 rounded-xl border ${themeConfig.statsBorder} flex items-center gap-2.5`}>
            <Clock className={`w-4 h-4 ${themeConfig.statsText} shrink-0`} />
            <div className="text-right font-medium flex items-center gap-1.5 text-xs font-bold text-slate-700 font-mono">
              <span>{currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-slate-300">|</span>
              <span className="text-[11px] text-slate-500 font-sans">{currentTime.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`bg-white border ${themeConfig.border} rounded-xl px-3.5 py-1.5 flex flex-col text-center min-w-[75px]`}>
              <span className="text-[9px] text-slate-400 font-extrabold">מטופלים רשומים</span>
              <span className={`text-xs font-extrabold font-mono mt-0.5 ${themeConfig.accentText}`}>{patients.length}</span>
            </div>
            <div className={`bg-white border ${themeConfig.border} rounded-xl px-3.5 py-1.5 flex flex-col text-center min-w-[75px]`}>
              <span className="text-[9px] text-slate-400 font-extrabold font-sans">תורים פעילים</span>
              <span className="text-xs font-extrabold font-mono text-indigo-700 mt-0.5">{appointments.length}</span>
            </div>
          </div>

          {/* 🎵 Motivational Anthem Button */}
          <button
            type="button"
            onClick={playDenteRockAnthem}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-teal-700 bg-teal-50 hover:bg-teal-100/80 rounded-xl transition-all border border-teal-200/50 cursor-pointer shadow-3xs active:scale-[0.97]"
            title="הפעל מנגינת מוטיבציה מלהיבה (DENTE Rock Anthem) 🎵"
          >
            <span className="text-sm select-none">🎵</span>
            <span>קצב מוטיבציה!</span>
          </button>

          {/* Secure Logout Action Button */}
          <button
            type="button"
            onClick={() => {
              showConfirm(
                "התנתקות מהמערכת 🔐",
                "האם אתה בטוח שברצונך להתנתק מלוח הניהול המאובטח של DENTE?",
                () => {
                  setIsLoggedIn(false);
                  localStorage.removeItem('dente_logged_in');
                  showToast("התנתקת בהצלחה", "לוח הניהול ננעל בצורה מאובטחת.", "info");
                }
              );
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100/85 rounded-xl transition-all border-none cursor-pointer shadow-3xs"
            title="התנתק מהמערכת באופן מאובטח"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>התנתק</span>
          </button>
        </div>
      </header>

      {/* Motivational Banner Area */}
      <AnimatePresence>
        {showMotivationalBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0, overflow: 'hidden' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 shrink-0 relative" 
            id="motivational-banner-wrapper"
          >
            <div className={`relative bg-gradient-to-r ${themeConfig.bannerGradient} border ${themeConfig.border} bg-white rounded-2xl p-4 sm:p-5 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-4 text-right overflow-hidden`} id="motivational-sales-banner">
              
              {/* Close Button & Timer Display */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                <span className="text-[9px] font-extrabold text-[#94a3b8] bg-[#f8fafc] border border-slate-100 rounded-md px-1.5 py-0.5">
                  ⏱️ {motivationTimeLeft} ש׳
                </span>
                <button
                  onClick={() => setShowMotivationalBanner(false)}
                  className="w-5 h-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-transparent font-black"
                  title="סגור באנר"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-3.5 pr-2 pl-12 md:pl-0 md:pr-0">
                <div className="w-10 h-10 rounded-full bg-amber-550/10 flex items-center justify-center text-xl shrink-0">
                  🚀
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>פינת המוטיבציה והמכירות היומית של {activeRep.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono italic">
                      (משפט מס׳ {1 + (new Date().getDate() % 30)} מתוך 30)
                    </span>
                  </h4>
                  <p className="text-xs font-extrabold text-slate-800 leading-relaxed mt-1">{motivationalMessage}</p>
                </div>
              </div>
              
              <div className="bg-amber-100/50 border border-amber-200/50 rounded-xl px-4 py-2 flex items-center gap-3 shrink-0">
                <span className="text-[20px] animate-bounce" style={{ animationDuration: '4s' }}>🏆</span>
                <div>
                  <span className="block text-[8px] font-bold text-amber-700/80">יעד קבוצתי חודשי</span>
                  <span className="text-xs font-black text-amber-900">שימור 95% אישורי הגעה ומעקבים פתוחים!</span>
                </div>
              </div>

              {/* Progress timer bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100">
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(motivationTimeLeft / 20) * 100}%` }}
                />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="main-grid">
        
        {/* Right column in standard RTL: Directory & Registration + Customizers */}
        <section className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-auto" id="left-sidebar">
          
          <PatientForm 
            patients={patients}
            onAddPatient={handleAddPatient}
            onDeletePatient={handleDeletePatient}
            appointments={appointments}
            onUpdatePatient={handleUpdatePatient}
            representatives={representatives}
          />

          {/* DENTE Modern Control Center Options */}
          <div className="space-y-3" id="system-quick-controls">
            {/* 1. Design Config Button (עיצוב) */}
            <div className={`bg-white rounded-2xl border ${themeConfig.border} shadow-2xs hover:shadow-xs transition-all overflow-hidden text-right`}>
              <button
                type="button"
                onClick={() => setIsDesignModalOpen(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-right transition-all duration-155 group cursor-pointer border-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-105 transition-all flex items-center justify-center">
                    <span className="text-base select-none">🎨</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-black text-slate-800 leading-tight">עיצוב</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">סיווגי צבעים, ספקי WhatsApp וצלילים</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pl-1">
                  <span className="text-xs text-slate-400 group-hover:-translate-x-1 transition-transform">◀</span>
                </div>
              </button>
            </div>

            {/* 2. Representatives/Users Config Button */}
            <div className={`bg-white rounded-2xl border ${themeConfig.border} shadow-2xs hover:shadow-xs transition-all overflow-hidden text-right`}>
              <button
                type="button"
                onClick={() => setIsUsersManagementModalOpen(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-right transition-all duration-155 group cursor-pointer border-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-all flex items-center justify-center">
                    <span className="text-base select-none">👥</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-black text-slate-800 leading-tight">ניהול משתמשים ונציגים מורשים</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">הגדרת הרשאות, זהות תחנה ורישום מורשיי קליניקה</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pl-1">
                  <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-full border ${
                    activeRep.role === 'admin'
                      ? 'bg-amber-50 border-amber-250 text-amber-800'
                      : 'bg-rose-50 border-rose-250 text-rose-800'
                  }`}>
                    {activeRep.role === 'admin' ? 'מנהל' : 'נציג 🔒'}
                  </span>
                  <span className="text-xs text-slate-400 group-hover:-translate-x-1 transition-transform">◀</span>
                </div>
              </button>
            </div>

            {/* 3. Backup and Restore Config Button */}
            <div className={`bg-white rounded-2xl border ${themeConfig.border} shadow-2xs hover:shadow-xs transition-all overflow-hidden text-right`}>
              <button
                type="button"
                onClick={() => setIsBackupRestoreModalOpen(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-right transition-all duration-155 group cursor-pointer border-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-105 transition-all flex items-center justify-center">
                    <span className="text-base select-none">💾</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-black text-slate-800 leading-tight">גיבוי ושחזור נתונים אוטומטי</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">ניהול נקודות זמן בשרתי Google Cloud Firestore</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pl-1">
                  {lastAutoBackupDate ? (
                    <span className="text-[8px] bg-emerald-50 text-emerald-800 font-black px-1.5 py-0.5 rounded-full border border-emerald-250">
                      סונכרן
                    </span>
                  ) : (
                    <span className="text-[8px] bg-slate-50 text-slate-650 font-black px-1.5 py-0.5 rounded-full border border-slate-200">
                      לא מגובה
                    </span>
                  )}
                  <span className="text-xs text-slate-400 group-hover:-translate-x-1 transition-transform">◀</span>
                </div>
              </button>
            </div>

            {/* 4. Daily Report & Printing Layout Option */}
            <div className={`bg-white rounded-2xl border ${themeConfig.border} shadow-2xs hover:shadow-xs transition-all overflow-hidden text-right`}>
              <button
                type="button"
                onClick={() => setIsPrintReportModalOpen(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-right transition-all duration-155 group cursor-pointer border-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl group-hover:scale-105 transition-all flex items-center justify-center">
                    <span className="text-base select-none">🖨️</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-black text-slate-800 leading-tight">דוח תורים יומי</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5 font-sans">הפקת רשימת ייעוצים יומית והדפסה</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pl-1">
                  <span className="text-xs text-slate-400 group-hover:-translate-x-1 transition-transform">◀</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Left column in standard RTL: Interactive FullCalendar */}
        <section className="lg:col-span-8 space-y-4" id="calendar-workspace">
          {/* Active Rescheduling Indicator Banner */}
          {reschedulingAppt && (
            <div className="bg-amber-400 text-slate-900 border-2 border-amber-500 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse text-right" id="rescheduling-active-banner">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔄</span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-slate-950">מצב ניווט והעברת תור חופשי פעיל!</h4>
                  <p className="text-[11px] font-bold text-slate-800 mt-1 leading-relaxed">
                    התור של <strong>{patients.find(p => p.id === reschedulingAppt.patientId)?.firstName} {patients.find(p => p.id === reschedulingAppt.patientId)?.familyName}</strong> הועבר למצב הזזה. כעת באפשרותך לדפדף בחופשיות בין ימים, שבועות או חודשים ביומן. לחץ על משבצת הזמן החדשה הרצויה כדי למקם את התור!
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setReschedulingAppt(null)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-[11px] rounded-xl shadow-xs cursor-pointer transition-colors shrink-0"
              >
                ביטול העברה ✖
              </button>
            </div>
          )}

          {/* View Mode Switching Tab Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs" id="view-mode-selector">
            <h2 className="text-xs sm:text-xs font-black text-slate-800 flex items-center gap-2">
              <span>{viewMode === 'table' ? '📋 טבלת ניהול תורים מורחבת' : '📅 יומן תורים אינטראקטיבי'}</span>
            </h2>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer border-none ${
                  viewMode === 'table' ? 'bg-white text-indigo-700 shadow-3xs' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                📋 טבלת תורים
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer border-none ${
                  viewMode === 'calendar' ? 'bg-white text-indigo-700 shadow-3xs' : 'text-slate-500 hover:text-slate-855'
                }`}
              >
                📅 לוח שנה
              </button>
            </div>
          </div>

          {/* Conditional Rendering logic for Views */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4.5 space-y-4" id="appointment-table-dashboard">
              {/* Search and Filters Strip */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-2">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                  {/* Search box */}
                  <div className="relative flex-1 min-w-[180px]">
                    <span className="absolute inset-y-0 right-3 flex items-center text-slate-450 pointer-events-none">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      placeholder="חיפוש מטופל, טלפון או סוג טיפול..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="w-full text-xs font-bold py-2 pr-8 pl-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 rounded-xl transition-all outline-none text-right"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={tableStatusFilter}
                    onChange={(e: any) => setTableStatusFilter(e.target.value)}
                    className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-400 outline-none cursor-pointer"
                  >
                    <option value="all">🔍 כל הסטטוסים</option>
                    <option value="confirmed">✓✓ אושר הגעה</option>
                    <option value="unconfirmed">⏳ ממתין לאישור</option>
                    <option value="dealClosed">👑 סגר עסקה (משלם)</option>
                    <option value="reminded">✓ תזכורת פותחת</option>
                    <option value="finalConfirmed">✈️ מעקב קשוב</option>
                  </select>

                  {/* Staff Representative Dropdown */}
                  <select
                    value={tableRepFilter}
                    onChange={(e) => setTableRepFilter(e.target.value)}
                    className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-400 outline-none cursor-pointer text-slate-800"
                  >
                    <option value="all">👤 כל הצוות המטפל</option>
                    {(representatives.length > 0 ? representatives : SEED_REPRESENTATIVES).map(rep => (
                      <option key={rep.id} value={rep.name}>{rep.name}</option>
                    ))}
                  </select>

                  {/* Ascending/Descending date sorter */}
                  <button
                    type="button"
                    onClick={() => setTableSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer"
                    title="שנה כיוון מיון תאריכים"
                  >
                    <span>מיון: {tableSortOrder === 'asc' ? 'תאריך עולה ⬆️' : 'תאריך יורד ⬇️'}</span>
                  </button>
                </div>

                {/* Instant appointment addition */}
                <button
                  type="button"
                  onClick={() => {
                    const todayDate = new Date();
                    setSelectedDate({
                      start: todayDate.toISOString(),
                      end: new Date(todayDate.getTime() + 30 * 60 * 1000).toISOString()
                    });
                    setModalMode('create');
                    setSelectedAppointment(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 border-none cursor-pointer shadow-3xs transition-all shrink-0"
                >
                  <Plus className="w-4 h-4 ml-0.5" />
                  <span>קביעת תור חדש</span>
                </button>
              </div>

              {/* The responsive list body */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-3xs" id="table-scroll-wrapper">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-extrabold">
                      <th className="py-2.5 px-3.5 text-right font-black">תאריך ושעה</th>
                      <th className="py-2.5 px-3.5 text-right font-black">פרטי מטופל (לקוח)</th>
                      <th className="py-2.5 px-3.5 text-right font-black">מהות הטיפול קליני</th>
                      <th className="py-2.5 px-3.5 text-right font-black">נציג שקבע</th>
                      <th className="py-2.5 px-3.5 text-right font-black">סטטוסים ואישורים</th>
                      <th className="py-2.5 px-3.5 text-right font-black">הערות לטיפול</th>
                      <th className="py-2.5 px-3.5 text-center font-black">פעולות מהירות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let filtered = [...appointments];

                      // 1. Text search
                      if (tableSearch.trim()) {
                        const qLower = tableSearch.toLowerCase();
                        filtered = filtered.filter(appt => {
                          const patient = patients.find(p => p.id === appt.patientId);
                          const pName = patient ? `${patient.firstName} ${patient.familyName}`.toLowerCase() : '';
                          const pPhone = patient ? patient.phoneNumber : '';
                          const pCity = patient ? patient.city : '';
                          const apptTitle = appt.title ? appt.title.toLowerCase() : '';
                          const apptNotes = appt.notes ? appt.notes.toLowerCase() : '';
                          return pName.includes(qLower) || pPhone.includes(qLower) || pCity.includes(qLower) || apptTitle.includes(qLower) || apptNotes.includes(qLower);
                        });
                      }

                      // 2. Status filter
                      if (tableStatusFilter !== 'all') {
                        filtered = filtered.filter(appt => {
                          if (tableStatusFilter === 'confirmed') return appt.arrivalConfirmed;
                          if (tableStatusFilter === 'unconfirmed') return !appt.arrivalConfirmed;
                          if (tableStatusFilter === 'dealClosed') return appt.dealClosed;
                          if (tableStatusFilter === 'reminded') return appt.firstReminder;
                          if (tableStatusFilter === 'finalConfirmed') return appt.finalConfirmation;
                          return true;
                        });
                      }

                      // 3. Staff filter
                      if (tableRepFilter !== 'all') {
                        filtered = filtered.filter(appt => appt.bookedBy === tableRepFilter);
                      }

                      // 4. Sort order
                      filtered.sort((a, b) => {
                        const timeA = new Date(a.start).getTime();
                        const timeB = new Date(b.start).getTime();
                        return tableSortOrder === 'asc' ? timeA - timeB : timeB - timeA;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400 font-extrabold bg-slate-50/30">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <span className="text-xl">📅</span>
                                <span>לא נמצאו תורים מתאימים לסינון המבוקש.</span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((appt) => {
                        const patient = patients.find(p => p.id === appt.patientId);
                        const apptDate = new Date(appt.start);
                        const displayDate = apptDate.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const displayTime = apptDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

                        return (
                          <tr key={appt.id} className="border-b border-slate-100 hover:bg-slate-50/65 transition-colors group">
                            {/* Time */}
                            <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-indigo-500/80" />
                                <div>
                                  <span className="block font-sans text-xs font-black">{displayDate}</span>
                                  <span className="block text-[10px] text-indigo-600 mt-0.5 font-bold">{displayTime}</span>
                                </div>
                              </div>
                            </td>

                            {/* Patient Info */}
                            <td className="py-2.5 px-3.5">
                              {patient ? (
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-[#111827] text-xs block">{patient.firstName} {patient.familyName}</span>
                                  <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono bg-slate-100/80 rounded px-1 text-slate-700 select-all">📞 {patient.phoneNumber}</span>
                                    {patient.city && <span className="bg-[#f0fdfa] text-teal-800 px-1 rounded">📍 {patient.city}</span>}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-500 font-semibold italic">{appt.title || 'פגישה כללית'}</span>
                              )}
                            </td>

                            {/* Treatment Scope */}
                            <td className="py-2.5 px-3.5">
                              <span className="font-extrabold text-indigo-950 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50 block w-fit text-[11px]">
                                🦷 {appt.title}
                              </span>
                            </td>

                            {/* Created by */}
                            <td className="py-2.5 px-3.5 font-medium text-slate-600">
                              <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                                {appt.bookedBy || 'לא צוין'}
                              </span>
                            </td>

                            {/* Status and tags */}
                            <td className="py-2.5 px-3.5">
                              <div className="flex flex-wrap items-center gap-1 text-[9px] font-black">
                                {appt.arrivalConfirmed ? (
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-250 px-1.5 py-0.5 rounded-md" title="אושר הגעה">
                                    ✓✓ הגעה
                                  </span>
                                ) : (
                                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md" title="ממתין לאישור">
                                    ⏳ ממתין
                                  </span>
                                )}

                                {appt.dealClosed && (
                                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-bold" title="סגר עסקה">
                                    <span>👑 עסקה</span>
                                    {appt.dealAmount && <span className="font-sans font-black bg-white/70 px-1 py-0.2 rounded text-amber-950">₪{Number(appt.dealAmount).toLocaleString()}</span>}
                                  </span>
                                )}

                                {appt.dealClosed && appt.jawPromotion === 'one' && (
                                  <span className="bg-teal-50 text-teal-900 border border-teal-200 px-1.5 py-0.5 rounded-md text-[8.5px] font-black" title="מבצע לסת אחת">
                                    🦷 לסת אחת (שתלים + בר)
                                  </span>
                                )}

                                {appt.dealClosed && appt.jawPromotion === 'two' && (
                                  <span className="bg-indigo-50 text-indigo-900 border border-indigo-200 px-1.5 py-0.5 rounded-md text-[8.5px] font-black" title="מבצע שתי לסתות">
                                    🦷🦷 שתי לסתות (שתלים + בר)
                                  </span>
                                )}

                                {appt.firstReminder && (
                                  <span className="bg-sky-100 text-sky-850 px-1 py-0.5 rounded-md" title="תזכורת ראשונה אושרה">
                                    ✓ תזכורת
                                  </span>
                                )}

                                {appt.finalConfirmation && (
                                  <span className="bg-indigo-100 text-indigo-850 px-1 py-0.5 rounded-md" title="אישור מעקב קשוב">
                                    ✈️ מעקב
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Text Memo */}
                            <td className="py-2.5 px-3.5 max-w-[140px] truncate" title={appt.notes}>
                              <span className="text-[10px] text-slate-500 font-medium block overflow-hidden text-ellipsis select-all">
                                {appt.notes || <span className="text-slate-305 italic text-[10px]">אין הערות</span>}
                              </span>
                            </td>

                            {/* Action icons */}
                            <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const updated = { ...appt, arrivalConfirmed: !appt.arrivalConfirmed };
                                    try {
                                      await setDoc(doc(db, 'appointments', appt.id), updated);
                                      showToast(
                                        appt.arrivalConfirmed ? "בוטל אישור הגעה" : "אושר הגעה בהצלחה",
                                        appt.arrivalConfirmed ? "התור חזר לסטטוס ממתין." : "מטופל מסומן כמאושר הגעה ב-100%!",
                                        'success'
                                      );
                                    } catch (err) {
                                      handleFirestoreError(err, OperationType.UPDATE, `appointments/${appt.id}`);
                                    }
                                  }}
                                  className={`p-1 rounded-lg border transition-all cursor-pointer ${
                                    appt.arrivalConfirmed 
                                      ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700' 
                                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                  }`}
                                  title="שנה אישור הגעה (✓✓)"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>

                                <button
                                  type="button"
                                  onClick={async () => {
                                    const updated = { ...appt, dealClosed: !appt.dealClosed };
                                    try {
                                      await setDoc(doc(db, 'appointments', appt.id), updated);
                                      showToast(
                                        appt.dealClosed ? "בוטלה סגירת עסקה" : "סגירת עסקה אושרה!",
                                        appt.dealClosed ? "סטטוס לקוח משלם בוטל." : "ברכות! התור סומן כמכירה מוצלחת וסיווג עסקה.",
                                        'success'
                                      );
                                    } catch (err) {
                                      handleFirestoreError(err, OperationType.UPDATE, `appointments/${appt.id}`);
                                    }
                                  }}
                                  className={`p-1 rounded-lg border transition-all cursor-pointer ${
                                    appt.dealClosed 
                                      ? 'bg-amber-500 border-amber-500 text-slate-950 hover:bg-amber-655' 
                                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                  }`}
                                  title="שנה סטטוס סגירת עסקה (👑)"
                                >
                                  <Crown className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAppointment(appt);
                                    setModalMode('edit');
                                    setIsModalOpen(true);
                                  }}
                                  className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer"
                                  title="ערוך תור בקליניקה"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteAppointment(appt.id)}
                                  className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-600 rounded-lg transition-all cursor-pointer"
                                  title="בטל ומחק תור"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              {/* Soothing pastel guidelines info banner */}
              <div className={`bg-linear-to-r ${themeConfig.bannerGradient} border ${themeConfig.border} rounded-2xl p-4.5 flex gap-3 text-xs text-slate-800 shadow-3xs`} id="quick-tip-banner">
                <AlertCircle className={`w-5 h-5 ${themeConfig.accentText} shrink-0 mt-0.5`} />
                <div className="text-right flex-1">
                  <p className={`font-extrabold ${themeConfig.accentText}`}>ביצוע פעולות ישירות ביומן המרפאה</p>
                  <p className="text-slate-650 mt-1 leading-relaxed">
                    ניתן **לגרור ולשחרר** תורים (באמצעות לחיצה שמאלית ממושכת בעכבר) להחלפת ימים או שעות בקלות רבה. לחיצה על משבצת פנויה פותחת טופס רישום מלא, ולחיצה על תור קיים מאפשרת שינוי סטטוס טיפול, בחירת צבע סגנון ואישור הגעה.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-slate-600 font-bold border-t border-slate-100/50 pt-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center p-0.5 rounded-md bg-emerald-500 text-white shadow-3xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      תזכורת ראשונה אושרה ({firstReminderCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center p-0.5 rounded-md bg-sky-500 text-white shadow-3xs">
                        <Plane className="w-2.5 h-2.5 text-white" />
                      </span>
                      אישור סופי מול מנהל מרפאה ({finalConfirmationCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-5 h-3.5 rounded-md bg-emerald-100 border border-emerald-400 text-emerald-750 shadow-3xs text-[10px] font-black leading-none px-0.5">
                        ✓✓
                      </span>
                      אושרו הגעה בטוחה ({arrivalConfirmedCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-md bg-amber-400 text-amber-950 shadow-3xs text-[8px] font-black">
                        👑
                      </span>
                      סגרו עסקה ושילמו ({dealClosedCount})
                    </span>
                  </div>
                </div>
              </div>

              {/* FullCalendar Card styled with beautiful soft, light borders */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4.5" id="calendar-container-card">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridDay"
                  headerToolbar={{
                    right: 'prev,next today',
                    center: 'title',
                    left: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  locale="he" // Enable Hebrew layout natively
                  direction="rtl" // Right-to-left layout direction
                  buttonText={{
                    today: 'היום',
                    month: 'חודשי',
                    week: 'שבועי',
                    day: 'יומי'
                  }}
                  allDaySlot={false}
                  slotEventOverlap={false}
                  slotLabelFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    omitZeroMinute: false,
                    meridiem: false,
                    hour12: false
                  }}
                  eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    omitZeroMinute: false,
                    meridiem: false,
                    hour12: false
                  }}
                  slotMinTime="10:30:00"
                  slotMaxTime={currentCalendarView === 'timeGridDay' && currentCalendarDate.getDay() === 4 ? "18:15:00" : "18:45:00"}
                  slotDuration="00:15:00"
                  slotLabelInterval="00:15:00"
                  expandRows={true}
                  height="auto"
                  selectable={true}
                  editable={true}
                  eventDurationEditable={false}
                  selectMirror={true}
                  dayMaxEvents={true}
                  navLinks={true}
                  selectLongPressDelay={0}
                  longPressDelay={0}
                  datesSet={(arg) => {
                    setCurrentCalendarDate(arg.view.calendar.getDate());
                    setCurrentCalendarView(arg.view.type);
                  }}
                  
                  // Handlers
                  select={handleDateSelect}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  eventDrop={handleEventDrop}
                  eventResize={handleEventResize}
                  events={calendarEvents}
                  eventContent={renderEventContent}
                />
              </div>
            </>
          )}

          {/* 📊 GORGEOUS DYNAMIC REPRESENTATIVES BI & PERFORMANCE REPORTS PANEL */}
          {(() => {
            // Find all unique bookedBy values, trimmed and fallback to defaults so we always have a gorgeous UI
            const uniqueReps = Array.from(new Set(appointments.map(a => a.bookedBy?.trim()).filter(Boolean)));
            const dbReps = representatives.map(r => r.name.trim());
            const systemDefaultReps = ['יובל כהן', 'אלעד דנט', 'שיר לוי'];
            // Combine them
            const allReps = Array.from(new Set([...uniqueReps, ...dbReps, ...systemDefaultReps]));

            const repAppointments = appointments.filter(a => a.bookedBy?.trim() === selectedRep);
            const totalRepBrought = repAppointments.length;
            const repArrivalConfirmedCount = repAppointments.filter(a => a.arrivalConfirmed).length;
            const repDealClosedCount = repAppointments.filter(a => a.dealClosed).length;
            const repNoShowCount = repAppointments.filter(a => a.noShow).length;
            
            // First reminder confirmed and not double confirmed, not closed, not a no-show
            const repFirstReminderOnlyCount = repAppointments.filter(a => a.firstReminder && !a.arrivalConfirmed && !a.dealClosed && !a.noShow).length;
            const repJustBookedCount = Math.max(0, totalRepBrought - repArrivalConfirmedCount - repDealClosedCount - repNoShowCount - repFirstReminderOnlyCount);

            const arrivalConfirmationRate = totalRepBrought > 0 ? Math.round((repArrivalConfirmedCount / totalRepBrought) * 100) : 0;
            const dealClosedRate = totalRepBrought > 0 ? Math.round((repDealClosedCount / totalRepBrought) * 100) : 0;

            // Custom tooltip components for Recharts to match RTL layout elegantly
            const CustomPieTooltip = ({ active, payload }: any) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-right text-xs leading-relaxed font-bold">
                    <p className="font-extrabold text-amber-400">{data.name}</p>
                    <p className="mt-1">כמות: {data.value} תורים</p>
                    <p className="text-[10px] text-slate-300">חלק יחסי: {totalRepBrought > 0 ? Math.round((data.value / totalRepBrought) * 100) : 0}% מעוגל</p>
                  </div>
                );
              }
              return null;
            };

            const CustomBarTooltip = ({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-right text-xs leading-relaxed font-bold">
                    <p className="font-extrabold text-sky-450 border-b border-slate-700/60 pb-1 mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                      <p key={index} style={{ color: entry.fill }} className="mt-0.5">
                        {entry.name}: {entry.value} תורים
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            };

            // Prepare chart datasets
            const pieData = [
              { name: 'סגר עסקה ושילם 👑', value: repDealClosedCount, color: '#FDE68A' },
              { name: 'אישר הגעה כפולה ✓✓', value: repArrivalConfirmedCount, color: '#A7F3D0' },
              { name: 'תזכורת א\' מאושרת ✓', value: repFirstReminderOnlyCount, color: '#BAE6FD' },
              { name: 'תור נקבע בלבד 📅', value: repJustBookedCount, color: '#E2E8F0' },
              { name: 'הבריז / לא הגיע ❌', value: repNoShowCount, color: '#FECDD3' }
            ].filter(item => item.value > 0);

            const barData = allReps.map(repName => {
              const appts = appointments.filter(a => a.bookedBy?.trim() === repName);
              const total = appts.length;
              const closed = appts.filter(a => a.dealClosed).length;
              const arrived = appts.filter(a => a.arrivalConfirmed).length;
              const noShows = appts.filter(a => a.noShow).length;
              return {
                name: repName,
                'תורים שנקבעו': total,
                'אישרו הגעה ✓✓': arrived,
                'סגרו עסקאות 👑': closed,
                'הברזות ❌': noShows
              };
            }).filter(item => item['תורים שנקבעו'] > 0);

            return (
              <div className={`bg-white rounded-2xl border ${themeConfig.border} shadow-sm p-5.5 text-right mt-6 space-y-5`} id="reps-analytics-report-area">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <span>📊</span> ביצועי נציגים
                    </h3>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">מעקב חי אחר כמות תורים שהובאו, אחוזי הגעה כפולה וסגירת עסקאות משלמות</p>
                  </div>
                  
                  {/* Select Dropdown to filter performance */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[11px] font-bold text-slate-500">בחר נציג לבחינה:</span>
                    <select
                      value={selectedRep}
                      onChange={(e) => setSelectedRep(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-100 cursor-pointer"
                    >
                      {allReps.map(rep => (
                        <option key={rep} value={rep}>{rep}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Metric 1: Appointments set */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center justify-between shadow-3xs">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">כלל פגישות שהביא הנציג</p>
                      <h4 className="text-xl font-black text-slate-900 font-mono tracking-tight">{totalRepBrought} <span className="text-xs text-slate-500 font-sans font-medium">תורים</span></h4>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-3xs">
                      📅
                    </div>
                  </div>

                  {/* Metric 2: Double confirmation (✓✓) counts */}
                  <div className="bg-[#f0f9f6]/80 p-4 rounded-2xl border border-teal-100/60 flex items-center justify-between shadow-3xs">
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">אישרו הגעה בטוחה (✓✓)</p>
                        <span className="text-[10px] bg-emerald-100/80 text-emerald-850 px-1.5 py-0.2 rounded font-black font-mono">{arrivalConfirmationRate}%</span>
                      </div>
                      <h4 className="text-xl font-black text-emerald-900 font-mono tracking-tight">
                        {repArrivalConfirmedCount} <span className="text-xs text-teal-850 font-sans font-medium">הגיעו</span>
                      </h4>
                      {/* Slim visual rate bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                        <div className="bg-emerald-500 h-1 rounded-full transition-all duration-500" style={{ width: `${arrivalConfirmationRate}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Metric 3: Golden crown deals closed */}
                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 flex items-center justify-between shadow-3xs relative overflow-hidden">
                    <div className="space-y-1 w-full pr-1">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-amber-800/80 font-bold uppercase flex items-center gap-0.5">
                          סגרו עסקה ושילמו בקליניקה 👑
                        </p>
                        <span className="text-[10.5px] bg-amber-100 text-amber-950 px-1.5 py-0.2 rounded-full font-black font-mono">
                          {dealClosedRate}% סגירה
                        </span>
                      </div>
                      <h4 className="text-xl font-extrabold text-amber-950 font-mono tracking-tight flex items-baseline gap-1">
                        {repDealClosedCount} <span className="text-xs text-amber-900 font-sans font-bold">לקוחות משלמים ✨</span>
                      </h4>
                      {/* Slim visual rate bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500 shadow-3xs" style={{ width: `${dealClosedRate}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📊 Beautiful Interactive Recharts Visualizations */}
                <div className="bg-slate-50/30 border border-slate-100 rounded-2xl p-4.5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
                    <span className="text-[11.5px] font-black text-slate-700">תצוגת ניתוח גרפי של ביצועים:</span>
                    <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/40">
                      <button
                        onClick={() => setAnalyticsChartTab('pie')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          analyticsChartTab === 'pie'
                            ? 'bg-white text-teal-950 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🥧 התפלגות סטטוסים אישית
                      </button>
                      {activeRep.role === 'admin' ? (
                        <button
                          onClick={() => setAnalyticsChartTab('bar')}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            analyticsChartTab === 'bar'
                              ? 'bg-white text-teal-950 shadow-2xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          📊 השוואה רב-נציגית בקליניקה
                        </button>
                      ) : (
                        <span 
                          className="px-3 py-1 text-[11px] font-bold rounded-lg text-slate-400 select-none flex items-center gap-1 cursor-not-allowed font-medium"
                          title="תצוגה רב-נציגית פתוחה למנהלי מרפאה בלבד 🔒"
                        >
                          🔒 השוואה רב-נציגית
                        </span>
                      )}
                    </div>
                  </div>

                  {analyticsChartTab === 'pie' || activeRep.role !== 'admin' ? (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 min-h-[220px]">
                      {pieData.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs py-8 w-full font-bold">
                          ✖ אין מספיק נתוני תורים פעילים עבור נציג זה כדי לייצר גרף עוגה.
                        </div>
                      ) : (
                        <>
                          <div className="w-full md:w-1/2 h-[210px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={55}
                                  outerRadius={75}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                            {pieData.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-100 shadow-3xs">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <div className="min-w-0">
                                  <p className="text-[10px] text-slate-400 font-extrabold">{item.name}</p>
                                  <p className="text-xs font-black text-slate-800 mt-0.5">
                                    {item.value} תורים <span className="text-[10px] text-slate-400 font-medium">({totalRepBrought > 0 ? Math.round((item.value / totalRepBrought) * 100) : 0}%)</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-[240px] sm:h-[260px] pt-1">
                      {barData.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs py-10 font-bold">
                          ✖ אין עדיין פגישות משובצות במערכת להצגת השוואה קבוצתית.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#475569' }} stroke="#e2e8f0" />
                            <YAxis tick={{ fontSize: 10, fontWeight: 'bold', fill: '#475569' }} stroke="#e2e8f0" />
                            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                            <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'extrabold', paddingTop: '10px' }} />
                            <Bar dataKey="תורים שנקבעו" fill="#A5B4FC" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="אישרו הגעה ✓✓" fill="#A7F3D0" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="סגרו עסקאות 👑" fill="#FDE68A" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="הברזות ❌" fill="#FECDD3" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  )}
                </div>

                {/* Subtext explanation */}
                <div className="bg-amber-50/20 p-3 rounded-xl border border-amber-200/40 text-[10.5px] text-amber-950 leading-relaxed font-bold flex items-center gap-2">
                  <span className="text-sm">💡</span>
                  <span>
                    <strong>נציג צוות המרפאה {selectedRep}</strong> הצליח לסגור <strong>{repDealClosedCount} עסקאות משלמות</strong> מתוך סך הכל {totalRepBrought} תורים שנקבעו בפועל על ידו, המשרים יציבות וצמיחה פיננסית אדירה עבור הקליניקה!
                  </span>
                </div>

                {/* Live appointments brought table for the selected rep */}
                <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
                  <div className="bg-slate-50 px-4 py-2.5 text-[11px] font-black text-slate-700 flex items-center justify-between border-b border-slate-100">
                    <span>פגישות ותורים שנקבעו ע"י נציג זה ({repAppointments.length})</span>
                    <span className="text-[10px] text-slate-400">שודרך ע"י מסוף קו DENTE</span>
                  </div>
                  
                  {repAppointments.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-semibold bg-white">
                      ✖ לא נמצאו תורים שתואמו במערכת על ידי נציג זה. נסו לתאם או לעדכן תור קיים ולרשום את שמו בתיבת הנציג!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto bg-white">
                      {repAppointments.map(appt => {
                        const patient = patients.find(p => p.id === appt.patientId);
                        const patientName = patient ? `${patient.firstName} ${patient.familyName}` : 'מטופל כללי';
                        return (
                          <div key={appt.id} className="p-3 hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: appt.color === 'orange' ? '#f59e0b' : appt.color === 'pink' ? '#ec4899' : '#14b8a6' }} />
                              <div>
                                <h5 className="font-extrabold text-slate-900 leading-normal">{patientName}</h5>
                                <p className="text-[10px] text-slate-500 font-medium leading-normal mt-0.5">{appt.title} | {new Date(appt.start).toLocaleDateString('he-IL')} בשעה {new Date(appt.start).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {appt.dealClosed && (
                                <span className="bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded-md text-[9px] border border-amber-300 flex items-center gap-0.5 animate-pulse">
                                  👑 סגר עסקה ושילם
                                </span>
                              )}
                              {appt.arrivalConfirmed && (
                                <span className="bg-emerald-50 text-emerald-950 font-bold px-2 py-0.5 rounded-md text-[9px] border border-emerald-250 flex items-center gap-0.5">
                                  ✓✓ אישר הגעה כפולה
                                </span>
                              )}
                              {appt.firstReminder && !appt.arrivalConfirmed && (
                                <span className="bg-[#f0fdfa] text-teal-850 font-medium px-2 py-0.5 rounded-md text-[9px] border border-teal-150">
                                  ✓ תזכורת א' אושרה
                                </span>
                              )}
                              {!appt.dealClosed && !appt.arrivalConfirmed && !appt.firstReminder && (
                                <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md text-[9px] border border-slate-200">
                                  תור נקבע בלבד
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          
        </section>
      </main>

      {/* Booking Dialog Modal overlay */}
      <AppointmentModal
        isOpen={isModalOpen}
        mode={modalMode}
        appointment={selectedAppointment}
        patients={patients}
        selectedDate={selectedDate}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
        onStartReschedule={(appt) => {
          setReschedulingAppt(appt);
          setIsModalOpen(false);
        }}
        onAddPatientInline={handleAddPatientInline}
        representatives={representatives}
        defaultRepresentativeName={activeRep.name}
      />

      {/* Beautiful High-Contrast Custom React Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in" dir="rtl">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col p-5.5 text-right space-y-4 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <span>⚠️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">{confirmDialog.message}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-50">
              {!confirmDialog.isAlert && confirmDialog.cancelText && (
                <button
                  type="button"
                  onClick={confirmDialog.onCancel}
                  className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition-all cursor-pointer"
                >
                  {confirmDialog.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4.5 py-2 text-xs bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {confirmDialog.confirmText || 'אישור'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secure Quick Response Toast Notifications */}
      {toast.isOpen && (
        <div 
          className="fixed bottom-6 right-6 z-[9999] max-w-sm w-96 bg-white border border-slate-200/85 shadow-2xl rounded-2xl p-4.5 flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-5 duration-300"
          dir="rtl"
        >
          <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex-shrink-0 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className="text-xs font-black text-slate-800 leading-tight">{toast.title}</h4>
            {toast.desc && <p className="text-[10px] text-slate-500 font-extrabold leading-normal mt-1">{toast.desc}</p>}
          </div>
          <button 
            type="button"
            onClick={() => setToast(prev => ({ ...prev, isOpen: false }))}
            className="p-1 px-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
          >
            <span className="text-xs font-black">✕</span>
          </button>
        </div>
      )}

      {/* Software Update Successful Confirmation Banner */}
      {updateAlert.isOpen && (
        <div 
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] max-w-md w-[calc(100%-2rem)] bg-emerald-50/95 border border-emerald-150/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 animate-in fade-in slide-in-from-top-4 duration-300"
          dir="rtl"
        >
          <div className="p-2.5 bg-emerald-100 ring-4 ring-emerald-50 text-emerald-700 rounded-xl flex-shrink-0 flex items-center justify-center font-bold">
            ✨
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className="text-xs font-black text-emerald-950 leading-tight">המערכת עודכנה בהצלחה!</h4>
            <p className="text-[10px] text-emerald-700/90 font-extrabold leading-normal mt-1">
              התוכנה עודכנה והופעלה מחדש בצורה בטוחה עם כל השינויים החדשים (גרסה פעילה: <span className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-black font-sans">{updateAlert.version}</span>).
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setUpdateAlert(prev => ({ ...prev, isOpen: false }))}
            className="p-1 px-2 text-emerald-600 hover:text-emerald-950 hover:bg-emerald-100/60 rounded-lg transition-all cursor-pointer font-bold shrink-0 self-start mt-0.5"
            title="סגור"
          >
            <span className="text-xs font-black">✕</span>
          </button>
        </div>
      )}

      {/* 🔐 Admin Password Prompt Modal */}
      {adminPasswordPrompt.isOpen && (() => {
        const displayList = representatives.length > 0 ? representatives : SEED_REPRESENTATIVES;
        const targetRepName = displayList.find(r => r.id === adminPasswordPrompt.pendingRepId)?.name || 'מנהל';
        
        const handleVerifyCode = (e: React.FormEvent) => {
          e.preventDefault();
          if (adminPasswordInput === '2020') {
            if (adminPasswordPrompt.pendingRepId) {
              setActiveRepresentativeId(adminPasswordPrompt.pendingRepId);
            }
            showToast(
              "חיבור מנהל אושר בהצלחה",
              `ברוך הבא, ${targetRepName}! כל הכלים וההגדרות של המרפאה פתוחים כעת בקליניקה.`,
              'success'
            );
            setAdminPasswordPrompt({ isOpen: false, pendingRepId: null, errorMsg: '' });
            setAdminPasswordInput('');
          } else {
            setAdminPasswordPrompt(prev => ({
              ...prev,
              errorMsg: 'סיסמת מנהל שגויה. אנא נסו שוב או פנו למנהל המרפאה.'
            }));
            setAdminPasswordInput('');
          }
        };

        return (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col p-6 text-right space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">🔐</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 text-sm leading-tight">אימות הרשאת מנהל</h3>
                  <p className="text-[10px] text-slate-500 font-extrabold leading-relaxed mt-1">
                    הגדרת התחנה עבור <span className="text-teal-600 font-black">{targetRepName}</span> דורשת קוד סודי מוגדר מראש.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-3.5">
                <div>
                  <label className="block text-[9.5px] text-slate-400 font-extrabold mb-1">הזינו סיסמת מנהל:</label>
                  <input
                    type="password"
                    autoFocus
                    maxLength={10}
                    placeholder="••••"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full text-center tracking-widest font-mono text-base font-bold py-2 px-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-100/50 rounded-xl transition-all outline-none"
                  />
                  {adminPasswordPrompt.errorMsg && (
                    <p className="text-[9.5px] text-rose-500 font-extrabold leading-normal mt-1.5 flex items-center gap-1.5 animate-pulse">
                      <span>⚠️ {adminPasswordPrompt.errorMsg}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPasswordPrompt({ isOpen: false, pendingRepId: null, errorMsg: '' });
                      setAdminPasswordInput('');
                    }}
                    className="flex-1 px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition-all cursor-pointer text-center"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-xs bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer text-center"
                  >
                    אישור כניסה
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* 🎨 Customization & System Aesthetics Modal ("עיצוב") */}
      {isDesignModalOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col p-6 text-right space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">🎨</span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <h3 className="font-black text-slate-800 text-sm leading-tight">עיצוב קליני והגדרות ספקים</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">אפיון סגנונות צבע, תצוגה מקדימה, וקישוריות תשתית</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDesignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
              >
                <span className="text-xs font-black">✕</span>
              </button>
            </div>

            {/* Content box */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              
              {/* Theme Selector */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                <h4 className="text-[11.5px] font-extrabold text-slate-800 mb-2.5 flex items-center gap-1.5">
                  🎨 צבע נושא מערכת ראשי:
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'hospital-mint', name: 'מנטה', color: '#14b8a6', label: 'מנטה' },
                    { id: 'spicy-peach', name: 'כתום', color: '#f59e0b', label: 'כתום' },
                    { id: 'pink-strawberry', name: 'ורוד', color: '#ec4899', label: 'ורוד' },
                    { id: 'sapphire-sky', name: 'כחול', color: '#3b82f6', label: 'כחול' },
                    { id: 'royal-gold', name: 'זהב', color: '#dca92d', label: 'זהב' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setDoc(doc(db, 'settings', 'global'), { systemTheme: t.id }, { merge: true }).catch(err => console.error(err));
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                        systemTheme === t.id 
                        ? 'border-slate-800 bg-white shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-100/50 bg-white text-slate-600'
                      }`}
                      title={t.name}
                    >
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: t.color }} />
                      <span className="mt-1 text-[9.5px] font-black">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chime Player */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11.5px] font-extrabold text-slate-800 flex items-center gap-1">
                    🔔 צליל כניסה:
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  הקליניקה שלכם משמיעה צליל פעמון כפול ויפה להרגעת מטופלים בכל פעם שפותחים את התוכנה!
                </p>
                <button
                  type="button"
                  onClick={playOpeningChime}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-white font-black text-xs transition-transform hover:scale-[1.01] active:translate-y-0.2 cursor-pointer ${themeConfig.primaryButton}`}
                >
                  <span className="text-normal">🛎️</span>
                  <span>בדוק והפעל צליל כניסה (Ding-Dong)</span>
                </button>
              </div>

              {/* WhatsApp Integration Management */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11.5px] font-extrabold text-slate-800 flex items-center gap-1.5">
                    💬 חיבור ספק WhatsApp:
                  </h4>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-250 animate-pulse">● קו פעיל מסונכרן</span>
                </div>

                <p className="text-[10px] text-slate-500 leading-normal">
                  מערכת DENTE מחוברת ישירות לשירות ה-WhatsApp האישי שלך. כל שליחת תזכורת פותחת חלונית שיגור חינמית.
                </p>

                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-[10.5px] space-y-2 text-slate-755 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#115e59]">סטטוס גייטוויי (GreenAPI / Twilio):</span>
                    <span className="text-[9px] text-emerald-700 font-bold">CONNECTED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#115e59]">כתובת Webhook דו-כיווני:</span>
                    <span className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-emerald-100 text-slate-650">https://api.dente.co.il/v1/webhook</span>
                  </div>
                </div>

                <p className="text-[9.5px] text-slate-500 font-bold leading-normal">
                  * סנכרון דו-כיווני פעיל: כאשר לקוח משיב <strong>"1"</strong> או <strong>"2"</strong> לתזכורת ה-WhatsApp שלך, המערכת קולטת את התשובה בזמן אמת ומסמנת באופן אוטומטי אם התור אושר או שהתבטל (הברזה).
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDesignModalOpen(false)}
                className="px-4.5 py-2 text-xs bg-slate-150 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl transition-all cursor-pointer"
              >
                סגור הגדרות
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👥 Users & Representatives Management Modal ("ניהול משתמשים ונציגים מורשים") */}
      {isUsersManagementModalOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col p-6 text-right space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">👥</span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <h3 className="font-black text-slate-800 text-sm leading-tight">ניהול משתמשים ונציגים מורשים</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">ניהול והגדרת הרשאות עובדים, רישום זהות תחנה ופיקוח קליני</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUsersManagementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
              >
                <span className="text-xs font-black">✕</span>
              </button>
            </div>

            {/* Content box */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">

              {/* Station Identity Assignment dropdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] text-slate-700 font-extrabold">שיוך זהות המשתמש לתחנת עבודה זו:</label>
                  <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    activeRep.role === 'admin'
                      ? 'bg-amber-50 border-amber-250 text-amber-800'
                      : 'bg-rose-50 border-rose-250 text-rose-800'
                  }`}>
                    {activeRep.role === 'admin' ? 'מורשה מנהל' : 'גישה מוגבלת 🔒'}
                  </span>
                </div>
                
                <select
                  value={activeRepresentativeId}
                  onChange={(e) => {
                    const repId = e.target.value;
                    const displayList = representatives.length > 0 ? representatives : SEED_REPRESENTATIVES;
                    const selectedRepObj = displayList.find(r => r.id === repId);
                    if (selectedRepObj) {
                      if (selectedRepObj.role === 'admin') {
                        setAdminPasswordPrompt({
                          isOpen: true,
                          pendingRepId: repId,
                          errorMsg: ''
                        });
                        setAdminPasswordInput('');
                      } else {
                        showConfirm(
                          'שינוי זהות המשתמש בתחנה',
                          `האם ברצונכם להגדיר את תחנת המחשב הזו עבור ${selectedRepObj.name}? המורשויות יעודכנו לנציג מוגבל לעמדת עבודה זו.`,
                          () => {
                            setActiveRepresentativeId(repId);
                          },
                          () => {},
                          'שנה זהות',
                          'ביטול',
                          true
                        );
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-extrabold cursor-pointer focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all text-right outline-none"
                >
                  {(representatives.length > 0 ? representatives : SEED_REPRESENTATIVES).map(rep => (
                    <option key={rep.id} value={rep.id}>
                      👤 {rep.name} ({rep.role === 'admin' ? 'מנהל ראשי' : 'נציג מורשה'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Security Restricted message or registration form */}
              {activeRep.role === 'admin' ? (
                <div className="space-y-4">
                  {/* Register New Rep */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                    <span className="block text-[11px] font-black text-slate-800">➕ רישום מורשה חדש במרפאת DENTE:</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold mb-1">שם פרטי:*</label>
                        <input
                          type="text"
                          value={newRepFirstName}
                          onChange={(e) => setNewRepFirstName(e.target.value)}
                          placeholder="הקלד שם..."
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 text-right font-bold focus:border-teal-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold mb-1">שם משפחה:</label>
                        <input
                          type="text"
                          value={newRepLastName}
                          onChange={(e) => setNewRepLastName(e.target.value)}
                          placeholder="הקלד משפחה..."
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 text-right font-bold focus:border-teal-400 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold mb-1">מין הנציג/ה:</label>
                        <select
                          value={newRepGender}
                          onChange={(e) => setNewRepGender(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-bold outline-none"
                        >
                          <option value="male">זכר ♂</option>
                          <option value="female">נקבה ♀</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold mb-1">הרשאה:</label>
                        <select
                          value={newRepRole}
                          onChange={(e) => setNewRepRole(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-bold outline-none"
                        >
                          <option value="representative">נציג</option>
                          <option value="admin">מנהל</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const trimmedFirstName = newRepFirstName.trim();
                        const trimmedLastName = newRepLastName.trim();
                        if (!trimmedFirstName) {
                          showConfirm(
                            'שגיאה',
                            'נא להזין שם פרטי עבור הנציג החדש.',
                            () => {},
                            undefined,
                            'אישור',
                            'ביטול',
                            true
                          );
                          return;
                        }
                        const fullName = trimmedLastName ? `${trimmedFirstName} ${trimmedLastName}` : trimmedFirstName;
                        
                        const exists = representatives.some(r => r.name.trim().toLowerCase() === fullName.toLowerCase());
                        if (exists) {
                          showConfirm(
                            'נציג פעיל קיים',
                            `משתמש בשם "${fullName}" כבר רשום במערכת!`,
                            () => {},
                            undefined,
                            'אישור',
                            'ביטול',
                            true
                          );
                          return;
                        }

                        const newId = `rep-${Date.now()}`;
                        const newRepObj: Representative = {
                          id: newId,
                          name: fullName,
                          gender: newRepGender,
                          role: newRepRole,
                          createdAt: new Date().toISOString()
                        };

                        try {
                          setRepresentatives(prev => {
                            if (prev.some(r => r.id === newRepObj.id)) return prev;
                            const updated = [...prev, newRepObj];
                            updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                            return updated;
                          });

                          await setDoc(doc(db, 'representatives', newId), newRepObj);
                          
                          setNewRepFirstName('');
                          setNewRepLastName('');
                          showConfirm(
                            'הרשמה הושלמה בהצלחה',
                            `הנציג/ה ${newRepObj.name} התווסף למערכת והסנכרון הושלם בהצלחה בזמן אמת! כעת ניתן לבחור בו תחת "זהות המשתמש בתחנת מחשב זו".`,
                            () => {},
                            undefined,
                            'אישור',
                            'ביטול',
                            true
                          );
                        } catch (e: any) {
                          console.error(e);
                          showConfirm(
                            'שגיאה ברישום',
                            `נכשל רישום נציג במערכת: ${e.message || e}`,
                            () => {},
                            undefined,
                            'אישור',
                            'ביטול',
                            true
                          );
                        }
                      }}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl cursor-pointer transition-all border-none"
                    >
                      ➕ רשום נציג מורשה חדש בקליניקה
                    </button>
                  </div>

                  {/* List of existing reps */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                    <span className="block text-[11px] font-black text-slate-800 mb-1">רשימת מורשים קיימים בקליניקה ({representatives.length}):</span>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto divide-y divide-slate-100">
                      {representatives.map(r => (
                        <div key={r.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200/60 shadow-3xs hover:border-slate-300 transition-colors">
                          <span className="font-extrabold text-xs text-slate-800">{r.name} <span className="text-[9px] font-bold text-slate-450 bg-slate-100 border border-slate-200/40 rounded-md px-1.5 py-0.2 select-none mr-1 inline-block">{r.role === 'admin' ? 'מנהל' : 'נציג'}</span></span>
                          {representatives.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                showConfirm(
                                  'מחיקת נציג/בקר',
                                  `האם אתם בטוחים שברצונכם למחוק את הנציג "${r.name}" מהמערכת? התורים שנקבעו על ידו יישארו ביומן ללא שינוי.`,
                                  async () => {
                                    try {
                                      setRepresentatives(prev => prev.filter(item => item.id !== r.id));
                                      await deleteDoc(doc(db, 'representatives', r.id));
                                      if (activeRepresentativeId === r.id) {
                                        const other = representatives.filter(item => item.id !== r.id)[0];
                                        if (other) setActiveRepresentativeId(other.id);
                                      }
                                    } catch (err) {
                                      console.error("Error deleting rep:", err);
                                    }
                                  }
                                );
                              }}
                              className="text-rose-600 hover:text-white hover:bg-rose-500 w-6 h-6 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center font-bold text-xs"
                              title="מחק משתמש"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-150 rounded-xl text-xs text-rose-850 leading-relaxed font-bold flex items-start gap-2.5">
                  <span className="text-lg">🔒</span>
                  <div>
                    <strong>מצב נציג משתמש מוגבל פעיל.</strong>
                    <p className="mt-1 text-[10px] opacity-90 font-normal">
                      הוספת נציגים חדשים, עריכת מורשים וגישה ישירה לקבצי גיבוי או מחיקת משתמשים נעולים על פי הוראות מנהל העבודה. נא בצע כניסה כמנהל לצורך עריכת הגדרות אלו.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUsersManagementModalOpen(false)}
                className="px-4.5 py-2 text-xs bg-slate-150 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl transition-all cursor-pointer"
              >
                סגור חלונית
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💾 Secure Auto-Backup & Offline Restore Center Modal ("גיבוי ושחזור נתונים אוטומטי") */}
      {isBackupRestoreModalOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col p-6 text-right space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">💾</span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <h3 className="font-black text-slate-800 text-sm leading-tight">גיבוי ושחזור נתונים אוטומטי</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">אבטחת בסיסי נתונים, שחזור נקודות גיבוי ענן והורדת קבצי JSON מפורטים</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBackupRestoreModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
              >
                <span className="text-xs font-black">✕</span>
              </button>
            </div>

            {/* Content box */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">

              {/* Secure Fieldset containing backup and SMS servers controls (restricted if not admin) */}
              <div className={activeRep.role !== 'admin' ? 'opacity-50 select-none pointer-events-none space-y-4' : 'space-y-4'}>
                
                {/* Cloud Separation Architecture */}
                <div className="bg-gradient-to-r from-teal-50/50 to-emerald-50/40 p-3 rounded-xl border border-teal-100 flex items-start gap-2.5">
                  <span className="text-lg self-start">🛡️</span>
                  <div>
                    <h5 className="text-[11px] font-black text-teal-900 leading-tight">אבטחה: בסיס הנתונים מופרד לחלוטין מקוד האפליקציה</h5>
                    <p className="text-[9.5px] text-teal-850 mt-1 leading-relaxed font-bold">
                      האפליקציה מחוברת באופן מאובטח ומבודד למסד הנתונים בענן <span className="underline select-all">Google Cloud Firestore</span>. עדכון של קובצי הקוד אינו פוגע בנתוני מטופלים, תורים או היסטוריות קליניקה השמורים בשרת נתונים עצמאי לגמרי. היא חסינה מחיקות!
                    </p>
                  </div>
                </div>

                {/* Local Backup Options */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11.5px] font-extrabold text-slate-800 flex items-center gap-1">
                      💾 פעולות סנכרון וגיבוי מהירות:
                    </h4>
                    {lastAutoBackupDate ? (
                      <span className="text-[8.5px] bg-emerald-50 text-emerald-800 font-black px-1.5 py-0.5 rounded-full border border-emerald-250 animate-pulse">
                        🔄 גיבוי יומי פעיל: {lastAutoBackupDate}
                      </span>
                    ) : (
                      <span className="text-[8.5px] bg-amber-50 text-amber-800 font-black px-1.5 py-0.5 rounded-full border border-amber-250">
                        🛡️ ממתין לסנכרון
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    המערכת מגבה באופן שוטף ואוטומטי בכל יום בו מתבצעים שינויים. הגיבוי האחרון נרשם במחיצה מקומית מאובטחת.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={exportBackupFile}
                      className="flex items-center justify-center gap-1 py-2 px-1.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[10px] rounded-xl cursor-pointer transition-all border-none text-center shadow-xs"
                      title="יצוא וקבלת קובץ JSON למחשב"
                    >
                      📥 יצוא ידני
                    </button>
                    
                    <label className="flex items-center justify-center gap-1 py-1.5 px-1.5 bg-teal-50 hover:bg-teal-100 text-teal-850 font-extrabold text-[10px] rounded-xl cursor-pointer transition-all border border-teal-200 text-center shadow-xs">
                      📤 שחזור ידני
                      <input
                        type="file"
                        accept=".json"
                        onChange={importBackupFile}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={forceManualBackup}
                      className="flex items-center justify-center gap-1 py-2 px-1.5 bg-amber-50 hover:bg-amber-100 text-amber-850 font-extrabold text-[10px] rounded-xl cursor-pointer transition-all border border-amber-200 text-center shadow-xs"
                    >
                      ⚡ גיבוי מהיר
                    </button>
                  </div>
                </div>

                {/* Auto Backups Timeline / History */}
                {autoBackupHistory.length > 0 ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                    <span className="block text-[10.5px] font-black text-slate-700">📂 נקודות גיבוי אוטומTIות זמינות לשחזור מהיר:</span>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-0.5">
                      {autoBackupHistory.map((h) => (
                        <div key={h.date} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-150 hover:border-slate-350 transition-all">
                          <div>
                            <p className="font-extrabold text-slate-800">גיבוי אוטומטי {h.date}</p>
                            <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{(h.size / 1024).toFixed(1)} KB | {new Date(h.timestamp).toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => downloadSpecificBackup(h.date)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9.5px] rounded-lg transition-colors border-none cursor-pointer"
                              title="הורד עותק גיבוי למחשב"
                            >
                              💾 הורד JSON
                            </button>
                            <button
                              type="button"
                              onClick={() => restoreSpecificBackup(h.date)}
                              className="px-2 py-1 bg-teal-500 hover:bg-teal-600 text-white font-bold text-[9.5px] rounded-lg transition-colors border-none cursor-pointer"
                              title="שחזר גרסה זו לשרת הענן מכל מחשב"
                            >
                              🎯 שחזר
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-150 text-center text-slate-400 text-xs">
                    🔒 כרגע אין נקודות גיבוי היסטוריות שנרשמו בשרת היומי.
                  </div>
                )}

                {/* Git Source control Box */}
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-2 font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📦</span>
                    <span className="text-[11px] font-black text-amber-400">ניהול קוד וגרסאות מבוסס GitHub (Git)</span>
                  </div>
                  <p className="text-[9.5px] text-slate-350 leading-relaxed font-normal">
                    לצורך הגנה קריטית על פיתוח קוד המערכת, מומלץ לבצע מעקב גרסאות מלא באמצעות Git. אם מחקתם בטעות תכונה או קובץ מקומי, ניתן לחזור לגרסה שעבדה קודם בשניות:
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[9px] text-teal-400 select-all leading-normal text-left tracking-wider">
                    git init<br />
                    git add .<br />
                    git commit -m "dente system backup"<br />
                    git checkout . <span className="text-slate-500"># לביטול שינויים שבורים</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-normal font-bold">
                    💡 מנגנון האבטחה המקורזל של DENTE יצר עבורכם גיבוי קוד אוטומטי מלא בתיקיית <span className="font-mono text-amber-300">backups/pre-update/</span> רגע לפני כל הפעלה ועדכוני רכיבים!
                  </p>
                </div>

              </div>

              {/* Show warning banner if not admin */}
              {activeRep.role !== 'admin' && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-xs text-rose-850 font-bold flex items-start gap-2">
                  <span>🔒</span>
                  <div>
                    <strong>שחזור וגיבוי נעול לנציגים.</strong>
                    <p className="mt-0.5 text-[9.5px] font-normal text-rose-700">פעילויות גיבוי יומיות וגישה לקבצי ה-JSON של המרפאה מאובטחת אך ורק עבור הרשאות רמת "מנהל". נא בצע שינוי זהות בתחנה לעריכה.</p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBackupRestoreModalOpen(false)}
                className="px-4.5 py-2 text-xs bg-slate-150 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl transition-all cursor-pointer"
              >
                סגור חלונית
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖨️ Daily Appointment Print & Excel Export Modal */}
      {isPrintReportModalOpen && (() => {
        // Query daily appointments for the reportSelectedDate
        const matchingAppts = appointments.filter(appt => appt.start.startsWith(reportSelectedDate));
        // Sort them by hour
        matchingAppts.sort((a, b) => a.start.localeCompare(b.start));

        return (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col p-6 text-right space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-100 flex items-center justify-center shrink-0">
                    <span className="text-xl">🖨️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-800 text-sm leading-tight">דוחות הפקה והדפסת תורים</h3>
                    <p className="text-[10px] text-slate-500 font-extrabold leading-relaxed mt-1">
                      הפיקו דוח תורים יומי מפורט, שלחו להדפסה ישירה או הורידו כקובץ Excel/CSV מסודר.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrintReportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <span className="text-xs font-black">✕</span>
                </button>
              </div>

              {/* Date Filter & Toolbar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-bold whitespace-nowrap font-sans">בחרו תאריך דוח:</span>
                  <input
                    type="date"
                    value={reportSelectedDate}
                    onChange={(e) => setReportSelectedDate(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-right outline-none focus:border-teal-400"
                  />
                </div>
                <div className="text-xs text-slate-500 font-bold">
                  נמצאו <span className="text-teal-600 font-black">{matchingAppts.length}</span> תורים רשומים ליום זה.
                </div>
              </div>

              {/* Patient List Preview Container */}
              <div className="flex-1 max-h-[280px] overflow-y-auto border border-slate-150 rounded-xl divide-y divide-slate-100">
                {matchingAppts.length > 0 ? (
                  matchingAppts.map((appt, idx) => {
                    const patient = patients.find(p => p.id === appt.patientId);
                    const patName = patient ? `${patient.firstName} ${patient.familyName}` : "לא ידוע";
                    const patPhone = patient ? patient.phoneNumber : "";
                    const time = appt.start.split('T')[1]?.substring(0, 5) || "";

                    return (
                      <div key={appt.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-400 w-5 text-center">{idx + 1}</span>
                          <span className="font-extrabold text-teal-600 font-mono w-12 text-center bg-teal-50 px-1.5 py-0.5 rounded-lg border border-teal-100">{time}</span>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-800 block text-[11.5px]">{patName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{patPhone}</span>
                          </div>
                        </div>

                        <div className="text-right max-w-[180px] truncate pr-2">
                          <span className="text-[10.5px] font-bold text-slate-600">{appt.title}</span>
                          {appt.notes && <span className="text-[9px] text-slate-400 block truncate">{appt.notes}</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] text-slate-400 bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5 font-bold">
                            {appt.bookedBy || 'נציג'}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                            appt.noShow
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : appt.arrivalConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-150'
                          }`}>
                            {appt.noShow ? 'הברזה' : appt.arrivalConfirmed ? 'מאושר' : 'ממתין'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                    <span className="text-2xl opacity-60">📅</span>
                    <span className="text-xs font-bold font-sans">אין תורים מתועדים ביומן בתאריך זה.</span>
                  </div>
                )}
              </div>

              {/* 🚀 Two Main Fast Actions (הורד דוח / שלח להדפסה) */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  type="button"
                  disabled={matchingAppts.length === 0}
                  onClick={() => exportDailyReportToCSV(reportSelectedDate, matchingAppts)}
                  className="flex flex-col items-center justify-center p-5 bg-emerald-50 hover:bg-emerald-100/80 border-2 border-emerald-200 text-emerald-950 rounded-2xl transition-all cursor-pointer shadow-3xs font-black gap-2 group disabled:opacity-40 disabled:cursor-not-allowed text-center border-none"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">📥</span>
                  <div>
                    <span className="text-xs font-black block text-emerald-900">אופציה 1: הורד דוח</span>
                    <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">החלפת נתונים לקובץ Excel / CSV מסודר</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={matchingAppts.length === 0}
                  onClick={() => printDailyReport(reportSelectedDate, matchingAppts)}
                  className="flex flex-col items-center justify-center p-5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl transition-all cursor-pointer shadow-md font-black gap-2 group disabled:opacity-40 disabled:cursor-not-allowed text-center border-none"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">🖨️</span>
                  <div>
                    <span className="text-xs font-black block text-white">אופציה 2: שלח להדפסה</span>
                    <span className="text-[10px] text-teal-100 font-bold block mt-0.5">הדפסה מיידית דרך המדפסת המחוברת למחשב 🔌</span>
                  </div>
                </button>
              </div>

              {/* Controls and trigger actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPrintReportModalOpen(false)}
                  className="px-4.5 py-2 text-xs bg-slate-150 hover:bg-slate-200 text-slate-850 font-extrabold rounded-xl transition-all cursor-pointer border-none"
                >
                  סגור חלונית
                </button>

                <p className="text-[9px] text-slate-400 font-bold">
                  * שליחה להדפסה פותחת חלונית פליטה של הדפדפן להפעלה מהירה של המדפסת הפיזית
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer info line with Hebrew copyright */}
      <footer className={`mt-auto border-t ${themeConfig.headerBorder} bg-white py-4 px-6 text-center text-[11px] text-slate-400`} id="clinic-footer">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 DENTE מומחים פה ולסת - רוזנסקי 4, ראשון לציון (קומה 3). כל הזכויות שמורות.</span>
          <span className="font-semibold flex items-center gap-1 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> עמדת ניהול מורשית #04B
          </span>
        </div>
      </footer>

      {/* 🚀 GORGEOUS SECURE OVERLAY FLOATING TOOLTIP FOR APPOINTMENT HOVER (1 SECOND DELAY) */}
      {hoveredEventData && (
        <div 
          className="fixed z-[999] bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-4 w-72 text-right pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
          style={{
            // Position carefully. Let's make sure it doesn't overflow the viewport
            left: `${Math.min(window.innerWidth - 300, Math.max(16, hoveredEventData.x - 144))}px`,
            top: `${Math.min(window.innerHeight - 250, hoveredEventData.y - window.scrollY)}px`,
          }}
          dir="rtl"
          onMouseEnter={() => {
            if (activeHidingTimerRef.current) {
              clearTimeout(activeHidingTimerRef.current);
              activeHidingTimerRef.current = null;
            }
          }}
          onMouseLeave={() => {
            activeHidingTimerRef.current = setTimeout(() => {
              setHoveredEventData(null);
            }, 350);
          }}
        >
          {/* Subtle colored top cap based on appointment color */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${
            hoveredEventData.appointment.color === 'orange' ? 'bg-amber-500' :
            hoveredEventData.appointment.color === 'pink' ? 'bg-pink-500' : 'bg-emerald-500'
          }`} />

          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
              <span className="select-none" aria-hidden="true">⏰</span> {(() => {
                const startStr = hoveredEventData.appointment.start;
                const endStr = hoveredEventData.appointment.end;
                try {
                  const s = new Date(startStr);
                  const e = new Date(endStr);
                  const format = (d: Date) => d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
                  return `${format(s)} - ${format(e)}`;
                } catch {
                  return '';
                }
              })()}
            </span>
            <div className="flex items-center gap-1">
              {hoveredEventData.appointment.dealClosed && <span className="text-[20px] inline-block animate-pulse select-none" title="👑 לקוח משלם - סגר עסקה">👑</span>}
              {hoveredEventData.appointment.arrivalConfirmed && <span className="text-[12px] text-emerald-600 font-extrabold select-none" title="✓✓ אישר הגעה בטוחה 100%">✓✓</span>}
              {hoveredEventData.appointment.firstReminder && !hoveredEventData.appointment.arrivalConfirmed && <span className="w-4 h-4 bg-emerald-500 text-white rounded flex items-center justify-center text-[10px] font-black select-none" title="✓ תזכורת ראשונה אושרה">✓</span>}
              {hoveredEventData.appointment.finalConfirmation && <span className="text-[9px] bg-sky-500 text-white px-1.5 py-0.5 rounded-full font-black leading-none select-none flex items-center gap-1" title="✈️ אישור מעקב סופי"><span className="animate-pulse">✈️</span> מעקב קשוב</span>}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">שם המטופל</p>
              <h4 className="text-xs sm:text-xs font-black text-slate-900 leading-normal select-all">
                {hoveredEventData.patient 
                  ? `${hoveredEventData.patient.firstName} ${hoveredEventData.patient.familyName}` 
                  : hoveredEventData.appointment.title}
              </h4>
            </div>

            {hoveredEventData.patient && (
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                <div>
                  <p className="text-[9px] font-bold text-slate-400">טלפון</p>
                  <p className="text-[10px] sm:text-xs font-extrabold text-slate-800 font-mono leading-normal">
                    <span className="select-none ml-1" aria-hidden="true">📞</span>
                    <span className="select-all">{hoveredEventData.patient.phoneNumber}</span>
                  </p>
                </div>
                {hoveredEventData.patient.city && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400">עיר מגורים</p>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-700 select-all">{hoveredEventData.patient.city}</p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-slate-100 pt-2">
              <p className="text-[9px] font-bold text-slate-400">מהות הטיפול קליני</p>
              <p className="text-xs font-black text-indigo-950 leading-relaxed flex items-center gap-1">
                <span className="select-none" aria-hidden="true">🦷</span>
                <span className="select-all">{hoveredEventData.patient ? hoveredEventData.appointment.title : 'פגישה כללית במרפאה'}</span>
              </p>
            </div>

            {hoveredEventData.appointment.bookedBy && (
              <div className="border-t border-slate-100 pt-2">
                <p className="text-[9px] font-bold text-slate-400">נציג צוות המרפאה שקבע</p>
                <p className="text-xs font-black text-teal-800 flex items-center gap-1">
                  <span className="select-none" aria-hidden="true">👤</span>
                  <span className="select-all">{hoveredEventData.appointment.bookedBy}</span>
                </p>
              </div>
            )}

            {hoveredEventData.appointment.notes && (
              <div className="border-t border-slate-100 pt-2 bg-slate-50/80 p-1.5 rounded-lg border border-slate-200/50 mt-1">
                <p className="text-[9px] font-extrabold text-slate-400">הערות תור משרדיות</p>
                <p className="text-[10px] text-slate-600 font-medium whitespace-normal leading-snug flex items-start gap-1">
                  <span className="select-none shrink-0" aria-hidden="true">📝</span>
                  <span className="select-all">{hoveredEventData.appointment.notes}</span>
                </p>
              </div>
            )}

            {hoveredEventData.appointment.dealClosed && (
              <div className="border-t border-slate-100 pt-2 bg-amber-50/50 p-2 rounded-lg border border-amber-250/50 mt-1">
                <p className="text-[9px] font-extrabold text-amber-900 flex items-center gap-1">
                  <span className="select-none text-[11px]">👑</span>
                  <span>פרטי עסקת המרפאה:</span>
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <div>
                    <p className="text-[8.5px] font-extrabold text-slate-400">סכום שנסגר</p>
                    <p className="text-[11.5px] font-black text-amber-950 font-sans">
                      {hoveredEventData.appointment.dealAmount 
                        ? `₪${Number(hoveredEventData.appointment.dealAmount).toLocaleString()}` 
                        : 'לא הוזן סכום'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8.5px] font-extrabold text-slate-400">מבצע שמומש</p>
                    <p className="text-[10px] font-black text-slate-700 leading-tight">
                      {hoveredEventData.appointment.jawPromotion === 'one' && '🦷 לסת אחת (שתלים + בר)'}
                      {hoveredEventData.appointment.jawPromotion === 'two' && '🦷🦷 שתי לסתות'}
                      {(!hoveredEventData.appointment.jawPromotion || hoveredEventData.appointment.jawPromotion === 'none') && 'כללי / ללא מבצע'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
