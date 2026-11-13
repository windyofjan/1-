import React, { useRef, useEffect } from 'react';
import { ArrowRight, Calculator, Calendar, List, ShieldOff } from 'lucide-react';
import { CapacitySummary } from '../types';

interface CapacityDashboardProps {
  summary: CapacitySummary;
  onOpenQuarterSettings: () => void;
  onOpenCategoryGuide: () => void;
  onOpenCalendar?: () => void;
  onOpenTable?: () => void;
  onToggleAdmin: () => void;
  activeTab?: 'table' | 'calendar';
  isAdmin?: boolean;
}

export const CapacityDashboard: React.FC<CapacityDashboardProps> = ({
  summary,
  onOpenQuarterSettings,
  onOpenCategoryGuide,
  onOpenCalendar,
  onOpenTable,
  onToggleAdmin,
  activeTab = 'table',
  isAdmin = false,
}) => {
  const isOverCapacity = summary.totalOverCapacityDays > 0 || summary.overCapacityCount > 0;

  const totalDays = Math.max(1, Math.round(summary.totalDays));
  const allocatedDays = Math.round(summary.allocatedDays);
  const remainingDays = Math.round(summary.remainingDays);
  const markerPercent = Math.min(100, Math.max(0, Math.round((allocatedDays / totalDays) * 100)));

  // Triple-click counter on the blue card (Card 1) to open/toggle Admin Mode
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const handleBlueCardClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      onToggleAdmin();
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);
  };

  return (
    <section className="space-y-10 pt-2">
      {/* 1. Asymmetric Editorial Hero Top Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end">
        <div className="lg:col-span-8">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] xl:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.1] text-[#181715] lg:whitespace-nowrap">
            {summary.quarter.name.replace(/\s*\(.*?\)/, '')} 영상 제작 분기 접수 신청
          </h1>
        </div>

        <div className="lg:col-span-4 flex flex-col lg:items-end justify-end gap-3 lg:pb-0.5">
          <div className="lg:text-right">
            <div className="text-4xl sm:text-5xl lg:text-[48px] xl:text-[52px] font-extrabold tracking-[-0.03em] leading-none tabular-nums text-[#181715]">
              {remainingDays < 0 ? (
                <>
                  <span>초과 </span>
                  <span className="text-[#E94B22]">{Math.abs(remainingDays)}일</span>
                </>
              ) : (
                <>
                  <span>잔여 </span>
                  <span className="text-[#E94B22]">{remainingDays}일</span>
                </>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3.5 flex-wrap pt-1">
              {activeTab === 'calendar' && onOpenTable ? (
                <button
                  type="button"
                  onClick={onOpenTable}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#181715] hover:text-[#E94B22] transition-colors cursor-pointer"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>접수 목록</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                onOpenCalendar && (
                  <button
                    type="button"
                    onClick={onOpenCalendar}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#181715] hover:text-[#5A92BF] transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>달력 배정</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )
              )}

              <button
                type="button"
                onClick={onOpenQuarterSettings}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#181715] hover:text-[#E94B22] transition-colors cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>산출 틀 계산</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={onToggleAdmin}
                className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#E94B22] hover:text-[#c73c17] transition-colors cursor-pointer"
              >
                <ShieldOff className="w-3.5 h-3.5" />
                <span>관리자 종료</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. 4-Column Risograph Graphic Card Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
        {/* Card 1: 총 제작 가능 일수 (파란색 카드 - 3번 클릭 시 관리자모드 접속) */}
        <article className="flex flex-col">
          <div
            onClick={handleBlueCardClick}
            className="relative aspect-[5/4] bg-[#689EC9] overflow-hidden p-5 flex flex-col justify-between select-none"
          >
            <div className="absolute inset-0 riso-grain opacity-30 pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
              <h2 className="text-[15px] font-extrabold italic text-white tracking-tight">
                총 제작 가능 일수
              </h2>
              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenQuarterSettings();
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 bg-[#181715] text-[#F7F3EA] hover:bg-[#E94B22] transition-colors cursor-pointer"
                >
                  설정
                </button>
              )}
            </div>

            <svg
              viewBox="0 0 160 90"
              className="relative z-10 w-full h-24 my-auto"
              aria-hidden="true"
            >
              <rect x="26" y="10" width="108" height="70" fill="#F7F3EA" />
              <rect x="34" y="18" width="92" height="12" fill="#181715" />
              <rect x="34" y="36" width="26" height="16" fill="#E94B22" />
              <rect x="67" y="36" width="26" height="16" fill="#689EC9" />
              <rect x="100" y="36" width="26" height="16" fill="#181715" opacity="0.2" />
              <rect x="34" y="58" width="42" height="14" fill="#181715" opacity="0.18" />
              <rect x="82" y="58" width="44" height="14" fill="#181715" />
            </svg>

            <div className="relative z-10 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono tabular-nums tracking-tight text-[#181715]">
                {Math.round(summary.totalDays)}
                <span className="text-sm font-bold ml-0.5">일</span>
              </span>
            </div>
          </div>
        </article>

        {/* Card 2: 누적 신청 일수 */}
        <article className="flex flex-col">
          <div className="relative aspect-[5/4] bg-[#B0A862] overflow-hidden p-5 flex flex-col justify-between">
            <div className="absolute inset-0 riso-grain opacity-30 pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
              <h2 className="text-[15px] font-extrabold italic text-white tracking-tight">
                누적 신청 일수
              </h2>
              <span className="font-mono text-[11px] font-bold text-white">
                {summary.totalRequestsCount}건
              </span>
            </div>

            <svg
              viewBox="0 0 160 90"
              className="relative z-10 w-full h-24 my-auto"
              aria-hidden="true"
            >
              <polygon points="32,26 128,12 130,24 34,38" fill="#181715" />
              <polygon points="48,24 62,22 58,34 44,36" fill="#F7F3EA" />
              <polygon points="78,19 92,17 88,30 74,32" fill="#F7F3EA" />
              <polygon points="108,15 122,13 118,26 104,28" fill="#F7F3EA" />
              <rect x="32" y="34" width="96" height="44" fill="#F7F3EA" />
              <rect x="42" y="44" width="46" height="8" fill="#E94B22" />
              <rect x="42" y="58" width="76" height="8" fill="#181715" opacity="0.22" />
            </svg>

            <div className="relative z-10 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono tabular-nums tracking-tight text-[#181715]">
                {allocatedDays}
                <span className="text-sm font-bold ml-0.5">일</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-[#181715]">
                {summary.utilizationRate}%
              </span>
            </div>
          </div>
        </article>

        {/* Card 3: 한도 초과 접수 */}
        <article className="flex flex-col">
          <div
            className={`relative aspect-[5/4] overflow-hidden p-5 flex flex-col justify-between ${
              isOverCapacity ? 'bg-[#EC5B34]' : 'bg-[#8E867B]'
            }`}
          >
            <div className="absolute inset-0 riso-grain opacity-30 pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
              <h2 className="text-[15px] font-extrabold italic text-white tracking-tight">
                한도 초과 접수
              </h2>
              {summary.totalOverCapacityDays > 0 && (
                <span className="font-mono text-[11px] font-bold text-[#181715] bg-[#F7F3EA] px-1.5 py-0.5">
                  +{Math.round(summary.totalOverCapacityDays)}일
                </span>
              )}
            </div>

            <svg
              viewBox="0 0 160 90"
              className="relative z-10 w-full h-24 my-auto"
              aria-hidden="true"
            >
              <path d="M52 24 L62 14 L72 20 Z" fill="#181715" />
              <path d="M108 24 L98 14 L88 20 Z" fill="#181715" />
              <circle cx="80" cy="48" r="26" fill="#F7F3EA" />
              <circle cx="80" cy="48" r="20" fill="none" stroke="#181715" strokeWidth="3" />
              <line x1="80" y1="48" x2="80" y2="34" stroke="#181715" strokeWidth="3.5" strokeLinecap="square" />
              <line x1="80" y1="48" x2="92" y2="52" stroke="#E94B22" strokeWidth="3.5" strokeLinecap="square" />
              <rect x="63" y="72" width="6" height="8" fill="#181715" />
              <rect x="91" y="72" width="6" height="8" fill="#181715" />
            </svg>

            <div className="relative z-10 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono tabular-nums tracking-tight text-[#181715]">
                {summary.overCapacityCount}
                <span className="text-sm font-bold ml-0.5">건</span>
              </span>
            </div>
          </div>
        </article>

        {/* Card 4: 소요일 기준표 */}
        <article className="flex flex-col">
          <button
            type="button"
            onClick={onOpenCategoryGuide}
            className="w-full text-left group cursor-pointer focus-visible:outline-none"
          >
            <div className="relative aspect-[5/4] bg-[#DE88CE] overflow-hidden p-5 flex flex-col justify-between transition-transform duration-150 group-hover:-translate-y-0.5">
              <div className="absolute inset-0 riso-grain opacity-30 pointer-events-none" />
              <div className="relative z-10 flex items-start justify-between">
                <h2 className="text-[15px] font-extrabold italic text-white tracking-tight">
                  소요일 기준표
                </h2>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#181715] text-[#F7F3EA] group-hover:bg-[#E94B22] transition-colors">
                  열람 ↗
                </span>
              </div>

              <svg
                viewBox="0 0 160 90"
                className="relative z-10 w-full h-28 my-auto"
                aria-hidden="true"
              >
                <rect x="24" y="14" width="54" height="62" fill="#F7F3EA" />
                <rect x="82" y="14" width="54" height="62" fill="#F7F3EA" />
                <rect x="78" y="14" width="4" height="62" fill="#181715" />
                <rect x="32" y="23" width="38" height="6" fill="#181715" />
                <rect x="32" y="35" width="28" height="5" fill="#689EC9" />
                <rect x="32" y="46" width="34" height="5" fill="#181715" opacity="0.22" />
                <rect x="32" y="57" width="24" height="5" fill="#E94B22" />
                <polygon points="118,14 128,14 128,34 123,29 118,34" fill="#E94B22" />
                <rect x="90" y="23" width="22" height="6" fill="#181715" opacity="0.25" />
                <rect x="90" y="38" width="16" height="12" fill="#B0A862" />
                <rect x="110" y="38" width="18" height="12" fill="#181715" />
                <rect x="90" y="55" width="38" height="11" fill="#181715" opacity="0.18" />
              </svg>
            </div>
          </button>
        </article>
      </div>

      {/* 3. Editorial Timeline Progress Rail */}
      <div className="pt-2">
        <div className="relative h-6 flex items-center">
          <div className="w-full h-px bg-[#181715]/20 relative">
            <div
              style={{ width: `${markerPercent}%` }}
              className="h-[2px] -top-[0.5px] bg-[#E94B22] absolute left-0 transition-all duration-300"
            />
            {[0, 25, 50, 75, 100].map((tick) => (
              <span
                key={tick}
                style={{ left: `${tick}%` }}
                className="absolute -top-[3px] w-px h-[7px] bg-[#181715]/30 -translate-x-1/2"
              />
            ))}
            <span
              style={{ left: `${markerPercent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#E94B22] ring-2 ring-[#F4EEE2] transition-all duration-300"
              title={`소진율 ${summary.utilizationRate}%`}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] text-[#5F5A52] pt-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums">
            <span className="text-[#E94B22] font-bold">0일</span>
            <span>·</span>
            <span>정상 배정 {Math.round(Math.min(allocatedDays, totalDays))}일</span>
            <span>·</span>
            <span>기준 한도 {totalDays}일</span>
            {summary.totalOverCapacityDays > 0 && (
              <>
                <span>·</span>
                <span className="text-[#E94B22] font-bold">
                  초과 배정 +{Math.round(summary.totalOverCapacityDays)}일
                </span>
              </>
            )}
          </div>
          <div className="tabular-nums text-[#5F5A52]">
            Utilization {summary.utilizationRate}% · {summary.totalRequestsCount} Requests
          </div>
        </div>
      </div>
    </section>
  );
};
