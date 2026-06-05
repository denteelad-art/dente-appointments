import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, MapPin, CreditCard, Calendar, Clock, FileText, CheckCircle, Save, History, AlertCircle } from 'lucide-react';
import { Patient, Appointment, Representative } from '../types';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSavePatient: (updatedPatient: Patient) => void;
  appointments: Appointment[];
  representatives?: Representative[];
}

export default function PatientDetailsModal({
  isOpen,
  onClose,
  patient,
  onSavePatient,
  appointments = [],
  representatives = []
}: PatientDetailsModalProps) {
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [representative, setRepresentative] = useState('');
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Initialize fields when patient changes
  useEffect(() => {
    if (patient) {
      setFirstName(patient.firstName || '');
      setFamilyName(patient.familyName || '');
      setNationalId(patient.nationalId || '');
      setPhoneNumber(patient.phoneNumber || '');
      setCity(patient.city || '');
      setRepresentative(patient.representative || '');
      setError('');
      setIsSaved(false);
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  // Filter appointments for this patient
  const patientAppointments = appointments.filter(appt => appt.patientId === patient.id);

  // Sort appointments: newest/future first
  const sortedAppointments = [...patientAppointments].sort((a, b) => {
    return new Date(b.start).getTime() - new Date(a.start).getTime();
  });

  const nowTime = new Date().getTime();
  const upcoming = sortedAppointments.filter(appt => new Date(appt.start).getTime() >= nowTime);
  const past = sortedAppointments.filter(appt => new Date(appt.start).getTime() < nowTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaved(false);

    if (!firstName.trim()) {
      setError('אנא מלאו שם פרטי (חובה).');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('אנא מלאו מספר טלפון (חובה).');
      return;
    }

    onSavePatient({
      ...patient,
      firstName: firstName.trim(),
      familyName: familyName.trim(),
      nationalId: nationalId.trim(),
      phoneNumber: phoneNumber.trim(),
      city: city.trim(),
      representative: representative || ''
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const formatDateHebrew = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const formatTimeHebrew = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[50000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans animate-fade-in cursor-pointer" 
      dir="rtl"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white opacity-100 z-10 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100 animate-scale-up cursor-default"
        id="patient-details-modal-box"
      >
        {/* Header */}
        <header className="px-6 py-4 bg-[#f0fcf9] border-b border-teal-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.2 bg-teal-100/60 text-teal-700 rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h3 className="font-extrabold text-[#0b5e50] text-sm sm:text-base leading-tight">
                תיק קליני: {patient.firstName} {patient.familyName}
              </h3>
              <p className="text-[10px] text-teal-600 font-medium">עריכת פרטי מטופל וצפייה בהיסטוריית טיפולים מלאה</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            title="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-teal-100 text-right">
          
          {/* Main layout grid - Edit details left/top, Appointments right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left/Edit Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-150">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  פרטי זיהוי וקשר
                </h4>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {error && (
                    <div className="p-2 text-[11px] bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold">
                      {error}
                    </div>
                  )}

                  {isSaved && (
                    <div className="p-2 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl font-bold flex items-center gap-1.5">
                      <span>✓</span> השינויים נשמרו בהצלחה!
                    </div>
                  )}

                  <div className="space-y-3 text-right">
                    {/* First Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 mb-1">שם פרטי <span className="text-rose-500 font-bold">*</span></label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400 text-slate-700 font-medium"
                        placeholder="שם פרטי"
                        required
                      />
                    </div>

                    {/* Family Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 mb-1">שם משפחה</label>
                      <input
                        type="text"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400 text-slate-700 font-medium"
                        placeholder="שם משפחה"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 mb-1">מספר טלפון <span className="text-rose-500 font-bold">*</span></label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pr-8 pl-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400 text-slate-700 font-mono text-right direction-ltr"
                          placeholder="טלפון נייד"
                          required
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 mb-1">עיר מגורים</label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full pr-8 pl-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400 text-slate-700 font-medium"
                          placeholder="עיר מגורים"
                        />
                      </div>
                    </div>

                    {/* Representative Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 mb-1">נציג המרפאה המשוייך (רשות)</label>
                      <select
                        value={representative}
                        onChange={(e) => setRepresentative(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400 text-slate-700 font-medium text-right cursor-pointer"
                      >
                        <option value="">ללא נציג משוייך (רשות)</option>
                        {representatives.map((rep) => (
                          <option key={rep.id} value={rep.name}>
                            {rep.name} ({rep.role === 'admin' ? 'מנהל/ת' : 'נציג/ה'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-xl shadow-xs text-xs cursor-pointer transition-all duration-150"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>שמור שינויים בכרטיס</span>
                  </button>
                </form>
              </div>

              {/* Patient created date */}
              <div className="text-[10px] text-slate-400 text-center font-medium bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                כרטיס רפואי נוצר ב- {new Date(patient.createdAt || Date.now()).toLocaleDateString('he-IL')} בשעה {new Date(patient.createdAt || Date.now()).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>

            {/* Right/Appointments Log Column */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Upcoming section */}
              <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-3xs flex flex-col">
                <h4 className="text-xs font-bold text-indigo-950 mb-3 flex items-center gap-1.5 border-b border-indigo-50 pb-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  תורים עתידיים מתוכננים ({upcoming.length})
                </h4>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {upcoming.length === 0 ? (
                    <div className="py-5 text-center text-slate-400 text-[11px] bg-slate-50/40 rounded-xl border border-dashed border-slate-100">
                      אין תורים עתידיים מתוכננים.
                    </div>
                  ) : (
                    upcoming.map(appt => (
                      <div 
                        key={appt.id}
                        className="bg-indigo-50/20 hover:bg-indigo-50/45 p-2.5 rounded-xl border border-indigo-100/60 text-right text-xs transition-colors"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-extrabold text-slate-800 text-[11px]">{appt.title}</span>
                          <span className="text-[9.5px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 shrink-0 font-mono">
                            {formatTimeHebrew(appt.start)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 leading-none">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatDateHebrew(appt.start)}</span>
                          </span>
                          {appt.bookedBy && (
                            <span className="text-slate-500 font-extrabold bg-[#f1f5f9] px-1.5 py-0.5 rounded border border-slate-200">
                              👤 נקבע ע"י: {appt.bookedBy}
                            </span>
                          )}
                        </div>
                        {appt.notes && (
                          <p className="text-[10px] text-slate-400 mt-1.5 bg-white p-1.5 rounded-lg border border-slate-100 leading-tight">
                            📝 {appt.notes}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {appt.dealClosed && <span className="text-[12px] bg-amber-100 text-amber-950 border border-amber-300 px-2.5 py-1 rounded-md font-extrabold flex items-center gap-1 shadow-3xs">👑 סגר עסקה משלמת</span>}
                          {appt.arrivalConfirmed && <span className="text-[9px] bg-emerald-50 text-emerald-950 border border-emerald-200 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5">✓✓ הגעה בטוחה אושרה</span>}
                          {appt.firstReminder && !appt.arrivalConfirmed && <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold">✓ שלב א' אושר</span>}
                          {appt.finalConfirmation && <span className="text-[9px] bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.5 rounded-md font-bold">✈ מעקב סופי אושר</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Past history section */}
              <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-3xs flex flex-col">
                <h4 className="text-xs font-bold text-teal-950 mb-3 flex items-center gap-1.5 border-b border-teal-50 pb-2">
                  <History className="w-3.5 h-3.5 text-teal-600" />
                  היסטוריית טיפולים קודמים ({past.length})
                </h4>

                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {past.length === 0 ? (
                    <div className="py-5 text-center text-slate-400 text-[11px] bg-slate-50/40 rounded-xl border border-dashed border-slate-100">
                      אין היסטוריית טיפולים קודמים שנרשמו בלוח השנה.
                    </div>
                  ) : (
                    past.map(appt => (
                      <div 
                        key={appt.id}
                        className="bg-slate-50/55 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-right text-xs transition-colors"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-extrabold text-slate-700 text-[11.5px] ">{appt.title}</span>
                          <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0 font-mono">
                            {formatTimeHebrew(appt.start)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-450 font-bold mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 leading-none">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatDateHebrew(appt.start)}</span>
                          </span>
                          {appt.bookedBy && (
                            <span className="text-slate-500 font-extrabold bg-[#f1f5f9] px-1.5 py-0.5 rounded border border-slate-200">
                              👤 נקבע ע"י: {appt.bookedBy}
                            </span>
                          )}
                        </div>
                        {appt.notes && (
                          <p className="text-[10px] text-slate-400 mt-1.5 bg-white p-1.5 rounded-lg border border-slate-100 leading-tight">
                            📝 {appt.notes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Action controls footer */}
        <footer className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-4.5 py-2 bg-slate-205 text-slate-700 rounded-xl hover:bg-slate-300 font-extrabold text-xs transition-all cursor-pointer"
          >
            סגור חלון
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
