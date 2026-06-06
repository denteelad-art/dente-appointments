import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, Plane, HelpCircle, X, Trash2, ArrowRight } from 'lucide-react';
import { Patient, Appointment, Representative } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  appointment?: Appointment | null;
  patients: Patient[];
  selectedDate?: { start: string; end: string } | null;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  onStartReschedule?: (appt: Appointment) => void;
  onAddPatientInline: (patient: Omit<Patient, 'id' | 'createdAt'>) => Promise<Patient>; // Create new patient inline
  representatives?: Representative[];
  defaultRepresentativeName?: string;
}

export default function AppointmentModal({
  isOpen,
  mode,
  appointment,
  patients,
  selectedDate,
  onClose,
  onSave,
  onDelete,
  onStartReschedule,
  onAddPatientInline,
  representatives = [],
  defaultRepresentativeName = '',
}: AppointmentModalProps) {
  const [patientId, setPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [firstReminder, setFirstReminder] = useState(false);
  const [finalConfirmation, setFinalConfirmation] = useState(false);
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState<'mint' | 'orange' | 'pink'>('mint');
  const [arrivalConfirmed, setArrivalConfirmed] = useState(false);
  const [dealClosed, setDealClosed] = useState(false);
  const [dealAmount, setDealAmount] = useState<string>(''); // NEW: closed deal sum
  const [jawPromotion, setJawPromotion] = useState<'none' | 'one' | 'two'>('none'); // NEW: campaign jaw promo
  const [noShow, setNoShow] = useState(false);
  const [bookedBy, setBookedBy] = useState('');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'pending' | 'sent' | 'failed'>('idle');
  const [smsTextSent, setSmsTextSent] = useState('');
  const [commTab, setCommTab] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search input for existing patients
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  // Inline Patient Creation state
  const [isNewPatientInline, setIsNewPatientInline] = useState(false);
  const [newPatientFirstName, setNewPatientFirstName] = useState('');
  const [newPatientFamilyName, setNewPatientFamilyName] = useState('');
  const [newPatientNationalId, setNewPatientNationalId] = useState('');
  const [newPatientPhoneNumber, setNewPatientPhoneNumber] = useState('');
  const [newPatientCity, setNewPatientCity] = useState('');

  const isInitializedRef = React.useRef(false);

  // Synchronize modal state with props
  useEffect(() => {
    if (isOpen) {
      if (isInitializedRef.current) {
        return;
      }
      isInitializedRef.current = true;

      setIsSubmitting(false);
      setPatientSearchQuery('');
      if (mode === 'edit' && appointment) {
        setPatientId(appointment.patientId);
        setTitle('פגישת ייעוץ');
        setStart(convertToLocalInputValue(appointment.start));
        setEnd(convertToLocalInputValue(appointment.end));
        setFirstReminder(appointment.firstReminder);
        setFinalConfirmation(appointment.finalConfirmation);
        setNotes(appointment.notes || '');
        setColor(appointment.color || 'mint');
        setArrivalConfirmed(appointment.arrivalConfirmed || false);
        setDealClosed(appointment.dealClosed || false);
        setDealAmount(appointment.dealAmount !== undefined ? String(appointment.dealAmount) : '');
        setJawPromotion(appointment.jawPromotion || 'none');
        setNoShow(appointment.noShow || false);
        setBookedBy(appointment.bookedBy || '');
        setSmsStatus(appointment.smsStatus || 'idle');
        setSmsTextSent(appointment.smsTextSent || '');
        setIsNewPatientInline(false);
      } else {
        // Create Mode
        const directToInline = patients.length === 0;
        setIsNewPatientInline(directToInline);
        setPatientId(patients.length > 0 ? patients[0].id : '');
        setTitle('פגישת ייעוץ');
        setFirstReminder(false);
        setFinalConfirmation(false);
        setNotes('');
        setColor('mint');
        setArrivalConfirmed(false);
        setDealClosed(false);
        setDealAmount('');
        setJawPromotion('none');
        setNoShow(false);
        setBookedBy(defaultRepresentativeName);
        setSmsStatus('idle');
        setSmsTextSent('');
        
        // Reset inline patient form
        setNewPatientFirstName('');
        setNewPatientFamilyName('');
        setNewPatientNationalId('');
        setNewPatientPhoneNumber('');
        setNewPatientCity('');

        if (selectedDate) {
          setStart(convertToLocalInputValue(selectedDate.start));
          setEnd(convertToLocalInputValue(selectedDate.end));
        } else {
          // Fallback to current time and +1 hour
          const now = new Date();
          const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
          setStart(convertToLocalInputValue(now.toISOString()));
          setEnd(convertToLocalInputValue(oneHourLater.toISOString()));
        }
      }
      setError('');
    } else {
      isInitializedRef.current = false;
    }
  }, [isOpen, mode, appointment, selectedDate, patients, representatives, defaultRepresentativeName]);

  // Helper to convert full ISO string to "YYYY-MM-DDTHH:mm" for datetime-local
  const convertToLocalInputValue = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      const pad = (num: number) => String(num).padStart(2, '0');
      // Format to YYYY-MM-DDTHH:mm representing local time
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Keep appointment end date strictly synced to be exactly 15 minutes after start date
  useEffect(() => {
    if (start) {
      const startDate = new Date(start);
      if (!isNaN(startDate.getTime())) {
        const endDate = new Date(startDate.getTime() + 15 * 60 * 1000);
        setEnd(convertToLocalInputValue(endDate.toISOString()));
      }
    }
  }, [start]);

  if (!isOpen) return null;

  // React on patient change to prefill title if empty or default format
  const handlePatientChange = (pId: string) => {
    setPatientId(pId);
    setTitle('פגישת ייעוץ');
  };

  const currentPatient = patients.find(p => p.id === patientId);

  const filteredSearchPatients = patients.filter(p => {
    const fullName = `${p.firstName} ${p.familyName || ''}`.toLowerCase();
    const query = patientSearchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      (p.phoneNumber && p.phoneNumber.includes(query)) ||
      (p.nationalId && p.nationalId.includes(query))
    );
  });

   const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    let finalPatientId = patientId;

    if (mode === 'create' && isNewPatientInline) {
      // Validate inputs: Only name and phone are required now!
      const fName = newPatientFirstName.trim();
      const pNum = newPatientPhoneNumber.trim();

      if (!fName || !pNum) {
        setError('אנא מלאו את שדות החובה: שם פרטי ומספר טלפון.');
        setIsSubmitting(false);
        return;
      }

      // Check unique telephone scan
      const exists = patients.find(p => p.phoneNumber === pNum);
      if (exists) {
        setError(`מטופל עם מספר טלפון זה (${pNum}) כבר קיים במערכת (שם: ${exists.firstName} ${exists.familyName})! לא ניתן ליצור אותו שנית.`);
        setIsSubmitting(false);
        return;
      }

      try {
        const created = await onAddPatientInline({
          firstName: fName,
          familyName: newPatientFamilyName.trim() || '',
          nationalId: newPatientNationalId.trim() || '',
          phoneNumber: pNum,
          city: newPatientCity.trim() || '',
          representative: bookedBy.trim(),
        });
        finalPatientId = created.id;
      } catch (err: any) {
        setError(err.message || 'שגיאה ביצירת המטופל במסגרת תיאום התור');
        setIsSubmitting(false);
        return;
      }
    } else {
      if (!finalPatientId) {
        setError('נדרש לבחור מטופל רשום על מנת לקבוע תור.');
        setIsSubmitting(false);
        return;
      }
    }

    if (!start) {
      setError('אנא בחרו מועד ושעת תור תקינים.');
      setIsSubmitting(false);
      return;
    }

    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
      setError('מועד ושעת התור אינם תקינים.');
      setIsSubmitting(false);
      return;
    }

    // Dynamic hour and minute validation (Thursday vs other days)
    const dayOfWeek = startDate.getDay(); // 0 = Sunday, 4 = Thursday, etc.
    const hours = startDate.getHours();
    const minutes = startDate.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (dayOfWeek === 4) { // Thursday (יום חמישי)
      if (totalMinutes > 18 * 60) {
        setError('שגיאה ביצירת תור: ביום חמישי לא ניתן לשבץ תורים לאחר השעה 18:00.');
        setIsSubmitting(false);
        return;
      }
    } else { // Other days (שאר ימי השבוע)
      if (totalMinutes > 18 * 60 + 30) {
        setError('שגיאה ביצירת תור: משבצת אחרונה לשיבוץ תור בשאר ימי השבוע היא 18:30.');
        setIsSubmitting(false);
        return;
      }
    }

    // Set end time to always be exactly 15 minutes after start time
    const endDate = new Date(startDate.getTime() + 15 * 60 * 1000);

    // Lock appointment title strictly to 'פגישת ייעוץ' (Consultation Appointment) as requested
    const appointmentTitle = 'פגישת ייעוץ';

    try {
      await onSave({
        id: mode === 'edit' && appointment ? appointment.id : undefined,
        patientId: finalPatientId,
        title: appointmentTitle,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        firstReminder,
        finalConfirmation,
        notes: notes.trim(),
        color,
        arrivalConfirmed,
        dealClosed,
        dealAmount: dealClosed && dealAmount.trim() ? Number(dealAmount) : undefined,
        jawPromotion: dealClosed ? jawPromotion : 'none',
        noShow,
        bookedBy: bookedBy.trim(),
        smsStatus,
        smsTextSent
      });
    } catch (saveError) {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (mode === 'create') {
        const hasInlineData = isNewPatientInline && newPatientFirstName.trim() && newPatientPhoneNumber.trim();
        const hasSelectedPatient = !isNewPatientInline && patientId;
        if (hasInlineData || hasSelectedPatient) {
          handleSubmit(e);
        } else {
          onClose();
        }
      } else {
        handleSubmit(e);
      }
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in cursor-pointer" 
      id="appointment-modal-overlay" 
      dir="rtl"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg border border-teal-100 shadow-xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-right cursor-default"
        id="appointment-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-50 bg-[#fbfcfa] shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {mode === 'edit' ? 'עדכון פרטי תור' : 'תיאום תור חדש ביומן'}
            </h3>
            <p className="text-[11px] text-slate-555 font-medium mt-0.5">
              {mode === 'edit' ? 'בדיקת סטטוס, שינוי שעות טיפול והערות' : 'הקצאת משבצת זמן פנויה למטופל'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors ${
              isSubmitting ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-100" id="appointment-form">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-medium text-right">
              {error}
            </div>
          )}

          {patients.length === 0 && !isNewPatientInline ? (
            <div className="p-6 text-center border border-dashed border-amber-200 bg-amber-50/20 rounded-2xl">
              <HelpCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-amber-800">אין מטופלים רשומים במערכת</p>
              <p className="text-xs text-amber-600 mt-1 max-w-sm mx-auto">
                על מנת לקבוע תור פגישה ביומן, עליכם להוסיף מטופל לפריסת המרפאה.
              </p>
              <button
                type="button"
                onClick={() => setIsNewPatientInline(true)}
                className="mt-3 px-4 py-1.5 bg-teal-500 text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-teal-650 transition-all cursor-pointer"
              >
                ✨ צור מטופל חדש בזמן אמת כעת
              </button>
            </div>
          ) : (
            <>
              <div>
                {mode === 'create' && patients.length > 0 && (
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1.5 mb-3.5 border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setIsNewPatientInline(false)}
                      className={`flex-1 text-center py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                        !isNewPatientInline 
                          ? 'bg-white text-slate-900 shadow-3xs border border-slate-200' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      📂 בחר מטופל קיים מהרשימה
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewPatientInline(true)}
                      className={`flex-1 text-center py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                        isNewPatientInline 
                          ? 'bg-white text-slate-900 shadow-3xs border border-slate-200' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ✨ צור מטופל חדש בזמן אמת
                    </button>
                  </div>
                )}

                {isNewPatientInline ? (
                  <div className="bg-teal-50/20 border border-teal-100 rounded-2xl p-4 space-y-3.5 animate-in fade-in duration-200 text-right">
                    <p className="text-xs font-extrabold text-teal-850 flex items-center gap-1.5">
                      <span>👤</span> פרטי המטופל החדש (רישום מהיר בזמן אמת):
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-650 mb-1">שם פרטי *</label>
                        <input
                          type="text"
                          value={newPatientFirstName}
                          onChange={(e) => {
                            setNewPatientFirstName(e.target.value);
                          }}
                          className="w-full px-2.5 py-1.7 text-xs bg-white border border-slate-250 rounded-lg focus:ring-1 focus:ring-teal-400 focus:border-teal-400 text-slate-750"
                          placeholder="שם פרטי של הלקוח"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-650 mb-1">שם משפחה (רשות)</label>
                        <input
                          type="text"
                          value={newPatientFamilyName}
                          onChange={(e) => {
                            setNewPatientFamilyName(e.target.value);
                          }}
                          className="w-full px-2.5 py-1.7 text-xs bg-white border border-slate-250 rounded-lg focus:ring-1 focus:ring-teal-400 focus:border-teal-400 text-slate-750"
                          placeholder="שם משפחה של הלקוח"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-650 mb-1">מספר טלפון לזיהוי ייחודי *</label>
                        <input
                          type="tel"
                          value={newPatientPhoneNumber}
                          onChange={(e) => setNewPatientPhoneNumber(e.target.value)}
                          className="w-full px-2.5 py-1.7 text-xs bg-white border border-slate-250 rounded-lg focus:ring-1 focus:ring-teal-400 focus:border-teal-400 text-slate-750 font-mono text-right"
                          placeholder="לדוגמה: 0501234567"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-650 mb-1">עיר מגורים (רשות)</label>
                        <input
                          type="text"
                          value={newPatientCity}
                          onChange={(e) => setNewPatientCity(e.target.value)}
                          className="w-full px-2.5 py-1.7 text-xs bg-white border border-slate-250 rounded-lg focus:ring-1 focus:ring-teal-400 focus:border-teal-400 text-slate-750"
                          placeholder="עיר מגורי המטופל"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-500" /> חיפוש ובחירת מטופל רשום
                    </label>

                    {/* Simple Search Input to satisfy "בשביל לבצע חיפוש חופשי" requirement */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="הקלידו חלק משם הלקוח או מספר הטלפון לאיתור..."
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400 text-slate-750 placeholder:text-slate-400 text-right"
                      />
                      {patientSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setPatientSearchQuery('')}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                        >
                          נקה
                        </button>
                      )}
                    </div>

                    {/* Interactive matched Patient results list */}
                    <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50 max-h-[145px] overflow-y-auto scrollbar-thin">
                      {filteredSearchPatients.length === 0 ? (
                        <div className="p-4 text-center text-[11px] text-slate-400">
                          לא נמצאו מטופלים תואמים
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100/70">
                          {filteredSearchPatients.map(p => {
                            const isSelected = p.id === patientId;
                            return (
                              <button
                                type="button"
                                key={p.id}
                                onClick={() => handlePatientChange(p.id)}
                                className={`w-full text-right px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                  isSelected 
                                    ? 'bg-teal-50/70 text-teal-900 font-extrabold' 
                                    : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div>
                                  <span className="font-bold">{p.firstName} {p.familyName}</span>
                                  {p.phoneNumber && <span className="font-mono text-[10px] text-slate-400 mr-2">({p.phoneNumber})</span>}
                                </div>
                                {isSelected ? (
                                  <span className="text-teal-700 text-[10px] font-extrabold bg-teal-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    ✓ נבחר
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[9px] hover:text-slate-600">לחצו לבחירה</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {(() => {
                      const patient = patients.find(p => p.id === patientId);
                      return patient ? (
                        <div className="mt-2 bg-teal-50/15 rounded-xl p-2.5 border border-teal-50/30 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold">
                          <p><span className="text-slate-400 font-medium">טלפון:</span> {patient.phoneNumber}</p>
                          <p><span className="text-slate-400 font-medium">עיר:</span> {patient.city || '(לא צוין)'}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Locked Treatment Type & Representative who booked the appointment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold">סוג הפגישה הטיפולית ביומן:</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                      🩺 פגישת ייעוץ
                    </span>
                  </div>
                  <span className="text-[9px] bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full font-bold">
                    קבוע במערכת
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <span>👤</span> נציג המרפאה שקבע את התור
                  </label>
                  <select
                    value={bookedBy}
                    onChange={(e) => setBookedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#fbfcfa] border border-slate-205 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-colors text-slate-750 cursor-pointer text-right"
                  >
                    <option value="">-- בחר נציג מתוך רשימה --</option>
                    {representatives.map((rep) => (
                      <option key={rep.id} value={rep.name}>
                        {rep.name} ({rep.role === 'admin' ? 'מנהל' : 'נציג'})
                      </option>
                    ))}
                    {bookedBy && !representatives.some(r => r.name.trim() === bookedBy.trim()) && (
                      <option value={bookedBy}>{bookedBy}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="block text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-500 animate-pulse" /> מועד ושעת התחלת התור
                    </label>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                      ⏱️ אורך התור קבוע מראש: 15 דקות
                    </span>
                  </div>
                  <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#fbfcfa] border border-slate-205 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-colors text-slate-750 font-black font-mono text-right"
                    required
                  />
                </div>
              </div>

              {/* Confirmation Modifiers (The core icons checkboxes styled in fine soft pastels) */}
              <div className="border border-amber-200/55 bg-[#fffdfa] rounded-2xl p-4.5 space-y-4">
                <p className="text-xs font-bold text-amber-850">ניהול סטטוס, צבע ואישור הגעה</p>

                {/* 1. Pastel Color selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2">צבע סיווג פסטלי ביומן המרפאה:</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setColor('mint')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-150 ${
                        color === 'mint' 
                        ? 'bg-[#e2f1ed] border-teal-400 text-teal-850 shadow-3xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-[#14b8a6] border border-teal-600/25" />
                      מנטה (בית חולים)
                    </button>
                    <button
                      type="button"
                      onClick={() => setColor('orange')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-150 ${
                        color === 'orange' 
                        ? 'bg-[#fef3e7] border-amber-400 text-amber-850 shadow-3xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-[#f59e0b] border border-amber-600/25" />
                      כתום פסטל
                    </button>
                    <button
                      type="button"
                      onClick={() => setColor('pink')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-150 ${
                        color === 'pink' 
                        ? 'bg-[#fdf2f8] border-pink-400 text-pink-850 shadow-3xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-[#ec4899] border border-pink-600/25" />
                      ורוד עדין
                    </button>
                  </div>
                </div>

                {/* 2. Arrival Confirmation & Paying Customer (Deal Closed) & No-Show Statuses */}
                <div className="border-t border-slate-100/80 pt-3 space-y-4">
                  {/* Arrival Confirmation Custom Icon toggle */}
                  <label className="flex items-start gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={arrivalConfirmed}
                      onChange={(e) => {
                        setArrivalConfirmed(e.target.checked);
                        if (e.target.checked) setNoShow(false);
                      }}
                      className="mt-0.7 w-4.5 h-4.5 rounded-md border-emerald-300 text-emerald-500 checked:bg-emerald-500 checked:border-emerald-600 focus:ring-emerald-500/20 cursor-pointer transition-all"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-800">הלקוח אישר הגעה בטוחה לפגישה ✓✓</span>
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black tracking-tight">
                          ✓✓ וי כפול
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                        סימון זה יציג סמל וי כפול (✓✓) בקוביה של המטופל המביע את הסכמתו ואישור הגעתו הבטוחה למרפאה.
                      </p>
                    </div>
                  </label>

                  {/* Paying Customer (Deal Closed) Custom Icon toggle */}
                  <div className="border-t border-slate-100/40 pt-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={dealClosed}
                        onChange={(e) => setDealClosed(e.target.checked)}
                        className="mt-0.7 w-4.5 h-4.5 rounded-md border-amber-300 text-amber-500 checked:bg-amber-500 checked:border-amber-600 focus:ring-amber-500/20 cursor-pointer transition-all"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-800">לקוח משלם - סגר עסקה ושילם במרפאה 👑</span>
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-850 border border-amber-200 text-[9px] font-black">
                            👑 כתר זהב מלכותי
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                          מדגיש את התור ביומן עם כתר זהב יוקרתי ומסמן את המטופל כלקוח שסגר עסקה מוצלחת ושילם בקליניקה!
                        </p>

                        {/* Interactive promotion sum and jaws details */}
                        {dealClosed && (
                          <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200/50 rounded-xl space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            {/* Deal sum */}
                            <div>
                              <label className="block text-[11.5px] font-black text-amber-950 mb-1">
                                סכום העסקה במלואו (בש"ח ₪):
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  placeholder="לדוגמה: 25200"
                                  value={dealAmount}
                                  onChange={(e) => setDealAmount(e.target.value)}
                                  className="w-full text-xs font-sans py-2 pl-8 pr-3 bg-white border border-amber-200 rounded-lg outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-bold text-slate-800 text-left"
                                />
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-600 font-extrabold text-xs select-none">
                                  ₪
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                <button
                                  type="button"
                                  onClick={() => setDealAmount('25200')}
                                  className="text-[9.5px] font-black px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-850 border border-amber-200 rounded-md transition-all cursor-pointer"
                                >
                                  מבצע לסת אחת: 25,200 ₪
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDealAmount('50400')}
                                  className="text-[9.5px] font-black px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-850 border border-amber-200 rounded-md transition-all cursor-pointer"
                                >
                                  מבצע שתי לסתות: 50,400 ₪
                                </button>
                              </div>
                            </div>

                            {/* Jaw campaign selector */}
                            <div>
                              <label className="block text-[11.5px] font-black text-amber-950 mb-1">
                                פרטי המבצע שמימש הלקוח:
                              </label>
                              <div className="grid grid-cols-1 gap-1.5">
                                <label className="flex items-center gap-2 p-1.5 bg-white/80 rounded-lg border border-amber-100 cursor-pointer hover:bg-white select-none transition-all">
                                  <input
                                    type="radio"
                                    name="jawPromotion"
                                    checked={jawPromotion === 'none'}
                                    onChange={() => setJawPromotion('none')}
                                    className="w-3.5 h-3.5 text-amber-500 border-amber-300 focus:ring-amber-500/10 cursor-pointer"
                                  />
                                  <span className="text-[10px] font-bold text-slate-700">לא מימש מבצע לסתות מוזל</span>
                                </label>

                                <label className="flex items-center gap-2 p-1.5 bg-white/80 rounded-lg border border-amber-100 cursor-pointer hover:bg-white select-none transition-all">
                                  <input
                                    type="radio"
                                    name="jawPromotion"
                                    checked={jawPromotion === 'one'}
                                    onChange={() => {
                                      setJawPromotion('one');
                                      if (!dealAmount) setDealAmount('25200');
                                    }}
                                    className="w-3.5 h-3.5 text-amber-500 border-amber-300 focus:ring-amber-500/10 cursor-pointer"
                                  />
                                  <span className="text-[10px] font-black text-teal-850">הלקוח מימש מבצע ללסת אחת 🦷 (₪25,200)</span>
                                </label>

                                <label className="flex items-center gap-2 p-1.5 bg-white/80 rounded-lg border border-amber-100 cursor-pointer hover:bg-white select-none transition-all">
                                  <input
                                    type="radio"
                                    name="jawPromotion"
                                    checked={jawPromotion === 'two'}
                                    onChange={() => {
                                      setJawPromotion('two');
                                      if (!dealAmount || dealAmount === '25200') setDealAmount('50400');
                                    }}
                                    className="w-3.5 h-3.5 text-amber-500 border-amber-300 focus:ring-amber-500/10 cursor-pointer"
                                  />
                                  <span className="text-[10px] font-black text-indigo-800 font-sans">הלקוח מימש מבצע לשתי לסתות 🦷🦷 (₪50,400)</span>
                                </label>
                              </div>
                              <p className="text-[8.5px] text-amber-800 mt-1 font-bold leading-tight">
                                * קמפיין מיוחד: 14 שיניים על שתלים ובר טיטניום ברמת גימור הגבוהה ביותר.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* No-show (הבריז) Custom Icon toggle */}
                  <div className="border-t border-slate-100/40 pt-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={noShow}
                        onChange={(e) => {
                          setNoShow(e.target.checked);
                          if (e.target.checked) {
                            setArrivalConfirmed(false);
                            setDealClosed(false);
                          }
                        }}
                        className="mt-0.7 w-4.5 h-4.5 rounded-md border-rose-300 text-rose-500 checked:bg-rose-500 checked:border-rose-600 focus:ring-rose-500/20 cursor-pointer transition-all"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-800">הלקוח לא הגיע למרפאה (הברזה) ❌</span>
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-black">
                            ❌ הברזה
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                          מסמן את הלקוח ביומן כמרפאה שפסילת הגעה או טיפול שלא מומש (הברזה).
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Standard checkboxes in grid */}
                <div className="border-t border-slate-100/80 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* First Reminder: Checkmark */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={firstReminder}
                      onChange={(e) => setFirstReminder(e.target.checked)}
                      className="w-4 h-4 rounded-md border-slate-300 text-teal-600 focus:ring-teal-400/20"
                    />
                    <span className="text-[11px] font-bold text-slate-650 flex items-center gap-1.5">
                      תזכורת ראשונה אושרה <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
                    </span>
                  </label>

                  {/* Final Confirmation: Airplane */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={finalConfirmation}
                      onChange={(e) => setFinalConfirmation(e.target.checked)}
                      className="w-4 h-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-450/20"
                    />
                    <span className="text-[11px] font-bold text-slate-650 flex items-center gap-1.5">
                      אישור מעקב סופי <Plane className="w-3 h-3 text-sky-500 fill-sky-200" />
                    </span>
                  </label>
                </div>

                {/* Clinical Communication Hub (WhatsApp Clinical Scheduling) */}
                {mode === 'edit' && currentPatient && (
                  <div className="border-t border-slate-100 pt-4 space-y-3.5" id="communication-hub-container">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700">תקשורת קלינית ותזכורות למטופל 📲</p>
                      <span className="text-[9.5px] bg-emerald-100 text-[#115e59] border border-emerald-200 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        מחובר ל-WhatsApp שלך
                      </span>
                    </div>

                    <div className="bg-emerald-50/25 p-3 rounded-xl border border-emerald-100 space-y-2.5">
                      {/* WhatsApp Bubble Preview */}
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100/60 text-[10px] text-slate-700 space-y-1 text-right shadow-3xs leading-relaxed" dir="rtl">
                        <p className="text-[#0f766e] text-[10px] font-black border-b border-rose-50 pb-1 mb-1 flex items-center gap-1">
                          🟢 תבנית הודעת תזכורת המוכנה לשיגור:
                        </p>
                        <p className="font-mono text-slate-600">
                          שלום *{currentPatient.firstName} {currentPatient.familyName || ''}* היקר/ה,
                        </p>
                        <p className="font-mono text-slate-600">
                          תזכורת חמה לתורך הקרוב במרפאת *DENTE מומחים פה ולסת*:
                        </p>
                        <p className="font-bold text-teal-950 font-mono">
                          📅 בתאריך {new Date(start || Date.now()).toLocaleDateString('he-IL')} (יום {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][new Date(start || Date.now()).getDay()]})
                        </p>
                        <p className="font-bold text-teal-950 font-mono">
                          ⏰ בשעה {new Date(start || Date.now()).toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})}
                        </p>
                        <p className="font-semibold text-slate-500 text-[9px] pt-1 border-t border-slate-100 mt-1 leading-normal">
                          נא לאשר הגעה בהחזרת ספרה:
                          <br />
                          *1* - לאישור הגעה סופית ✓
                          <br />
                          *2* - לביטול התור או תיאום מחדש ❌
                        </p>
                      </div>

                      {/* Active API launcher */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            const rawPhone = currentPatient.phoneNumber || '';
                            // Clean phone to ensure international 972 formatting (Israel)
                            let cleanPhone = rawPhone.replace(/[^\d]/g, '');
                            if (cleanPhone.startsWith('0')) {
                              cleanPhone = '972' + cleanPhone.substring(1);
                            } else if (!cleanPhone.startsWith('972') && cleanPhone.length > 0) {
                              cleanPhone = '972' + cleanPhone;
                            }
                            
                            const dayName = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][new Date(start || Date.now()).getDay()];
                            const formattedDate = new Date(start || Date.now()).toLocaleDateString('he-IL');
                            const formattedTime = new Date(start || Date.now()).toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'});
                            
                            const messageText = `שלום *${currentPatient.firstName} ${currentPatient.familyName || ''}*,\n\nתזכורת חמה לתורך במרפאת *DENTE מומחים*\n📅 בתאריך: ${formattedDate} (יום ${dayName})\n⏰ בשעה: ${formattedTime}\n\nנא אשרו הגעה בהחזרת ספרה:\n*1* - לאישור הגעה סופית ✓\n*2* - לביטול או לתיאום חדש ❌`;
                            
                            const waUrl = `https://wa.me/${cleanPhone}/?text=${encodeURIComponent(messageText)}`;
                            window.open(waUrl, '_blank');
                          }}
                          className="w-full py-2 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/30"
                        >
                          <span>💬 שגר הודעת WhatsApp (מהחשבון שלך)</span>
                        </button>

                        {/* 2-Way automated interactive Webhook simulator */}
                        <div className="border border-slate-205/60 bg-amber-50/20 p-2 rounded-xl mt-1">
                          <span className="text-[10px] font-black text-[#854d0e] block mb-1">🤖 סימולטור מנוי וסנכרון דו-כיווני:</span>
                          <p className="text-[9px] text-[#854d0e]/90 leading-tight mb-2">
                            מדמה את הרגע בו הלקוח משיב לתבנית ששלחת באחד מהמספרים שהוצעו.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setFirstReminder(true);
                                setArrivalConfirmed(true);
                                setNoShow(false);
                                alert(`🤖 [סימולטור סנכרון DENTE Webhook]\n\nהתקבלה הודעה חוזרת ב-WhatsApp מהמטופל/ת ${currentPatient.firstName}!\n\nהתוכן שהתקבל: "1"\nמשמעות: הלקוח אישר את הגעתו סופית.\n\nתוצאה: סטטוס התור ביומן עודכן כעת אוטומטית ל-"אישור הגעה" (וי כפול ירוק)! ✨`);
                              }}
                              className="py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              👍 משיב (1) - מאשר
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setFirstReminder(true);
                                setArrivalConfirmed(false);
                                setNoShow(true);
                                setDealClosed(false);
                                alert(`🤖 [סימולטור סנכרון DENTE Webhook]\n\nהתקבלה הודעה חוזרת ב-WhatsApp מהמטופל/ת ${currentPatient.firstName}!\n\nהתוכן שהתקבל: "2"\nמשמעות: הלקוח ביקש לבטל / הבריז.\n\nתוצאה: סטטוס התור ביומן עודכן כעת אוטומטית ל-"הברזה ❌"!`);
                              }}
                              className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              👎 משיב (2) - מבטל
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[8.5px] text-[#0f766e]/85 leading-normal text-right font-medium">
                        * לחיצה על "שגר הודעה" תפתח ישירות שיחת WhatsApp מהחשבון האישי שלך עם הודעה מוכנה לשיגור ללא עלות. כדי לסנכרן תשובות באופן אוטומטי לחלוטין ללא לחיצה על כפתור הסימולטור, ניתן בעתיד לחבר גייטוויי כגון Twilio או GreenAPI המקשיב לשרת.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">הערות פנימיות וטיפולים נלווים</label>
                <textarea
                  rows={2}
                  placeholder="הערות מיוחדות, העדפת רופא מטפל, רגישויות או הנחיות מיוחדות קודמות..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#fbfcfa] border border-slate-205 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-colors resize-none text-slate-700"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {mode === 'edit' && onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(appointment!.id)}
                      disabled={isSubmitting}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded-xl transition-all duration-150 cursor-pointer ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> ביטול תור
                    </button>
                  )}
                  {mode === 'edit' && onStartReschedule && (
                    <button
                      type="button"
                      onClick={() => onStartReschedule(appointment!)}
                      disabled={isSubmitting}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-600 hover:text-white hover:bg-amber-500 border border-amber-200 hover:border-amber-500 rounded-xl transition-all duration-150 cursor-pointer ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="מאפשר לפתוח מצב העברה ולנווט חופשית ביומן עד הקלקה לשיבוץ מחדש"
                    >
                      <span>🔄</span> העבר תור (ניווט חופשי)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-205 rounded-xl cursor-pointer ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-xs font-bold text-white bg-gradient-to-l from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl shadow-xs cursor-pointer border border-teal-600 flex items-center gap-1.5 ${
                      isSubmitting ? 'opacity-65 cursor-not-allowed font-medium' : ''
                    }`}
                  >
                    {isSubmitting && (
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    )}
                    {isSubmitting ? 'שומר תור...' : (mode === 'edit' ? 'עדכן תור ביומן' : 'קבע תור חדש')}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
