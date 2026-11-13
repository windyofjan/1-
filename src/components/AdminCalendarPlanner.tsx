import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  GripVertical,
  AlertTriangle,
  CheckCircle2,
  User,
  X,
  Trash2,
  Filter,
  Calculator,
} from 'lucide-react';
import { VideoRequest, MajorCategory } from '../types';
import {
  CalendarDay,
  getMonthGrid,
  calculateWorkingDaysEndDate,
  isDateInRange,
} from '../utils/calendar';
import { sortRequestsByRegistrationOrder } from '../utils/storage';

export const PRODUCER_LIST = ['민규', '신혜', '유진', '승아', '외주'] as const;
export type ProducerName = typeof PRODUCER_LIST[number];

export interface ProducerTheme {
  name: string;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  calendarClass: string;
  buttonClass: string;
  activeButtonClass: string;
  dotColor: string;
  borderClass: string;
  lightBg: string;
}

export const PRODUCER_THEMES: Record<string, ProducerTheme> = {
  민규: {
    name: '민규',
    colorName: '파란색',
    badgeBg: 'bg-[#5A92BF]/18 text-[#181715] border-[#5A92BF]/50',
    badgeText: 'text-[#31638B]',
    calendarClass: 'bg-[#5A92BF] text-white hover:bg-[#497ca6] border border-[#497ca6]',
    buttonClass: 'bg-[#5A92BF]/12 text-[#181715] border-[#5A92BF]/40 hover:bg-[#5A92BF]/22',
    activeButtonClass: 'bg-[#5A92BF] text-white border-[#5A92BF] font-bold',
    dotColor: 'bg-[#5A92BF]',
    borderClass: 'border-l-4 border-l-[#5A92BF]',
    lightBg: 'bg-[#5A92BF]/10',
  },
  신혜: {
    name: '신혜',
    colorName: '초록색',
    badgeBg: 'bg-[#4F8A6B]/18 text-[#181715] border-[#4F8A6B]/50',
    badgeText: 'text-[#316349]',
    calendarClass: 'bg-[#4F8A6B] text-white hover:bg-[#3e7257] border border-[#3e7257]',
    buttonClass: 'bg-[#4F8A6B]/12 text-[#181715] border-[#4F8A6B]/40 hover:bg-[#4F8A6B]/22',
    activeButtonClass: 'bg-[#4F8A6B] text-white border-[#4F8A6B] font-bold',
    dotColor: 'bg-[#4F8A6B]',
    borderClass: 'border-l-4 border-l-[#4F8A6B]',
    lightBg: 'bg-[#4F8A6B]/10',
  },
  유진: {
    name: '유진',
    colorName: '보라색',
    badgeBg: 'bg-[#D87AC6]/20 text-[#181715] border-[#D87AC6]/55',
    badgeText: 'text-[#873877]',
    calendarClass: 'bg-[#D87AC6] text-white hover:bg-[#c263b0] border border-[#c263b0]',
    buttonClass: 'bg-[#D87AC6]/14 text-[#181715] border-[#D87AC6]/45 hover:bg-[#D87AC6]/24',
    activeButtonClass: 'bg-[#D87AC6] text-white border-[#D87AC6] font-bold',
    dotColor: 'bg-[#D87AC6]',
    borderClass: 'border-l-4 border-l-[#D87AC6]',
    lightBg: 'bg-[#D87AC6]/10',
  },
  승아: {
    name: '승아',
    colorName: '주황색',
    badgeBg: 'bg-[#A39B53]/22 text-[#181715] border-[#A39B53]/55',
    badgeText: 'text-[#66602A]',
    calendarClass: 'bg-[#A39B53] text-white hover:bg-[#8d8642] border border-[#8d8642]',
    buttonClass: 'bg-[#A39B53]/14 text-[#181715] border-[#A39B53]/45 hover:bg-[#A39B53]/24',
    activeButtonClass: 'bg-[#A39B53] text-white border-[#A39B53] font-bold',
    dotColor: 'bg-[#A39B53]',
    borderClass: 'border-l-4 border-l-[#A39B53]',
    lightBg: 'bg-[#A39B53]/10',
  },
  외주: {
    name: '외주',
    colorName: '차콜회색',
    badgeBg: 'bg-[#181715]/14 text-[#181715] border-[#181715]/35',
    badgeText: 'text-[#181715]',
    calendarClass: 'bg-[#181715] text-[#EAE2D3] hover:bg-[#2d2b28] border border-[#181715]',
    buttonClass: 'bg-[#181715]/10 text-[#181715] border-[#181715]/30 hover:bg-[#181715]/18',
    activeButtonClass: 'bg-[#181715] text-[#EAE2D3] border-[#181715] font-bold',
    dotColor: 'bg-[#181715]',
    borderClass: 'border-l-4 border-l-[#181715]',
    lightBg: 'bg-[#181715]/8',
  },
};

