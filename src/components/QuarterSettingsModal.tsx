import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  Check,
  TrendingUp,
  Calculator,
  User,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { QuarterConfig, CapacitySummary, MemberDeduction } from '../types';
import { countWorkingDays } from '../utils/calendar';
import { PRODUCER_THEMES } from './AdminCalendarPlanner';

interface QuarterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quarters: QuarterConfig[];
  currentQuarterId: string;
  capacitySummary: CapacitySummary;
  onUpdateQuarter: (updatedQuarter: QuarterConfig) => void;
  onSelectQuarter: (quarterId: string) => void;
}

const DEFAULT_MEMBERS: MemberDeduction[] = [
  { name: '민규', adminDays: 0, vacationDays: 0 },
  { name: '신혜', adminDays: 0, vacationDays: 0 },
  { name: '유진', adminDays: 0, vacationDays: 0 },
  { name: '승아', adminDays: 0, vacationDays: 0 },
  { name: '외주', adminDays: 0, vacationDays: 0 },
];

export const QuarterSettingsModal: React.FC<QuarterSettingsModalProps> = ({
  isOpen,
  onClose,
  quarters,
  currentQuarterId,
  capacitySummary,
  onUpdateQuarter,
}) => {
  const currentQ = quarters.find((q) => q.id === currentQuarterId) || quarters[0];

  const [startDate, setStartDate] = useState<string>(currentQ?.startDate || '2027-01-01');
  const [endDate, setEndDate] = useState<string>(currentQ?.endDate || '2027-03-31');
  const [multiplier, setMultiplier] = useState<number>(currentQ?.multiplier ?? 4.5);
  const [members, setMembers] = useState<MemberDeduction[]>(
    currentQ?.memberDeductions && currentQ.memberDeductions.length > 0
      ? currentQ.memberDeductions
      : DEFAULT_MEMBERS
  );
  const [manualOverride, setManualOverride] = useState<boolean>(false);
  const [manualTotalDays, setManualTotalDays] = useState<number>(currentQ?.totalDays ?? 270);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [memberAddError, setMemberAddError] = useState<string>('');
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && currentQ) {
      setStartDate(currentQ.startDate || '2027-01-01');
      setEndDate(currentQ.endDate || '2027-03-31');
      setMultiplier(currentQ.multiplier ?? 4.5);
      setMembers(
        currentQ.memberDeductions && currentQ.memberDeductions.length > 0
          ? currentQ.memberDeductions.map((m) => ({
              name: m.name,
              adminDays: Number(m.adminDays) || 0,
              vacationDays: Number(m.vacationDays) || 0,
              ...(m.note ? { note: m.note } : {}),
            }))
          : DEFAULT_MEMBERS.map((m) => ({ ...m }))
      );
      setManualTotalDays(currentQ.totalDays || 270);
      setManualOverride(false);
      setSaveSuccess(false);
      setMemberAddError('');
    }
  }, [isOpen, currentQ?.id]);

  const workingDays = useMemo(() => {
    const wd = countWorkingDays(startDate, endDate);
    return wd > 0 ? wd : 60;
  }, [startDate, endDate]);

  const baseCapacityDays = useMemo(() => {
    return Math.round(workingDays * multiplier);
  }, [workingDays, multiplier]);

  const totalAdminDays = useMemo(() => {
    return members.reduce((sum, m) => sum + (Number(m.adminDays) || 0), 0);
  }, [members]);

  const totalVacationDays = useMemo(() => {
    return members.reduce((sum, m) => sum + (Number(m.vacationDays) || 0), 0);
  }, [members]);

  const totalDeductions = useMemo(() => {
    return totalAdminDays + totalVacationDays;
  }, [totalAdminDays, totalVacationDays]);

  const calculatedTotalDays = useMemo(() => {
    const raw = baseCapacityDays - totalDeductions;
    return Math.max(0, Math.round(raw));
  }, [baseCapacityDays, totalDeductions]);

  const finalTotalDays = manualOverride ? manualTotalDays : calculatedTotalDays;

  const previewAllocated = Math.round(capacitySummary.allocatedDays);
  const previewRemaining = finalTotalDays - previewAllocated;
  const isOver = previewRemaining < 0;

  if (!isOpen) return null;

  const handleUpdateMember = (index: number, field: 'adminDays' | 'vacationDays', value: number) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: isNaN(value) ? 0 : Math.max(0, value),
      };
      return updated;
    });
  };

  const handleAddMember = () => {
    const trimmed = newMemberName.trim();
    if (!trimmed) return;
    if (members.some((m) => m.name === trimmed)) {
      setMemberAddError('이미 존재하는 담당자 이름입니다.');
      return;
    }
    setMembers([...members, { name: trimmed, adminDays: 0, vacationDays: 0 }]);
    setNewMemberName('');
    setMemberAddError('');
    setIsAddingMember(false);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanMembers: MemberDeduction[] = members.map((m) => ({
      name: m.name,
      adminDays: Number(m.adminDays) || 0,
      vacationDays: Number(m.vacationDays) || 0,
    }));

    const updatedQuarter: QuarterConfig = {
      ...currentQ,
      totalDays: finalTotalDays,
      startDate,
      endDate,
      workingDays,
      multiplier,
      baseCapacityDays,
      totalDeductionDays: totalDeductions,
      memberDeductions: cleanMembers,
    };

    onUpdateQuarter(updatedQuarter);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#181715]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F0] rounded-[4px] shadow-[0_24px_60px_rgba(24,23,21,0.25)] max-w-2xl w-full border border-[#181715]/20 overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#181715]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#181715]/15 bg-[#EFE8DA] text-[#181715] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#E94B22] shrink-0" />
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                업무 일정 및 제작 가능 일수 산출 틀
              </h2>
              <span className="text-[10px] bg-[#A39B53] text-white px-1.5 py-0.5 rounded-[2px] font-bold">
                관리자 전용
              </span>
            </div>
            <p className="text-[11px] text-[#5F5A52] mt-1">
              분기 워킹데이 × 4.5 기준에서 인원별 행정업무 및 휴가 일정을 차감하여 순수 제작 가능 일수를 산출합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#5F5A52] hover:text-[#181715] p-1.5 rounded-[3px] hover:bg-[#181715]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* 1. Base Working Days Calculation Box */}
          <div className="bg-[#EAE2D3]/60 rounded-[3px] p-4 border border-[#181715]/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#181715] flex items-center gap-1.5 text-xs">
                <span className="font-mono text-[#E94B22]">01 /</span>
                <Calendar className="w-3.5 h-3.5 text-[#5F5A52]" />
                <span>분기 워킹데이 및 기본 제작 가용 일수 기준</span>
              </span>
              <span className="font-mono text-[11px] bg-[#181715] text-[#EAE2D3] px-2 py-0.5 rounded-[2px] font-bold">
                {currentQ.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                  분기 시작일
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs border border-[#181715]/25 rounded-[3px] p-2 font-mono bg-[#FCF9F3] focus:border-[#181715] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                  분기 종료일
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs border border-[#181715]/25 rounded-[3px] p-2 font-mono bg-[#FCF9F3] focus:border-[#181715] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 bg-[#FCF9F3] rounded-[3px] border border-[#181715]/15">
                <span className="text-[10px] text-[#5F5A52] block">분기 순수 워킹데이(영업일)</span>
                <span className="font-mono text-base font-extrabold text-[#181715]">
                  {workingDays}일
                </span>
                <span className="text-[10px] text-[#5F5A52] block mt-0.5">(주말/공휴일 제외)</span>
              </div>
              <div className="p-2.5 bg-[#FCF9F3] rounded-[3px] border border-[#181715]/15">
                <span className="text-[10px] text-[#5F5A52] block">제작팀 기준 배수</span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="font-bold text-[#181715]">×</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={multiplier}
                    onChange={(e) => setMultiplier(Number(e.target.value) || 4.5)}
                    className="w-14 text-center font-mono text-sm font-bold bg-white border border-[#181715]/25 rounded-[2px] px-1 py-0.5 focus:border-[#181715] focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-[#5F5A52] block mt-0.5">(기본 4.5 기준)</span>
              </div>
              <div className="p-2.5 bg-[#5A92BF] text-white rounded-[3px]">
                <span className="text-[10px] text-white/85 block font-semibold">기본 총 가용 일수</span>
                <span className="font-mono text-base font-extrabold">{baseCapacityDays}일</span>
                <span className="text-[10px] text-white/85 block mt-0.5 font-mono">
                  ({workingDays} × {multiplier})
                </span>
              </div>
            </div>
          </div>

          {/* 2. Member Deductions */}
          <div className="bg-[#FCF9F3] rounded-[3px] p-4 border border-[#181715]/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#181715]/12">
              <div>
                <span className="font-extrabold text-[#181715] flex items-center gap-1.5 text-xs">
                  <span className="font-mono text-[#E94B22]">02 /</span>
                  <User className="w-3.5 h-3.5 text-[#5F5A52]" />
                  <span>각 사람별 행정업무 및 휴가 일정 차감 틀</span>
                </span>
                <p className="text-[11px] text-[#5F5A52] mt-0.5">
                  각 사람마다 행정업무와 휴가 일수를 입력하면 총 제작 가능 일수에서 자동 차감됩니다.
                </p>
              </div>

              {!isAddingMember && (
                <button
                  type="button"
                  onClick={() => setIsAddingMember(true)}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#181715] bg-[#EAE2D3] hover:bg-[#181715] hover:text-[#EAE2D3] border border-[#181715]/20 rounded-[3px] inline-flex items-center gap-1 self-start sm:self-auto transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>담당자 추가</span>
                </button>
              )}
            </div>

            {isAddingMember && (
              <div className="p-2.5 bg-[#EAE2D3]/70 rounded-[3px] border border-[#181715]/15 space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="새 담당자 이름..."
                    value={newMemberName}
                    onChange={(e) => {
                      setNewMemberName(e.target.value);
                      if (memberAddError) setMemberAddError('');
                    }}
                    className="flex-1 text-xs border border-[#181715]/25 rounded-[3px] p-1.5 bg-white focus:border-[#181715] focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-3 py-1.5 text-xs bg-[#181715] text-[#EAE2D3] hover:bg-[#E94B22] hover:text-white rounded-[3px] font-bold cursor-pointer transition-colors"
                  >
                    추가
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingMember(false);
                      setNewMemberName('');
                      setMemberAddError('');
                    }}
                    className="px-2 py-1.5 text-xs text-[#5F5A52] hover:text-[#181715] cursor-pointer"
                  >
                    취소
                  </button>
                </div>
                {memberAddError && (
                  <p className="text-[11px] text-[#E94B22] font-semibold">{memberAddError}</p>
                )}
              </div>
            )}

            {/* Member Rows */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#5F5A52] px-2">
                <span className="col-span-3">담당자</span>
                <span className="col-span-3 text-center">행정업무 (일)</span>
                <span className="col-span-3 text-center">휴가 일정 (일)</span>
                <span className="col-span-3 text-right">차감 소계</span>
              </div>

              {members.map((member, index) => {
                const pTheme = PRODUCER_THEMES[member.name];
                const subtotal =
                  (Number(member.adminDays) || 0) + (Number(member.vacationDays) || 0);

                return (
                  <div
                    key={member.name}
                    className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-[3px] border border-[#181715]/15 bg-[#F5F0E6]/70 hover:bg-[#EAE2D3]/60 transition-colors"
                  >
                    <div className="col-span-3 flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-[2px] border inline-flex items-center gap-1.5 ${
                          pTheme
                            ? pTheme.badgeBg
                            : 'bg-[#EAE2D3] text-[#181715] border-[#181715]/25'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-[1px] ${
                            pTheme ? pTheme.dotColor : 'bg-[#5F5A52]'
                          }`}
                        />
                        <span>{member.name}</span>
                      </span>
                    </div>

                    <div className="col-span-3">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="90"
                          value={member.adminDays === 0 ? '' : member.adminDays}
                          placeholder="0"
                          onChange={(e) =>
                            handleUpdateMember(index, 'adminDays', parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-center font-mono text-xs font-bold border border-[#181715]/25 rounded-[2px] p-1.5 bg-white focus:border-[#181715] focus:outline-none"
                        />
                        <span className="text-[11px] text-[#5F5A52]">일</span>
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="90"
                          value={member.vacationDays === 0 ? '' : member.vacationDays}
                          placeholder="0"
                          onChange={(e) =>
                            handleUpdateMember(
                              index,
                              'vacationDays',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full text-center font-mono text-xs font-bold border border-[#181715]/25 rounded-[2px] p-1.5 bg-white focus:border-[#181715] focus:outline-none"
                        />
                        <span className="text-[11px] text-[#5F5A52]">일</span>
                      </div>
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-1.5 font-mono">
                      <span
                        className={`text-xs font-bold ${
                          subtotal > 0 ? 'text-[#E94B22]' : 'text-[#5F5A52]'
                        }`}
                      >
                        {subtotal > 0 ? `-${subtotal}일` : '0일'}
                      </span>
                      {!DEFAULT_MEMBERS.some((d) => d.name === member.name) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          className="text-[#5F5A52] hover:text-[#E94B22] p-0.5 cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-[#E94B22]/10 rounded-[3px] border border-[#E94B22]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[#181715]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E94B22] shrink-0" />
                <span className="font-bold text-xs">전체 인원 일정 차감 합계</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span>행정: {totalAdminDays}일</span>
                <span className="text-[#181715]/30">|</span>
                <span>휴가: {totalVacationDays}일</span>
                <span className="text-[#181715]/30">|</span>
                <strong className="text-sm font-extrabold text-[#E94B22]">
                  총 차감: -{totalDeductions}일
                </strong>
              </div>
            </div>
          </div>

          {/* 3. Final Calculation Result */}
          <div className="bg-[#EFE8DA] text-[#181715] rounded-[3px] border border-[#181715]/20 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <span className="font-mono text-[#E94B22]">03 /</span>
                <TrendingUp className="w-4 h-4 text-[#4F8A6B]" />
                <span>최종 제작 가능 일수 (CAPA) 산출 결과</span>
              </span>
              <button
                type="button"
                onClick={() => setManualOverride(!manualOverride)}
                className="text-[11px] text-[#5F5A52] hover:text-[#181715] underline underline-offset-4 cursor-pointer"
              >
                {manualOverride ? '자동 계산식으로 복귀' : '수동 수치 직접 입력'}
              </button>
            </div>

            <div className="p-3.5 bg-[#FAF7F0] rounded-[3px] border border-[#181715]/15 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#5F5A52] block">
                  FORMULA
                </span>
                <div className="text-xs font-mono text-[#181715] flex items-center gap-1.5 flex-wrap">
                  <span className="bg-[#689EC9]/20 border border-[#689EC9]/45 px-2 py-0.5 rounded-[2px] text-[#181715] font-semibold">
                    기본 가용 {baseCapacityDays}일 ({workingDays}일 × {multiplier})
                  </span>
                  <span>-</span>
                  <span className="bg-[#E94B22]/15 border border-[#E94B22]/40 px-2 py-0.5 rounded-[2px] text-[#181715] font-semibold">
                    총 차감 {totalDeductions}일 (행정 {totalAdminDays} + 휴가 {totalVacationDays})
                  </span>
                  <span>=</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-[#5F5A52] block">최종 순수 제작 가능 일수</span>
                {manualOverride ? (
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <input
                      type="number"
                      value={manualTotalDays}
                      onChange={(e) => setManualTotalDays(Number(e.target.value) || 0)}
                      className="w-24 text-right font-mono text-xl font-bold bg-white border border-[#181715]/30 rounded-[2px] p-1 text-[#181715] focus:outline-none"
                    />
                    <span className="text-sm">일</span>
                  </div>
                ) : (
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#4F8A6B] tabular-nums">
                    {finalTotalDays}
                    <span className="text-xs sm:text-sm font-semibold text-[#5F5A52] ml-1">일</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 bg-[#FAF7F0] border border-[#181715]/15 rounded-[3px]">
                <span className="text-[10px] text-[#5F5A52] block">현재 누적 신청 소요일</span>
                <span className="font-mono text-sm font-extrabold text-[#181715] tabular-nums">
                  {previewAllocated}일 ({capacitySummary.totalRequestsCount}건)
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF7F0] border border-[#181715]/15 rounded-[3px]">
                <span className="text-[10px] text-[#5F5A52] block">예상 잔여 가능 일수</span>
                <span
                  className={`font-mono text-sm font-extrabold tabular-nums ${
                    isOver ? 'text-[#E94B22]' : 'text-[#4F8A6B]'
                  }`}
                >
                  {previewRemaining}일
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF7F0] border border-[#181715]/15 rounded-[3px] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-[#5F5A52] block">예상 소진율</span>
                <span className="font-mono text-sm font-extrabold text-[#181715] tabular-nums">
                  {finalTotalDays > 0 ? Math.round((previewAllocated / finalTotalDays) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#181715]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5F5A52] hover:text-[#181715] bg-[#EAE2D3] hover:bg-[#181715]/10 rounded-[3px] transition-colors cursor-pointer"
            >
              닫기
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#181715] hover:bg-[#E94B22] text-[#EAE2D3] hover:text-white font-bold rounded-[3px] flex items-center gap-2 transition-colors cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-[#4F8A6B]" />
                  <span>설정 저장 완료!</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>계산된 {finalTotalDays}일로 제작 가용 일수 적용하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
