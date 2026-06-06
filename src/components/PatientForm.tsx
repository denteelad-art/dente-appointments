import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User, MapPin, Phone, Search, Plus, Trash2 } from 'lucide-react';
import { Patient, Appointment, Representative } from '../types';
import PatientDetailsModal from './PatientDetailsModal';

interface PatientFormProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  onDeletePatient: (id: string) => void;
  appointments?: Appointment[];
  onUpdatePatient?: (patient: Patient) => void;
  representatives?: Representative[];
  borderClass?: string;
  accentTextClass?: string;
}

export default function PatientForm({ 
  patients, 
  onAddPatient, 
  onDeletePatient,
  appointments = [],
  onUpdatePatient,
  representatives = [],
  borderClass,
  accentTextClass
}: PatientFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMainDirectoryOpen, setIsMainDirectoryOpen] = useState(false);

  // Patient Card Details view/edit modal states
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.familyName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      patient.nationalId.toLowerCase().includes(query) ||
      patient.city.toLowerCase().includes(query) ||
      patient.phoneNumber.includes(query)
    );
  });

  return (
    <div className="text-right font-sans" id="patient-management-container" dir="rtl">
      {/* Sleek Patient Directory Action Button */}
      <div className={`bg-white rounded-2xl border ${borderClass || 'border-slate-150'} shadow-2xs hover:shadow-xs transition-all overflow-hidden text-right`} id="patient-directory-shortcut-panel">
        <button
          type="button"
          onClick={() => setIsMainDirectoryOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-right transition-all duration-155 group border-none cursor-pointer"
          title="לחצו לפתיחת מאגר המטופלים המלא: חיפוש, יצירת כרטיסי לקוח חדשים, סינון תורים, מחיקה וניהול קליני"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-105 transition-all flex items-center justify-center">
              <User className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 leading-tight">מאגר המטופלים</h3>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">חיפוש, סיווג וניהול</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-teal-850">
              {patients.length} רשומים
            </span>
            <span className="text-xs text-slate-400 group-hover:-translate-x-1 transition-transform">◀</span>
          </div>
        </button>
      </div>

      {/* Floating Comprehensive Patient Database Center Modal */}
      {isMainDirectoryOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[40000] flex items-center justify-center p-4" 
          onClick={() => setIsMainDirectoryOpen(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right font-sans"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    מאגר המטופלים המלא DENTE
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold">חיפוש מהיר לפי שם, תעודת זהות, טלפון או עיר מגורים</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-teal-50/80 border border-teal-150 text-teal-750 text-[10px] font-black px-2.5 py-1 rounded-full">
                  {patients.length} מטופלים סה״כ
                </div>
                <button
                  type="button"
                  onClick={() => setIsMainDirectoryOpen(false)}
                  className="p-1 px-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Comprehensive Live Search Area */}
            <div className="p-4 border-b border-slate-100/85 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="אנא הקלידו שם, תעודת זהות, מספר טלפון או עיר..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100/55 rounded-xl transition-all text-slate-700 font-extrabold text-right placeholder-slate-400"
                />
              </div>
            </div>

            {/* Scrollable Patient List Container */}
            <div className="p-4 overflow-y-auto space-y-2.5 bg-slate-50/30 flex-1 min-h-0">
              {filteredPatients.length === 0 ? (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 bg-white rounded-xl text-xs flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <span className="font-bold">{searchQuery ? 'לא נמצאו מטופלים תואמים לחיפוש' : 'אין מטופלים רשומים עדיין.'}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                  {filteredPatients.map(patient => (
                    <div
                      key={patient.id}
                      className="group border border-slate-150 hover:border-teal-300 hover:ring-3 hover:ring-teal-50/70 bg-white hover:bg-teal-50/5 rounded-xl p-3.5 transition-all relative flex flex-col gap-1.5 shadow-3xs cursor-pointer select-none"
                      onClick={() => {
                        setSelectedPatientForView(patient);
                        setIsDetailsModalOpen(true);
                       }}
                      title="קליק לצפייה בתיק מטופל, היסטוריית טיפולים ועריכה"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <span>👤</span>
                            <span>{patient.firstName} {patient.familyName}</span>
                          </h3>
                          {patient.nationalId && (
                            <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 font-semibold">מדד זיהוי: {patient.nationalId}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid opening view modal
                            onDeletePatient(patient.id);
                          }}
                          className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all duration-150 cursor-pointer"
                          title="מחק כרטיס מטופל מהמאגר"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1 mt-1 text-[10px] text-slate-500 border-t border-slate-100/70 pt-2">
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold font-mono">
                          <Phone className="w-3 h-3 text-teal-400" />
                          <span>{patient.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end text-slate-600 font-bold">
                          <MapPin className="w-3 h-3 text-teal-400" />
                          <span className="truncate max-w-[110px] text-left">{patient.city || '(לא הוזן)'}</span>
                        </div>
                      </div>

                      {patient.representative && (
                        <div className="text-[9px] text-teal-800 bg-teal-50/50 border border-teal-100/40 rounded-lg py-1 px-2.5 mt-1 flex items-center gap-1 w-fit">
                          <span>👥 נציג:</span>
                          <span className="font-extrabold">{patient.representative}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-150 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-bold">
              <span>💡 לחצו על כרטיס כלשהו לפתיחת תיק, היסטוריית תורים ועדכון פרטים.</span>
              <button
                type="button"
                onClick={() => setIsMainDirectoryOpen(false)}
                className="bg-slate-800 hover:bg-[#1e293b] text-white rounded-xl py-1.5 px-4 font-bold cursor-pointer text-xs"
              >
                סגור מאגר
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Interactive Detail Record & History Log Modal */}
      <PatientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPatientForView(null);
        }}
        patient={selectedPatientForView}
        onSavePatient={(updatedPatient) => {
          if (onUpdatePatient) {
            onUpdatePatient(updatedPatient);
          }
          // Update local state copy to immediately reflect edited values
          setSelectedPatientForView(updatedPatient);
        }}
        appointments={appointments}
        representatives={representatives}
      />
    </div>
  );
}