export function getProducerTheme(producer?: string, isOverCapacity?: boolean): ProducerTheme {
  const trimmed = producer?.trim();
  if (trimmed && PRODUCER_THEMES[trimmed]) {
    return PRODUCER_THEMES[trimmed];
  }
  if (trimmed) {
    for (const key of PRODUCER_LIST) {
      if (trimmed.includes(key)) {
        return PRODUCER_THEMES[key];
      }
    }
  }
  if (isOverCapacity) {
    return {
      name: trimmed || '초과접수',
      colorName: '붉은색',
      badgeBg: 'bg-[#E94B22]/15 text-[#181715] border-[#E94B22]/45',
      badgeText: 'text-[#E94B22]',
      calendarClass: 'bg-[#E94B22] text-white hover:bg-[#c73c17] border border-[#c73c17]',
      buttonClass: 'bg-[#E94B22]/10 text-[#E94B22] border-[#E94B22]/40 hover:bg-[#E94B22]/20',
      activeButtonClass: 'bg-[#E94B22] text-white border-[#E94B22] font-bold',
      dotColor: 'bg-[#E94B22]',
      borderClass: 'border-l-4 border-l-[#E94B22]',
      lightBg: 'bg-[#E94B22]/10',
    };
  }
  return {
    name: trimmed || '미지정',
    colorName: '다크그레이',
    badgeBg: 'bg-[#EAE2D3] text-[#5F5A52] border-[#181715]/20',
    badgeText: 'text-[#5F5A52]',
    calendarClass: 'bg-[#5F5A52] text-white hover:bg-[#49453e] border border-[#49453e]',
    buttonClass: 'bg-[#EAE2D3] text-[#5F5A52] border-[#181715]/20 hover:bg-[#181715]/10',
    activeButtonClass: 'bg-[#181715] text-[#EAE2D3] border-[#181715] font-bold',
    dotColor: 'bg-[#5F5A52]',
    borderClass: 'border-l-4 border-l-[#5F5A52]/50',
    lightBg: 'bg-[#EAE2D3]/60',
  };
}

interface AdminCalendarPlannerProps {
  requests: VideoRequest[];
  categories: MajorCategory[];
  onAssignRequestDate: (requestId: string, startDate: string, endDate: string, producer?: string) => void;
  onUnassignRequest: (requestId: string) => void;
  onUpdateProducer: (requestId: string, producer: string) => void;
  onSelectRequestDetails?: (request: VideoRequest) => void;
  onOpenQuarterSettings?: () => void;
}

