import React from 'react';
import { Plus, Shield, ShieldCheck } from 'lucide-react';
import { QuarterConfig } from '../types';

interface HeaderProps {
  quarters: QuarterConfig[];
  currentQuarterId: string;
  onQuarterChange: (quarterId: string) => void;
  onOpenNewRequest: () => void;
  onOpenCategoryGuide: () => void;
  onOpenQuarterSettings: () => void;
  onResetData?: () => void;
  activeTab: 'table' | 'calendar';
  setActiveTab: (tab: 'table' | 'calendar') => void;
  isFirebaseConnected?: boolean;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  quarters,
  currentQuarterId,
  onOpenNewRequest,
  onOpenCategoryGuide,
  onOpenQuarterSettings,
  activeTab,
  setActiveTab,
  isAdmin,
  onToggleAdmin,
}) => {
  const currentQuarter = quarters.find((q) => q.id === currentQuarterId);
  const quarterCode = currentQuarter?.id || '2027-Q1';

  return (
    <header className="sticky top-0 z-30 bg-[#F4EEE2]/95 backdrop-blur-md border-b border-[#181715]/12">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Zone 1: Brand Wordmark + Vermilion Risograph Dot */}
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className="inline-flex items-center gap-2 text-left group cursor-pointer focus-visible:outline-none whitespace-nowrap shrink-0"
          >
            <span className="text-[15px] font-extrabold tracking-tight text-[#181715]">
              업무 배정표
            </span>
            <span
              className="w-2 h-2 rounded-full bg-[#E94B22] inline-block transition-transform duration-150 group-hover:scale-125"
              aria-hidden="true"
            />
          </button>

          {/* Zone 2: Spaced Editorial Navigation Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="주요 메뉴">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`relative py-1 text-[12px] tracking-[0.06em] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none ${
                activeTab === 'table'
                  ? 'font-bold text-[#181715] after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-[#E94B22]'
                  : 'font-medium text-[#5F5A52] hover:text-[#181715]'
              }`}
            >
              접수 목록
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`relative py-1 text-[12px] tracking-[0.06em] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none ${
                  activeTab === 'calendar'
                    ? 'font-bold text-[#181715] after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-[#E94B22]'
                    : 'font-medium text-[#5F5A52] hover:text-[#181715]'
                }`}
                title="관리자 전용: 달력 업무 배정"
              >
                일정 달력
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCategoryGuide}
              className="py-1 text-[12px] tracking-[0.06em] font-medium text-[#5F5A52] hover:text-[#181715] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none"
              title="대·소분류별 소요일 산정 기준표 열람"
            >
              소요일 기준표
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={onOpenQuarterSettings}
                className="py-1 text-[12px] tracking-[0.06em] font-semibold text-[#E94B22] hover:text-[#c73c17] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none"
                title="분기 총 가용일수 산출 및 설정"
              >
                가용일수 설정
              </button>
            )}
          </nav>

          {/* Zone 3: Quarter Monospace Marker, Admin Toggle, Primary Action */}
          <div className="flex items-center gap-3.5 shrink-0">
            <span className="hidden lg:inline font-mono text-[11px] font-semibold tracking-wider text-[#5F5A52] tabular-nums">
              <span className="text-[#E94B22] mr-1.5">{quarterCode}</span>
              1분기
            </span>

            <button
              type="button"
              onClick={onToggleAdmin}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-[3px] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none ${
                isAdmin
                  ? 'bg-[#E94B22] text-white'
                  : 'text-[#5F5A52] hover:text-[#181715] hover:bg-[#181715]/6 border border-[#181715]/15'
              }`}
              title={
                isAdmin
                  ? '관리자 모드 끄기 (일반 사용자 모드로 전환)'
                  : '관리자 모드로 전환 (일정 배정, 삭제, 소요일 수정 가능)'
              }
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>관리자 ON</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>관리자모드</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenNewRequest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#EAE2D3] bg-[#181715] hover:bg-[#E94B22] hover:text-white rounded-[3px] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>신규 접수하기</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <nav
          className="flex md:hidden items-center gap-5 h-10 border-t border-[#181715]/10 overflow-x-auto text-xs"
          aria-label="모바일 메뉴"
        >
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`relative h-full inline-flex items-center whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'table'
                ? 'font-bold text-[#181715] after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-[#E94B22]'
                : 'font-medium text-[#5F5A52]'
            }`}
          >
            접수 목록
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`relative h-full inline-flex items-center whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'font-bold text-[#181715] after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-[#E94B22]'
                  : 'font-medium text-[#5F5A52]'
              }`}
            >
              일정 달력
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCategoryGuide}
            className="h-full inline-flex items-center font-medium text-[#5F5A52] whitespace-nowrap shrink-0 cursor-pointer"
          >
            소요일 기준표
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={onOpenQuarterSettings}
              className="h-full inline-flex items-center font-semibold text-[#E94B22] whitespace-nowrap shrink-0 cursor-pointer"
            >
              가용일수 설정
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
