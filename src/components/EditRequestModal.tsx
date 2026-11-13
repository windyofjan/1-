import React, { useState, useEffect } from 'react';
import { X, CheckCircle, User, Lock } from 'lucide-react';
import { VideoRequest, MajorCategory } from '../types';

interface EditRequestModalProps {
  request: VideoRequest | null;
  categories: MajorCategory[];
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: VideoRequest) => void;
}

const PRODUCER_OPTIONS = [
  { name: '민규', activeBg: 'bg-[#5A92BF] text-white border-[#5A92BF]' },
  { name: '신혜', activeBg: 'bg-[#4F8A6B] text-white border-[#4F8A6B]' },
  { name: '유진', activeBg: 'bg-[#D87AC6] text-white border-[#D87AC6]' },
  { name: '승아', activeBg: 'bg-[#A39B53] text-white border-[#A39B53]' },
  { name: '외주', activeBg: 'bg-[#181715] text-[#EAE2D3] border-[#181715]' },
] as const;

export const EditRequestModal: React.FC<EditRequestModalProps> = ({
  request,
  categories,
  isAdmin,
  isOpen,
  onClose,
  onSave,
}) => {
  const [headquarters, setHeadquarters] = useState<string>(request?.headquarters || '');
  const [team, setTeam] = useState<string>(request?.team || '');
  const [requesterName, setRequesterName] = useState<string>(request?.requesterName || '');
  const [majorCategory, setMajorCategory] = useState<string>(request?.majorCategory || '');
  const [subCategory, setSubCategory] = useState<string>(request?.subCategory || '');
  const [taskName, setTaskName] = useState<string>(request?.taskName || '');
  const [requiredDays, setRequiredDays] = useState<number>(Math.round(request?.requiredDays || 1));
  const [dueDate, setDueDate] = useState<string>(request?.dueDate || '');
  const [aspectRatio, setAspectRatio] = useState<string>(request?.aspectRatio || '16:9 가로형 (유튜브/웹)');
  const [targetLength, setTargetLength] = useState<string>(request?.targetLength || '60초~90초');
  const [notes, setNotes] = useState<string>(request?.notes || '');
  const [assignedProducer, setAssignedProducer] = useState<string>(request?.assignedProducer || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (request) {
      setHeadquarters(request.headquarters);
      setTeam(request.team);
      setRequesterName(request.requesterName);
      setMajorCategory(request.majorCategory);
      setSubCategory(request.subCategory);
      setTaskName(request.taskName);
      setRequiredDays(Math.round(request.requiredDays));
      setDueDate(request.dueDate);
      setAspectRatio(request.aspectRatio || '16:9 가로형 (유튜브/웹)');
      setTargetLength(request.targetLength || '60초~90초');
      setNotes(request.notes || '');
      setAssignedProducer(request.assignedProducer || '');
      setNewPassword('');
      setErrorMsg('');
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const currentMajorObj = categories.find((c) => c.name === majorCategory);

  const handleMajorCategoryChange = (newMajor: string) => {
    setMajorCategory(newMajor);
    const majorObj = categories.find((c) => c.name === newMajor);
    if (majorObj && majorObj.subcategories.length > 0) {
      const firstSub = majorObj.subcategories[0];
      setSubCategory(firstSub.name);
      if (!isAdmin) {
        setRequiredDays(Math.round(firstSub.defaultDays));
      }
    }
  };

  const handleSubCategoryChange = (newSub: string) => {
    setSubCategory(newSub);
    const subObj = currentMajorObj?.subcategories.find((s) => s.name === newSub);
    if (subObj && !isAdmin) {
      setRequiredDays(Math.round(subObj.defaultDays));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!headquarters.trim()) {
      setErrorMsg('소속 본부를 입력해 주세요.');
      return;
    }
    if (!team.trim()) {
      setErrorMsg('소속 팀을 입력해 주세요.');
      return;
    }
    if (!requesterName.trim()) {
      setErrorMsg('담당자 성함을 입력해 주세요.');
      return;
    }
    if (!taskName.trim()) {
      setErrorMsg('업무명을 입력해 주세요.');
      return;
    }
    if (requiredDays <= 0) {
      setErrorMsg('업무 소요일은 1일 이상이어야 합니다.');
      return;
    }
    if (!dueDate) {
      setErrorMsg('희망 완료일을 입력해 주세요.');
      return;
    }

    const updatedRequest: VideoRequest = {
      ...request,
      headquarters: headquarters.trim(),
      team: team.trim(),
      requesterName: requesterName.trim(),
      majorCategory,
      subCategory,
      taskName: taskName.trim(),
      requiredDays: Math.round(requiredDays),
      dueDate,
      aspectRatio,
      targetLength,
      notes: notes.trim(),
      assignedProducer: isAdmin ? assignedProducer.trim() : request.assignedProducer,
      password: newPassword.trim() ? newPassword.trim() : request.password,
    };

    onSave(updatedRequest);
    onClose();
  };

  const inputClass =
    'w-full text-xs rounded-[3px] border border-[#181715]/25 bg-[#FCF9F3] p-2 text-[#181715] placeholder-[#8A8275] focus:border-[#181715] focus:bg-white focus:outline-none transition-colors';

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#181715]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full my-auto bg-[#FAF7F0] rounded-[4px] shadow-[0_24px_60px_rgba(24,23,21,0.25)] border border-[#181715]/20 max-h-[85vh] flex flex-col overflow-hidden text-[#181715]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#EFE8DA] text-[#181715] border-b border-[#181715]/15 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-[2px] bg-[#181715] text-[#FAF7F0] font-bold">
                  {request.id}
                </span>
              )}
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight">접수 내역 수정</h3>
              {isAdmin && (
                <span className="text-[10px] bg-[#E94B22] text-white px-1.5 py-0.5 rounded-[2px] font-bold">
                  관리자 권한 수정
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#5F5A52] mt-0.5">
              요청 업무의 내용 및 세부사항을 수정하고 저장합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[3px] text-[#5F5A52] hover:text-[#181715] hover:bg-[#181715]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-[#E94B22]/12 border border-[#E94B22] text-[#181715] text-xs font-semibold rounded-[3px]">
                {errorMsg}
              </div>
            )}

            {/* Department & Requester */}
            <div>
              <span className="text-xs font-extrabold text-[#181715] tracking-tight flex items-center gap-1.5 mb-2">
                <span className="font-mono text-[11px] text-[#E94B22]">01 /</span>
                <span>의뢰 부서 및 담당자</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                    소속 본부 *
                  </label>
                  <input
                    type="text"
                    placeholder="예: 나눔참여본부"
                    value={headquarters}
                    onChange={(e) => setHeadquarters(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                    소속 팀 *
                  </label>
                  <input
                    type="text"
                    placeholder="예: 콘텐츠UX팀"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                    담당자 성함 *
                  </label>
                  <input
                    type="text"
                    placeholder="예: 김월비"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category & Days */}
            <div className="pt-3.5 border-t border-[#181715]/15">
              <span className="text-xs font-extrabold text-[#181715] tracking-tight flex items-center gap-1.5 mb-2">
                <span className="font-mono text-[11px] text-[#E94B22]">02 /</span>
                <span>영상 분류 및 소요일</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                    대분류 *
                  </label>
                  <select
                    value={majorCategory}
                    onChange={(e) => handleMajorCategoryChange(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                    소분류 *
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {currentMajorObj?.subcategories.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({Math.round(s.defaultDays)}일)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                    업무 소요일 (일){' '}
                    {isAdmin && <span className="text-[#E94B22] font-bold">(직접 변경)</span>}
                  </label>
                  {isAdmin ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        step="1"
                        value={requiredDays}
                        onChange={(e) =>
                          setRequiredDays(Math.max(1, Math.round(Number(e.target.value) || 1)))
                        }
                        className="w-full text-xs font-mono font-bold rounded-[3px] border border-[#E94B22]/60 bg-[#FCF9F3] p-2 focus:border-[#181715] focus:outline-none text-[#181715]"
                        required
                      />
                      <span className="text-xs text-[#5F5A52] shrink-0">일</span>
                    </div>
                  ) : (
                    <div className="p-2 bg-[#EAE2D3] rounded-[3px] border border-[#181715]/15 text-xs font-mono font-bold text-[#181715]">
                      {Math.round(requiredDays)}일 소요
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Task Name & Due Date */}
            <div className="pt-3.5 border-t border-[#181715]/15">
              <span className="text-xs font-extrabold text-[#181715] tracking-tight flex items-center gap-1.5 mb-2">
                <span className="font-mono text-[11px] text-[#E94B22]">03 /</span>
                <span>업무명 및 희망 완료일</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                    업무명 (영상 프로젝트 명) *
                  </label>
                  <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className={`${inputClass} font-semibold`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                    희망 완료일 *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`${inputClass} font-mono`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Ratio & Length */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                  화면 비율
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="16:9 가로형 (유튜브/웹)">16:9 가로형 (유튜브 / 공식 웹사이트 / 행사)</option>
                  <option value="9:16 세로형 (인스타 릴스/유튜브 쇼츠)">9:16 세로형 (인스타 릴스 / 유튜브 쇼츠)</option>
                  <option value="1:1 정방형 (피드/카드뉴스)">1:1 정방형 (인스타그램 피드 / 온라인 카드뉴스)</option>
                  <option value="다중 포맷 (16:9 + 9:16 동시 납품)">다중 포맷 (16:9 메인 + 9:16 숏폼)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                  예상 분량
                </label>
                <select
                  value={targetLength}
                  onChange={(e) => setTargetLength(e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="15초~30초 (티저/스낵)">15초~30초 (티저 / 스낵 숏폼)</option>
                  <option value="30초~60초 (표준 숏폼)">30초~60초 (표준 숏폼)</option>
                  <option value="60초~90초 (캠페인)">60초~90초 (캠페인 홍보)</option>
                  <option value="2분~3분 (소개/인터뷰)">2분~3분 (사업소개 / 인터뷰)</option>
                  <option value="5분 이상 (다큐/강의)">5분 이상 (다큐멘터리 / 행사 풀영상)</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1">
                상세 요청사항 및 참고 링크
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
                placeholder="세부 작업 내용 및 참고 링크를 입력해주세요."
              />
            </div>

            {/* Admin only: Producer assignment */}
            {isAdmin && (
              <div className="p-3.5 bg-[#EAE2D3]/70 rounded-[3px] border border-[#181715]/15 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#181715] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#5F5A52]" />
                    <span>배정 담당자 (민규, 신혜, 유진, 승아, 외주)</span>
                  </label>
                  {assignedProducer && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-[#181715] text-[#EAE2D3]">
                      ✓ {assignedProducer}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRODUCER_OPTIONS.map((opt) => {
                    const isSelected = assignedProducer === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setAssignedProducer(isSelected ? '' : opt.name)}
                        className={`px-2.5 py-1 rounded-[2px] text-xs border transition-colors cursor-pointer font-semibold ${
                          isSelected
                            ? opt.activeBg
                            : 'bg-[#FCF9F3] text-[#181715] border-[#181715]/20 hover:bg-[#EAE2D3]'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {opt.name}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="담당자 이름 직접 입력..."
                  value={assignedProducer}
                  onChange={(e) => setAssignedProducer(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {/* Password change option */}
            <div className="pt-3.5 border-t border-[#181715]/15">
              <label className="block text-[11px] font-semibold text-[#5F5A52] mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#5F5A52]" />
                <span>새 비밀번호 변경 (선택사항)</span>
              </label>
              <input
                type="password"
                placeholder="비밀번호를 변경하려면 새 비밀번호를 입력하세요 (미입력 시 기존 비밀번호 유지)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-[#EFE8DA] border-t border-[#181715]/15 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5F5A52] hover:text-[#181715] hover:bg-[#181715]/8 rounded-[3px] transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-[#EAE2D3] bg-[#181715] hover:bg-[#E94B22] hover:text-white rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>수정 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