export const AdminCalendarPlanner: React.FC<AdminCalendarPlannerProps> = ({
  requests,
  onAssignRequestDate,
  onUnassignRequest,
  onUpdateProducer,
  onOpenQuarterSettings,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [draggedRequestId, setDraggedRequestId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [filterTray, setFilterTray] = useState<'unassigned' | 'assigned' | 'all'>('unassigned');
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<VideoRequest | null>(null);
  const [quickAssignDate, setQuickAssignDate] = useState<string>('2027-01-04');
  const [quickAssignProducer, setQuickAssignProducer] = useState<string>('');
  const [selectedProducerFilter, setSelectedProducerFilter] = useState<string>('all');

  const janGrid = useMemo(() => getMonthGrid(2027, 1), []);
  const febGrid = useMemo(() => getMonthGrid(2027, 2), []);
  const marGrid = useMemo(() => getMonthGrid(2027, 3), []);

  const monthsToDisplay = useMemo(() => {
    if (selectedMonth === 1) return [{ month: 1, name: '2027년 1월', grid: janGrid }];
    if (selectedMonth === 2) return [{ month: 2, name: '2027년 2월', grid: febGrid }];
    if (selectedMonth === 3) return [{ month: 3, name: '2027년 3월', grid: marGrid }];
    return [
      { month: 1, name: '2027년 1월', grid: janGrid },
      { month: 2, name: '2027년 2월', grid: febGrid },
      { month: 3, name: '2027년 3월', grid: marGrid },
    ];
  }, [selectedMonth, janGrid, febGrid, marGrid]);

  const unassignedRequests = requests.filter((r) => !r.assignedStartDate);
  const assignedRequests = requests.filter((r) => !!r.assignedStartDate);

  const displayedTrayRequests = useMemo(() => {
    let list = requests;
    if (filterTray === 'unassigned') list = unassignedRequests;
    else if (filterTray === 'assigned') list = assignedRequests;

    if (selectedProducerFilter !== 'all') {
      if (selectedProducerFilter === 'unassigned') {
        list = list.filter((r) => !r.assignedProducer);
      } else {
        list = list.filter((r) => r.assignedProducer?.includes(selectedProducerFilter));
      }
    }
    return sortRequestsByRegistrationOrder(list, 'asc');
  }, [filterTray, unassignedRequests, assignedRequests, requests, selectedProducerFilter]);

  const producerStats = useMemo(() => {
    const counts: Record<string, { total: number; assigned: number; days: number }> = {
      민규: { total: 0, assigned: 0, days: 0 },
      신혜: { total: 0, assigned: 0, days: 0 },
      유진: { total: 0, assigned: 0, days: 0 },
      승아: { total: 0, assigned: 0, days: 0 },
      외주: { total: 0, assigned: 0, days: 0 },
      미지정: { total: 0, assigned: 0, days: 0 },
    };

    requests.forEach((req) => {
      const p = req.assignedProducer?.trim();
      let matched = '미지정';
      for (const name of PRODUCER_LIST) {
        if (p && p.includes(name)) {
          matched = name;
          break;
        }
      }
      counts[matched].total += 1;
      counts[matched].days += Math.round(req.requiredDays);
      if (req.assignedStartDate) {
        counts[matched].assigned += 1;
      }
    });

    return counts;
  }, [requests]);

  const handleDragStart = (e: React.DragEvent, reqId: string) => {
    setDraggedRequestId(reqId);
    e.dataTransfer.setData('text/plain', reqId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const reqId = e.dataTransfer.getData('text/plain') || draggedRequestId;
    if (!reqId) return;

    const req = requests.find((r) => r.id === reqId);
    if (!req) return;

    const endDate = calculateWorkingDaysEndDate(targetDateStr, Math.round(req.requiredDays));
    onAssignRequestDate(req.id, targetDateStr, endDate, req.assignedProducer);
    setDraggedRequestId(null);
  };

  const getRequestsForDate = (dateStr: string) => {
    return assignedRequests.filter((r) => {
      const inRange = isDateInRange(dateStr, r.assignedStartDate, r.assignedEndDate);
      if (!inRange) return false;
      if (selectedProducerFilter === 'all') return true;
      if (selectedProducerFilter === 'unassigned') return !r.assignedProducer;
      return r.assignedProducer?.includes(selectedProducerFilter);
    });
  };

  return (
    <div className="space-y-6 text-[#181715]">
      {/* Admin Top Header & Filter Panel */}
      <div className="bg-[#FAF7F0] rounded-[4px] border border-[#181715]/20 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#181715]/15">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-[2px] bg-[#181715] text-[#EAE2D3]">
                2027-Q1
              </span>
              <h2 className="text-lg font-extrabold tracking-tight text-[#181715]">
                2027년 1분기 업무 배정 일정표 (달력 관리)
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {onOpenQuarterSettings && (
              <button
                type="button"
                onClick={onOpenQuarterSettings}
                className="px-3 py-1.5 rounded-[3px] bg-[#E94B22] hover:bg-[#c73c17] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="워킹데이*4.5 및 인원별 행정업무/휴가 차감 계산기"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>제작 가능 일수 산출 틀</span>
              </button>
            )}

            <div className="flex items-center gap-1 p-1 bg-[#EAE2D3] border border-[#181715]/15 rounded-[3px] text-xs font-medium">
              {[
                { val: 0, label: '1분기 전체 (1~3월)' },
                { val: 1, label: '1월' },
                { val: 2, label: '2월' },
                { val: 3, label: '3월' },
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setSelectedMonth(m.val)}
                  className={`px-3 py-1.5 rounded-[2px] transition-colors whitespace-nowrap cursor-pointer ${
                    selectedMonth === m.val
                      ? 'bg-[#181715] text-[#EAE2D3] font-bold'
                      : 'text-[#5F5A52] hover:text-[#181715]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color Legend & Producer Filter Bar */}
        <div className="bg-[#EAE2D3]/65 rounded-[3px] p-3.5 border border-[#181715]/15">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#5F5A52]" />
              <span className="text-xs font-bold text-[#181715]">
                담당자별 일정 색상 및 필터:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedProducerFilter('all')}
                className={`px-2.5 py-1 rounded-[2px] text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedProducerFilter === 'all'
                    ? 'bg-[#181715] text-[#EAE2D3] border-[#181715] font-bold'
                    : 'bg-[#FCF9F3] text-[#5F5A52] border-[#181715]/20 hover:text-[#181715]'
                }`}
              >
                전체 보기 ({requests.length})
              </button>

              {PRODUCER_LIST.map((name) => {
                const pTheme = PRODUCER_THEMES[name];
                const isSelected = selectedProducerFilter === name;
                const shortColor =
                  name === '민규'
                    ? '파랑'
                    : name === '신혜'
                    ? '초록'
                    : name === '유진'
                    ? '보라'
                    : name === '승아'
                    ? '주황'
                    : '차콜';

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedProducerFilter(isSelected ? 'all' : name)}
                    className={`px-2.5 py-1 rounded-[2px] text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected ? pTheme.activeButtonClass : pTheme.buttonClass
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-[1px] ${pTheme.dotColor} shrink-0`} />
                    <span>
                      {name} ({shortColor})
                    </span>
                    <span className="font-mono text-[11px] opacity-80">
                      {producerStats[name].assigned}/{producerStats[name].total}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setSelectedProducerFilter(
                    selectedProducerFilter === 'unassigned' ? 'all' : 'unassigned'
                  )
                }
                className={`px-2.5 py-1 rounded-[2px] text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedProducerFilter === 'unassigned'
                    ? 'bg-[#181715] text-[#EAE2D3] border-[#181715] font-bold'
                    : 'bg-[#FCF9F3] text-[#5F5A52] border-[#181715]/20 hover:text-[#181715]'
                }`}
              >
                <span className="w-2 h-2 rounded-[1px] bg-[#5F5A52] shrink-0" />
                <span>미지정 ({producerStats['미지정'].total})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Scheduling Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#FCF9F3] rounded-[3px] border border-[#181715]/15">
            <span className="text-[11px] text-[#5F5A52] block">총 신청 업무</span>
            <span className="font-mono text-base font-extrabold text-[#181715]">
              {requests.length}건
            </span>
          </div>
          <div className="p-3 bg-[#5A92BF]/12 rounded-[3px] border border-[#5A92BF]/35">
            <span className="text-[11px] text-[#31638B] font-semibold block">달력 배정 완료</span>
            <span className="font-mono text-base font-extrabold text-[#181715]">
              {assignedRequests.length}건
            </span>
          </div>
          <div className="p-3 bg-[#A39B53]/14 rounded-[3px] border border-[#A39B53]/40">
            <span className="text-[11px] text-[#5E5824] font-semibold block">드래그 대기 (미배정)</span>
            <span className="font-mono text-base font-extrabold text-[#181715]">
              {unassignedRequests.length}건
            </span>
          </div>
          <div className="p-3 bg-[#E94B22]/12 rounded-[3px] border border-[#E94B22]/40">
            <span className="text-[11px] text-[#E94B22] block font-bold">초과 접수 건</span>
            <span className="font-mono text-base font-extrabold text-[#E94B22]">
              {requests.filter((r) => r.isOverCapacity).length}건
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Draggable Request Tray */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#FAF7F0] rounded-[4px] border border-[#181715]/20 overflow-hidden sticky top-20">
            <div className="p-4 border-b border-[#181715]/15 bg-[#EFE8DA] text-[#181715]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-[#E94B22]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider">
                    배정 대상 업무 목록
                  </h3>
                </div>
                <span className="text-[11px] bg-[#E94B22] text-white px-2 py-0.5 rounded-[2px] font-mono font-bold">
                  {displayedTrayRequests.length}건
                </span>
              </div>
              <p className="text-[11px] text-[#5F5A52] mt-1.5">
                담당자를 선택한 뒤 우측 달력의 원하는 날짜 칸으로 드래그하세요.
              </p>
            </div>

            {/* Tray Tabs */}
            <div className="p-2 border-b border-[#181715]/15 flex items-center gap-1 text-[11px] bg-[#EAE2D3] font-semibold">
              <button
                type="button"
                onClick={() => setFilterTray('unassigned')}
                className={`flex-1 py-1.5 rounded-[2px] text-center transition-colors cursor-pointer ${
                  filterTray === 'unassigned'
                    ? 'bg-[#181715] text-[#EAE2D3] font-bold'
                    : 'text-[#5F5A52] hover:text-[#181715]'
                }`}
              >
                미배정 ({unassignedRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTray('assigned')}
                className={`flex-1 py-1.5 rounded-[2px] text-center transition-colors cursor-pointer ${
                  filterTray === 'assigned'
                    ? 'bg-[#181715] text-[#EAE2D3] font-bold'
                    : 'text-[#5F5A52] hover:text-[#181715]'
                }`}
              >
                배정완료 ({assignedRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTray('all')}
                className={`flex-1 py-1.5 rounded-[2px] text-center transition-colors cursor-pointer ${
                  filterTray === 'all'
                    ? 'bg-[#181715] text-[#EAE2D3] font-bold'
                    : 'text-[#5F5A52] hover:text-[#181715]'
                }`}
              >
                전체 ({requests.length})
              </button>
            </div>

            {/* List of Draggable Cards */}
            <div className="p-3 max-h-[calc(100vh-280px)] overflow-y-auto space-y-3">
              {displayedTrayRequests.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#5F5A52]">
                  {filterTray === 'unassigned'
                    ? '해당 조건의 미배정 업무가 없습니다.'
                    : '해당 조건의 업무가 없습니다.'}
                </div>
              ) : (
                displayedTrayRequests.map((req) => {
                  const isAssigned = !!req.assignedStartDate;
                  const isOver = req.isOverCapacity;
                  const theme = getProducerTheme(req.assignedProducer, isOver);

                  return (
                    <div
                      key={req.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, req.id)}
                      className={`p-3 rounded-[3px] border text-xs transition-colors cursor-grab active:cursor-grabbing select-none group relative ${
                        theme.borderClass
                      } ${
                        isOver
                          ? 'bg-[#E94B22]/10 border-[#E94B22]/45 hover:border-[#E94B22]'
                          : isAssigned
                          ? 'bg-[#EAE2D3]/60 border-[#181715]/15'
                          : 'bg-[#FCF9F3] border-[#181715]/20 hover:border-[#181715]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-[#181715] bg-[#EAE2D3] px-1.5 py-0.5 rounded-[2px] border border-[#181715]/15">
                            {req.id}
                          </span>
                          {isOver && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#E94B22] text-white">
                              <AlertTriangle className="w-2.5 h-2.5 text-white shrink-0" />
                              <span>초과 접수</span>
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-[#5F5A52]">
                            {req.headquarters} · {req.team}
                          </span>
                        </div>

                        <span className="font-mono text-xs font-extrabold text-[#181715] bg-[#EAE2D3] px-1.5 py-0.5 rounded-[2px] border border-[#181715]/15">
                          {Math.round(req.requiredDays)}일
                        </span>
                      </div>

                      <div className="font-bold text-[#181715] line-clamp-2 leading-snug">
                        {req.taskName}
                      </div>

                      <div className="text-[11px] text-[#5F5A52] mt-1 flex items-center justify-between">
                        <span className="truncate max-w-[170px]">{req.subCategory}</span>
                        <span>신청: {req.requesterName}</span>
                      </div>

                      {/* Producer selector inside card */}
                      <div
                        className="mt-2.5 pt-2 border-t border-[#181715]/12 bg-[#EAE2D3]/50 p-2 rounded-[2px]"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] font-bold text-[#181715] flex items-center gap-1">
                            <User className="w-3 h-3 text-[#5F5A52]" />
                            <span>배정 담당자:</span>
                          </label>
                          {req.assignedProducer ? (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] border ${theme.badgeBg}`}
                            >
                              ✓ {req.assignedProducer}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#5F5A52]">(미지정)</span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {PRODUCER_LIST.map((name) => {
                            const isSelected = req.assignedProducer === name;
                            const pTheme = PRODUCER_THEMES[name];
                            return (
                              <button
                                key={name}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateProducer(req.id, isSelected ? '' : name);
                                }}
                                className={`px-1.5 py-0.5 rounded-[2px] text-[10px] border transition-colors cursor-pointer flex items-center gap-0.5 ${
                                  isSelected ? pTheme.activeButtonClass : pTheme.buttonClass
                                }`}
                                title={`${name} (${pTheme.colorName}) 담당자로 지정`}
                              >
                                {isSelected ? '✓ ' : ''}
                                <span>{name}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="담당자 이름 직접 입력..."
                            value={req.assignedProducer || ''}
                            onChange={(e) => onUpdateProducer(req.id, e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-[11px] px-2 py-1 bg-[#FCF9F3] border border-[#181715]/20 rounded-[2px] focus:border-[#181715] focus:bg-white focus:outline-none placeholder:text-[#8A8275]"
                          />
                          {req.assignedProducer && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateProducer(req.id, '');
                              }}
                              className="text-[10px] text-[#5F5A52] hover:text-[#E94B22] px-1 py-1 cursor-pointer"
                              title="담당자 초기화"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#181715]/10 flex items-center justify-between text-[10px]">
                        {isAssigned ? (
                          <div className="flex items-center justify-between w-full text-[#4F8A6B] font-mono font-bold">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#4F8A6B]" />
                              <span>
                                {req.assignedStartDate?.slice(5)} ~ {req.assignedEndDate?.slice(5)}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUnassignRequest(req.id);
                              }}
                              className="text-[#5F5A52] hover:text-[#E94B22] underline cursor-pointer"
                              title="배정 해제"
                            >
                              해제
                            </button>
                          </div>
                        ) : (
                          <div className="text-[#5F5A52] flex items-center gap-1 w-full justify-between">
                            <span className="text-[10px]">우측 달력으로 드래그</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTaskForModal(req);
                                setQuickAssignDate('2027-01-04');
                                setQuickAssignProducer(req.assignedProducer || '');
                              }}
                              className="text-[#181715] font-bold hover:text-[#E94B22] hover:underline cursor-pointer"
                            >
                              날짜 직접 지정 ↵
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: 2027 Calendar Grid Matrix */}
        <div className="lg:col-span-8 space-y-8">
          {monthsToDisplay.map(({ month, name, grid }) => (
            <div
              key={month}
              className="bg-[#FAF7F0] rounded-[4px] border border-[#181715]/20 overflow-hidden"
            >
              {/* Month Header Banner */}
              <div className="px-4 py-3.5 border-b border-[#181715]/15 bg-[#EFE8DA] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#E94B22]" />
                  <h3 className="text-sm font-extrabold text-[#181715]">{name}</h3>
                  <span className="font-mono text-[11px] text-[#5F5A52]">
                    (2027-Q1 SCHEDULE)
                  </span>
                </div>
                <div className="text-xs text-[#5F5A52] flex items-center gap-2">
                  {selectedProducerFilter !== 'all' && (
                    <span className="font-bold text-[#EAE2D3] bg-[#181715] px-2 py-0.5 rounded-[2px]">
                      '{selectedProducerFilter}' 필터 적용 중
                    </span>
                  )}
                  <span className="text-[11px]">드래그하여 날짜 칸에 드롭하세요</span>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-[#181715]/20 text-center font-mono text-[11px] font-bold bg-[#EAE2D3]/55 py-2">
                <span className="text-[#E94B22]">일 (SUN)</span>
                <span className="text-[#181715]">월 (MON)</span>
                <span className="text-[#181715]">화 (TUE)</span>
                <span className="text-[#181715]">수 (WED)</span>
                <span className="text-[#181715]">목 (THU)</span>
                <span className="text-[#181715]">금 (FRI)</span>
                <span className="text-[#5A92BF]">토 (SAT)</span>
              </div>

              {/* 7-column Calendar Days Grid */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#181715]/12">
                {grid.map((day: CalendarDay) => {
                  const isHovered = dragOverDate === day.dateStr;
                  const dayRequests = getRequestsForDate(day.dateStr);
                  const isSunday = day.dayOfWeek === 0;
                  const isSaturday = day.dayOfWeek === 6;

                  return (
                    <div
                      key={day.dateStr}
                      onDragOver={(e) => handleDragOver(e, day.dateStr)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day.dateStr)}
                      className={`min-h-[115px] p-1.5 transition-colors relative flex flex-col justify-between ${
                        !day.isCurrentMonth
                          ? 'bg-[#EAE2D3]/35 text-[#5F5A52]/40'
                          : day.holidayName || isSunday
                          ? 'bg-[#E94B22]/6'
                          : isSaturday
                          ? 'bg-[#5A92BF]/6'
                          : 'bg-[#FCF9F3]'
                      } ${isHovered ? 'ring-2 ring-inset ring-[#181715] bg-[#EAE2D3]' : ''}`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span
                          className={`font-mono font-bold px-1 ${
                            !day.isCurrentMonth
                              ? 'text-[#5F5A52]/35'
                              : isSunday || day.holidayName
                              ? 'text-[#E94B22]'
                              : isSaturday
                              ? 'text-[#5A92BF]'
                              : 'text-[#181715]'
                          }`}
                        >
                          {day.dayNumber}
                        </span>

                        {day.holidayName && (
                          <span className="text-[10px] font-bold text-[#E94B22] bg-[#E94B22]/12 px-1 py-0.5 rounded-[2px] truncate max-w-[65px]">
                            {day.holidayName}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 flex-1 overflow-hidden">
                        {dayRequests.map((req) => {
                          const isStart = req.assignedStartDate === day.dateStr;
                          const isEnd = req.assignedEndDate === day.dateStr;
                          const isOver = req.isOverCapacity;
                          const theme = getProducerTheme(req.assignedProducer, isOver);
                          const producerLabel = req.assignedProducer ? req.assignedProducer : '미지정';

                          return (
                            <div
                              key={req.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, req.id)}
                              onClick={() => {
                                setSelectedTaskForModal(req);
                                setQuickAssignDate(req.assignedStartDate || '2027-01-04');
                                setQuickAssignProducer(req.assignedProducer || '');
                              }}
                              className={`p-1 rounded-[2px] text-[11px] leading-tight truncate cursor-pointer transition-colors ${
                                theme.calendarClass
                              }`}
                              title={`[${producerLabel} 담당] ${req.taskName} (${Math.round(req.requiredDays)}일) - ${req.requesterName} [${req.assignedStartDate} ~ ${req.assignedEndDate}]`}
                            >
                              <div className="flex items-center gap-1 font-medium">
                                {isStart && <span className="font-bold text-[10px] opacity-90">▶</span>}
                                {isOver && <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-white" />}
                                <span className="font-bold shrink-0 bg-black/20 px-1 rounded-[2px] text-[10px]">
                                  {producerLabel}
                                </span>
                                <span className="truncate">{req.taskName}</span>
                                {isEnd && <span className="font-bold text-[10px] opacity-90">■</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {isHovered && (
                        <div className="absolute inset-0 bg-[#181715]/12 border-2 border-[#181715] flex items-center justify-center text-xs font-extrabold text-[#181715] pointer-events-none">
                          이곳에 배치 (시작일)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Date Assignment / Task Details Modal */}
      {selectedTaskForModal && (
        <div
          className="fixed inset-0 z-50 bg-[#181715]/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedTaskForModal(null)}
        >
          <div
            className="bg-[#FAF7F0] rounded-[4px] shadow-[0_24px_60px_rgba(24,23,21,0.25)] max-w-md w-full border border-[#181715]/20 overflow-hidden text-[#181715]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-4 py-3.5 border-b border-[#181715]/15 flex items-center justify-between ${
                selectedTaskForModal.isOverCapacity
                  ? 'bg-[#EC5B34] text-white'
                  : 'bg-[#EFE8DA] text-[#181715]'
              }`}
            >
              <div className="flex items-center gap-2">
                {selectedTaskForModal.isOverCapacity ? (
                  <span className="px-2 py-0.5 rounded-[2px] text-[11px] font-bold bg-white text-[#E94B22] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>초과 접수 업무</span>
                  </span>
                ) : (
                  <span className="text-xs font-extrabold">2027년 1분기 일정 배정 및 담당자 관리</span>
                )}
                <span className="text-xs font-mono opacity-75">{selectedTaskForModal.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForModal(null)}
                className={`p-1 cursor-pointer ${
                  selectedTaskForModal.isOverCapacity
                    ? 'text-white/85 hover:text-white'
                    : 'text-[#5F5A52] hover:text-[#181715]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#5F5A52] block mb-0.5">
                  TASK
                </span>
                <h3 className="text-sm font-extrabold text-[#181715]">
                  {selectedTaskForModal.taskName}
                </h3>
                <div className="text-[#5F5A52] text-[11px] mt-1">
                  {selectedTaskForModal.headquarters} · {selectedTaskForModal.team} (신청:{' '}
                  {selectedTaskForModal.requesterName})
                </div>
              </div>

              <div className="p-3 bg-[#EAE2D3]/65 rounded-[3px] border border-[#181715]/15 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-[#5F5A52] block">영상 분류</span>
                  <span className="font-bold text-[#181715]">{selectedTaskForModal.subCategory}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#5F5A52] block">산정 소요일</span>
                  <span className="font-mono font-extrabold text-sm text-[#181715]">
                    {Math.round(selectedTaskForModal.requiredDays)}일 소요
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FCF9F3] rounded-[3px] border border-[#181715]/15 space-y-2">
                <label className="block text-xs font-bold text-[#181715]">
                  배정 담당자 지정 (민규, 신혜, 유진, 승아, 외주)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRODUCER_LIST.map((name) => {
                    const isSelected = quickAssignProducer === name;
                    const pTheme = PRODUCER_THEMES[name];
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setQuickAssignProducer(isSelected ? '' : name)}
                        className={`px-2 py-1 rounded-[2px] text-xs border transition-colors cursor-pointer ${
                          isSelected ? pTheme.activeButtonClass : pTheme.buttonClass
                        }`}
                      >
                        {isSelected && '✓ '}
                        {name} ({pTheme.colorName})
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="담당자 이름 직접 입력..."
                    value={quickAssignProducer}
                    onChange={(e) => setQuickAssignProducer(e.target.value)}
                    className="flex-1 text-xs border border-[#181715]/25 rounded-[3px] p-2 bg-white focus:border-[#181715] focus:outline-none"
                  />
                  {quickAssignProducer && (
                    <button
                      type="button"
                      onClick={() => setQuickAssignProducer('')}
                      className="text-xs text-[#5F5A52] hover:text-[#E94B22] px-2 py-1 cursor-pointer"
                    >
                      지우기
                    </button>
                  )}
                </div>
              </div>

              {selectedTaskForModal.assignedStartDate ? (
                <div className="p-3 bg-[#4F8A6B]/12 rounded-[3px] border border-[#4F8A6B]/35 text-[#181715]">
                  <div className="font-extrabold flex items-center gap-1.5 mb-1 text-[#4F8A6B]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>현재 달력 배정 기간</span>
                  </div>
                  <div className="font-mono text-sm font-extrabold text-[#181715]">
                    {selectedTaskForModal.assignedStartDate} ~ {selectedTaskForModal.assignedEndDate}
                  </div>
                  <div className="text-[11px] text-[#5F5A52] mt-1">
                    (공휴일 및 주말을 제외한 {Math.round(selectedTaskForModal.requiredDays)} 영업일 동안 진행)
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#A39B53]/15 rounded-[3px] border border-[#A39B53]/40 text-[#181715] text-[11px]">
                  현재 달력에 배정되지 않았습니다. 시작 날짜를 선택하거나 드래그하여 배치하세요.
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-[#181715]/12">
                <label className="block text-xs font-bold text-[#181715]">
                  제작 시작일 직접 지정 (2027-01-01 ~ 2027-03-31)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    min="2027-01-01"
                    max="2027-03-31"
                    value={quickAssignDate}
                    onChange={(e) => setQuickAssignDate(e.target.value)}
                    className="flex-1 font-mono text-xs border border-[#181715]/25 rounded-[3px] p-2 bg-[#FCF9F3] focus:border-[#181715] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const endDate = calculateWorkingDaysEndDate(
                        quickAssignDate,
                        Math.round(selectedTaskForModal.requiredDays)
                      );
                      onAssignRequestDate(
                        selectedTaskForModal.id,
                        quickAssignDate,
                        endDate,
                        quickAssignProducer
                      );
                      onUpdateProducer(selectedTaskForModal.id, quickAssignProducer);
                      setSelectedTaskForModal(null);
                    }}
                    className="px-3.5 py-2 bg-[#181715] hover:bg-[#E94B22] text-[#EAE2D3] hover:text-white rounded-[3px] font-bold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    배정 적용
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#181715]/12">
                {selectedTaskForModal.assignedStartDate && (
                  <button
                    type="button"
                    onClick={() => {
                      onUnassignRequest(selectedTaskForModal.id);
                      setSelectedTaskForModal(null);
                    }}
                    className="text-xs text-[#E94B22] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>달력 배정 해제</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTaskForModal(null)}
                  className="px-3 py-1.5 text-[#5F5A52] hover:text-[#181715] font-semibold ml-auto cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
