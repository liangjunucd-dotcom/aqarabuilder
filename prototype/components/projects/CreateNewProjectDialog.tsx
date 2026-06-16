'use client';

import { useState, type ReactNode } from 'react';
import { Building2, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BuildingType, Project } from '@/lib/mock/projects';

type ProjectTypeOption = {
  value: BuildingType;
  label: string;
  icon: ReactNode;
};

type CountryOption = {
  code: string;
  continent: string;
  label: string;
  phonePrefix: string;
  flag: string;
};

const PROJECT_TYPES: ProjectTypeOption[] = [
  { value: 'office', label: 'Office', icon: <Building2 size={20} /> },
  { value: 'apartment', label: 'Apartment', icon: <Building2 size={20} /> },
  { value: 'villa', label: 'Villa', icon: <Building2 size={20} /> },
  { value: 'hotel', label: 'Hotel', icon: <Building2 size={20} /> },
  { value: 'store', label: 'Retail', icon: <Building2 size={20} /> },
  { value: 'school', label: 'Education', icon: <Building2 size={20} /> },
  { value: 'other', label: 'Other', icon: <Building2 size={20} /> },
];

const COUNTRIES: CountryOption[] = [
  { code: 'ca', continent: 'North America', label: 'Canada', phonePrefix: '+1', flag: '🇨🇦' },
  { code: 'cn', continent: 'Asia', label: 'China', phonePrefix: '+86', flag: '🇨🇳' },
  { code: 'sg', continent: 'Asia', label: 'Singapore', phonePrefix: '+65', flag: '🇸🇬' },
  { code: 'jp', continent: 'Asia', label: 'Japan', phonePrefix: '+81', flag: '🇯🇵' },
  { code: 'kr', continent: 'Asia', label: 'Korea', phonePrefix: '+82', flag: '🇰🇷' },
  { code: 'gb', continent: 'Europe', label: 'United Kingdom', phonePrefix: '+44', flag: '🇬🇧' },
  { code: 'de', continent: 'Europe', label: 'Germany', phonePrefix: '+49', flag: '🇩🇪' },
  { code: 'fr', continent: 'Europe', label: 'France', phonePrefix: '+33', flag: '🇫🇷' },
  { code: 'it', continent: 'Europe', label: 'Italy', phonePrefix: '+39', flag: '🇮🇹' },
  { code: 'us', continent: 'North America', label: 'United States', phonePrefix: '+1', flag: '🇺🇸' },
  { code: 'au', continent: 'Oceania', label: 'Australia', phonePrefix: '+61', flag: '🇦🇺' },
  { code: 'ae', continent: 'Asia', label: 'United Arab Emirates', phonePrefix: '+971', flag: '🇦🇪' },
];

export type CreateNewProjectPayload = {
  name: string;
  projectTypeLabel: string;
  country?: string;
  countryLabel?: string;
  buildingType: BuildingType;
  addressRegion: string;
  addressDetail: string;
  contactName: string;
  contactPhone: string;
  backgroundDescription: string;
  linkedSolutionId?: string;
};

export function CreateNewProjectDialog({
  onCancel,
  onCreate,
  title = 'Create New Project',
  showCountry = true,
}: {
  onCancel: () => void;
  onCreate: (payload: CreateNewProjectPayload) => void;
  linkedSolutions?: Project[];
  title?: string;
  showCountry?: boolean;
}) {
  const [name, setName] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [country, setCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [selectedType, setSelectedType] = useState<ProjectTypeOption>(PROJECT_TYPES[0]);

  const submit = () => {
    const projectName = name.trim() || 'Untitled Project';
    onCreate({
      name: projectName,
      projectTypeLabel: selectedType.label,
      country: showCountry ? country.code : undefined,
      countryLabel: showCountry ? country.label : undefined,
      buildingType: selectedType.value,
      addressRegion: `${country.continent} > ${country.label}`,
      addressDetail: `${country.label} ${selectedType.label}`,
      contactName: 'Project Owner',
      contactPhone: `${country.phonePrefix} -`,
      backgroundDescription: `${selectedType.label} solution created from Builder.`,
      linkedSolutionId: undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[1px]">
      <section className="max-h-[86vh] w-full max-w-[500px] overflow-y-auto rounded-2xl bg-white px-5 pb-5 pt-5 text-slate-900 shadow-2xl shadow-slate-950/20 sm:px-6 sm:pb-6 sm:pt-6">
        <header className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight text-slate-900 sm:text-xl">{title}</h2>
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" title="Close">
            <X size={20} strokeWidth={1.8} />
          </button>
        </header>

        <div className="space-y-4 sm:space-y-5">
          <ModalField label="Project Name">
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              autoFocus
              className="h-11 w-full rounded-lg border-0 bg-[#f5f5f7] px-3.5 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-200 sm:h-12 sm:px-4"
            />
          </ModalField>

          {showCountry ? (
            <ModalField label="Country">
              <LargePicker
                open={countryOpen}
                onToggle={() => {
                  setCountryOpen(value => !value);
                  setTypeOpen(false);
                }}
                value={(
                  <>
                    <span className="text-[30px] leading-none">{country.flag}</span>
                    <span>{country.label}</span>
                  </>
                )}
              >
                {COUNTRIES.map(item => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setCountry(item);
                      setCountryOpen(false);
                    }}
                  className={cn(
                      'flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm transition hover:bg-slate-50',
                      item.code === country.code ? 'bg-slate-50 font-semibold text-slate-950' : 'text-slate-600'
                    )}
                  >
                    <span className="text-xl">{item.flag}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </LargePicker>
            </ModalField>
          ) : null}

          <ModalField label="Building Type">
            <LargePicker
              open={typeOpen}
              onToggle={() => {
                setTypeOpen(value => !value);
                setCountryOpen(false);
              }}
              value={(
                <>
                  <span className="text-slate-400">{selectedType.icon}</span>
                  <span>{selectedType.label}</span>
                </>
              )}
            >
              {PROJECT_TYPES.map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSelectedType(item);
                    setTypeOpen(false);
                  }}
                  className={cn(
                    'flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm transition hover:bg-slate-50',
                    item.label === selectedType.label ? 'bg-slate-50 font-semibold text-slate-950' : 'text-slate-600'
                  )}
                >
                  <span className="text-slate-400">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </LargePicker>
          </ModalField>
        </div>

        <footer className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="h-10 px-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
            Cancel
          </button>
          <button onClick={submit} className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700">
            Create
          </button>
        </footer>
      </section>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function LargePicker({
  open,
  value,
  children,
  onToggle,
}: {
  open: boolean;
  value: ReactNode;
  children: ReactNode;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex h-11 w-full items-center gap-2.5 rounded-lg bg-[#f5f5f7] px-3.5 text-left text-base font-medium text-slate-600 outline-none transition sm:h-12 sm:px-4',
          open ? 'bg-white ring-2 ring-blue-200' : 'hover:bg-slate-100'
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5 truncate">{value}</span>
        <ChevronDown size={18} className={cn('shrink-0 text-slate-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-[48px] z-20 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10 sm:top-[52px]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
