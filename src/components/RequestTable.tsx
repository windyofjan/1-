import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock,
  Edit3,
  Trash2,
  Lock,
} from 'lucide-react';
import { VideoRequest, MajorCategory } from '../types';
import { EditRequestModal } from './EditRequestModal';
import { sortRequestsByRegistrationOrder } from '../utils/storage';

interface RequestTableProps {
  requests: VideoRequest[];
  categories: MajorCategory[];
  isAdmin: boolean;
  onDeleteRequest: (id: string) => void;
  onUpdateRequest: (updatedRequest: VideoRequest) => void;
  onExportCSV: () => void;
  onOpenNewRequest: () => void;
}

const getProducerBadgeStyle = (producer: string) => {
  switch (producer) {
    case '신혜':
      return 'bg-[#4F8A6B] text-white border-[#4F8A6B]';
    case '민규':
      return 'bg-[#5A92BF] text-white border-[#5A92BF]';
    case '유진':
      return 'bg-[#D87AC6] text-white border-[#D87AC6]';
    case '승아':
      return 'bg-[#A39B53] text-white border-[#A39B53]';
    case '외주':
      return 'bg-[#181715] text-[#EAE2D3] border-[#181715]';
    default:
      return 'bg-[#EAE2D3] text-[#181715] border-[#181715]/25';
  }
};

export const RequestTable: React.FC<RequestTableProps> = ({
  requests,
  categories,
  isAdmin,
  onDeleteRequest,
  onUpdateRequest,
  onExportCSV,
  onOpenNewRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'over'>('all');
  const [selectedHq, setSelectedHq] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [selectedRequest, setSelectedRequest] = useState<VideoRequest | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<VideoRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<VideoRequest | null>(null);
  const [passwordPromptRequest, setPasswordPromptRequest] = useState<VideoRequest | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const uniqueHqs = useMemo(() => {
    const set = new Set(requests.map((r) => r.headquarters));
    return Array.from(set);
  }, [requests]);

  const normalCount = requests.filter((r) => !r.isOverCapacity).length;
  const overCount = requests.filter((r) => r.isOverCapacity).length;

  const filteredRequests = useMemo(() => {
    const list = requests.filter((r) => {
      if (filterType === 'normal' && r.isOverCapacity) return false;
      if (filterType === 'over' && !r.isOverCapacity) return false;
      if (selectedHq !== 'all' && r.headquarters !== selectedHq) return false;
      if (selectedCategory !== 'all' && r.majorCategory !== selectedCategory) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = r.taskName.toLowerCase().includes(term);
        const matchRequester = r.requesterName.toLowerCase().includes(term);
        const matchTeam = r.team.toLowerCase().includes(term);
        const matchHq = r.headquarters.toLowerCase().includes(term);
        const matchSub = r.subCategory.toLowerCase().includes(term);
        return matchTitle || matchRequester || matchTeam || matchHq || matchSub;
      }

      return true;
    });

    return sortRequestsByRegistrationOrder(list, sortOrder);
  }, [requests, filterType, selectedHq, selectedCategory, searchTerm, sortOrder]);

  const handleOpenEdit = (req: VideoRequest) => {
    if (isAdmin) {
      setEditingRequest(req);
    } else if (req.password) {
      setPasswordPromptRequest(req);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setEditingRequest(req);
    }
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordPromptRequest) return;

    if (passwordPromptRequest.password === passwordInput.trim()) {
      const target = passwordPromptRequest;
      setPasswordPromptRequest(null);
      setPasswordInput('');
      setPasswordError('');
      setEditingRequest(target);
    } else {
      setPasswordError('비밀번호가 일치하지 않습니다. 접수 시 입력한 비밀번호를 확인해 주세요.');
    }
  };

  const handleAdjustDays = (req: VideoRequest, delta: number) => {
    if (!isAdmin) return;
    const current = Math.round(req.requiredDays);
    const newDays = Math.max(1, current + delta);
    if (newDays === current) return;
    onUpdateRequest({
      ...req,
      requiredDays: newDays,
    });
  };

  return (
    <div className="bg-[#FAF7F0] border border-[#181715]/20 rounded-[4px] overflow-hidden text-[#181715]">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-[#181715]/15 space-y-3 bg-[#EFE8DA]/55">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#EFE8DA] rounded-[3px] border border-[#181715]/15 text-xs font-medium self-start">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-[2px] transition-colors whitespace-nowrap cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#181715] text-[#EAE2D3] font-bold'
                  : 'text-[#5F5A52] hover:text-[#181715]'
              }`}
            >
              전체 목록 ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('normal')}
              className={`px-3 py-1.5 rounded-[2px] transition-colors whitespace-nowrap cursor-pointer ${
                filterType === 'normal'
                  ? 'bg-[#181715] text-[#EAE2D3] font-bold'
                  : 'text-[#5F5A52] hover:text-[#181715]'
              }`}
            >
              정상 접수 ({normalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('over')}
              className={`px-3 py-1.5 rounded-[2px] transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterType === 'over'
                  ? 'bg-[#E94B22] text-white font-bold'
                  : 'text-[#E94B22] hover:bg-[#E94B22]/10 font-semibold'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>초과 접수 ({overCount})</span>
            </button>
          </div>

          {/* Search & CSV Download */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-2 text-[#5F5A52]" />
              <input
                type="text"
                placeholder="업무명, 담당자, 부서 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-[3px] border border-[#181715]/20 bg-[#FCF9F3] text-[#181715] placeholder-[#8A8275] focus:outline-none focus:border-[#181715] focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-[#5F5A52] hover:text-[#181715] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#181715] bg-[#FCF9F3] border border-[#181715]/20 rounded-[3px] hover:bg-[#181715] hover:text-[#EAE2D3] transition-colors whitespace-nowrap cursor-pointer"
              title="현재 분기 접수 목록 CSV 엑셀 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span>엑셀 다운로드</span>
            </button>
          </div>
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-[#181715]/12 text-xs">
          <span className="font-mono text-[11px] text-[#5F5A52] font-bold uppercase tracking-wider">
            FILTER:
          </span>

          <select
            value={selectedHq}
            onChange={(e) => setSelectedHq(e.target.value)}
            className="text-xs rounded-[3px] border border-[#181715]/20 bg-[#FCF9F3] px-2.5 py-1 text-[#181715] focus:outline-none focus:border-[#181715] cursor-pointer"
          >
            <option value="all">모든 본부</option>
            {uniqueHqs.map((hq) => (
              <option key={hq} value={hq}>
                {hq}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-[3px] border border-[#181715]/20 bg-[#FCF9F3] px-2.5 py-1 text-[#181715] focus:outline-none focus:border-[#181715] cursor-pointer"
          >
            <option value="all">모든 영상 대분류</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {(selectedHq !== 'all' || selectedCategory !== 'all' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSelectedHq('all');
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="text-[#E94B22] hover:underline font-bold text-[11px] cursor-pointer ml-1"
            >
              필터 초기화
            </button>
          )}

          {/* Sort order toggle */}
          <div className="inline-flex items-center rounded-[3px] border border-[#181715]/15 bg-[#EAE2D3] p-0.5 text-xs ml-auto">
            <button
              type="button"
              onClick={() => setSortOrder('asc')}
              className={`px-2.5 py-1 rounded-[2px] transition-colors text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                sortOrder === 'asc'
                  ? 'bg-[#181715] text-[#EAE2D3] font-bold'
                  : 'text-[#5F5A52] hover:text-[#181715]'
              }`}
              title="접수 등록 순서대로 정렬 (1번부터 오름차순)"
            >
              <Clock className="w-3 h-3" />
              <span>등록 순서 (1번부터)</span>
            </button>
            <button
              type="button"
              onClick={() => setSortOrder('desc')}
              className={`px-2.5 py-1 rounded-[2px] transition-colors text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                sortOrder === 'desc'
                  ? 'bg-[#181715] text-[#EAE2D3] font-bold'
                  : 'text-[#5F5A52] hover:text-[#181715]'
              }`}
              title="가장 최근에 등록된 순서대로 정렬"
            >
              <span>최신 등록순</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#EFE8DA] border-b border-[#181715]/20 text-[#181715] font-mono text-[11px] font-bold tracking-wider">
              <th className="py-3 px-4 w-28 text-center">접수번호</th>
              <th className="py-3 px-4">업무명 및 세부 규격</th>
              <th className="py-3 px-4">소속 / 담당자</th>
              <th className="py-3 px-4">영상 분류 (대/소분류)</th>
              <th className="py-3 px-4 text-center w-36">
                업무소요일 {isAdmin && <span className="text-[#E94B22] font-bold">(+/-)</span>}
              </th>
              <th className="py-3 px-4">희망 완료일</th>
              <th className="py-3 px-4 text-center w-28">
                {isAdmin ? '관리' : '수정'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181715]/12">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-[#5F5A52]">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <p className="text-sm font-bold text-[#181715]">
                      해당 조건의 접수 내역이 없습니다.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenNewRequest}
                      className="mt-1 px-4 py-2 text-xs font-bold text-[#EAE2D3] bg-[#181715] hover:bg-[#E94B22] hover:text-white rounded-[3px] transition-colors cursor-pointer"
                    >
                      새로운 영상 제작 접수하기
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const isOver = req.isOverCapacity;

                return (
                  <tr
                    key={req.id}
                    className={`transition-colors cursor-pointer ${
                      isOver
                        ? 'bg-[#E94B22]/10 hover:bg-[#E94B22]/16 text-[#181715] border-l-4 border-l-[#E94B22]'
                        : 'hover:bg-[#EAE2D3]/60 text-[#181715]'
                    }`}
                    onClick={() => setSelectedRequest(req)}
                  >
                    {/* 1. Request ID & Stamp */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap text-center">
                      <div className="font-mono text-xs font-bold text-[#181715] tabular-nums">
                        {req.id}
                      </div>
                      {isOver ? (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] px-2 py-0.5 rounded-[2px] font-bold bg-[#E94B22] text-white">
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                          <span>초과 접수</span>
                        </span>
                      ) : (
                        <span className="inline-block mt-1.5 font-mono text-[10px] font-semibold text-[#5F5A52]">
                          정상 접수
                        </span>
                      )}
                    </td>

                    {/* 2. Task Name & Specs */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#181715] leading-snug">
                          {req.taskName}
                        </span>
                        {isOver && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[2px] font-bold bg-[#E94B22] text-white">
                            <span>초과 접수</span>
                          </span>
                        )}
                        {req.assignedProducer && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] border ${getProducerBadgeStyle(
                              req.assignedProducer
                            )}`}
                          >
                            담당: {req.assignedProducer}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#5F5A52] mt-1 flex flex-wrap items-center gap-2">
                        {req.aspectRatio && <span>{req.aspectRatio}</span>}
                        {req.targetLength && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{req.targetLength}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* 3. Division / Team / Requester */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-bold text-[#181715]">{req.headquarters}</div>
                      <div className="text-[11px] text-[#5F5A52] mt-0.5">
                        {req.team} · <strong className="text-[#181715]">{req.requesterName}</strong>
                      </div>
                    </td>

                    {/* 4. Category */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-[#181715] truncate max-w-xs">
                        {req.majorCategory}
                      </div>
                      <div className="text-[11px] text-[#5F5A52] truncate max-w-xs mt-0.5">
                        ↳ {req.subCategory}
                      </div>
                    </td>

                    {/* 5. Required Days */}
                    <td
                      className="py-3.5 px-4 align-top whitespace-nowrap text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isAdmin ? (
                        <div className="inline-flex flex-col items-center">
                          <div className="inline-flex items-center gap-1.5 justify-center bg-[#EAE2D3] px-2 py-1 rounded-[3px] border border-[#181715]/15">
                            <button
                              type="button"
                              onClick={() => handleAdjustDays(req, -1)}
                              className="w-5 h-5 rounded-[2px] bg-[#FCF9F3] hover:bg-[#181715] hover:text-[#EAE2D3] text-[#181715] flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                              title="소요일 1일 감소 (관리자)"
                            >
                              -
                            </button>
                            <span
                              className={`text-sm font-extrabold font-mono tabular-nums min-w-8 text-center ${
                                isOver ? 'text-[#E94B22]' : 'text-[#181715]'
                              }`}
                            >
                              {Math.round(req.requiredDays)}일
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustDays(req, +1)}
                              className="w-5 h-5 rounded-[2px] bg-[#FCF9F3] hover:bg-[#181715] hover:text-[#EAE2D3] text-[#181715] flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                              title="소요일 1일 증가 (관리자)"
                            >
                              +
                            </button>
                          </div>
                          {isOver && (
                            <span className="font-mono text-[10px] text-[#E94B22] font-bold mt-1">
                              한도초과 (+{req.overCapacityAmount || Math.round(req.requiredDays)}일)
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <span
                            className={`text-sm font-extrabold font-mono tabular-nums ${
                              isOver ? 'text-[#E94B22]' : 'text-[#181715]'
                            }`}
                          >
                            {Math.round(req.requiredDays)}
                          </span>
                          <span className="text-xs text-[#5F5A52] ml-0.5">일</span>
                          {isOver && (
                            <div className="font-mono text-[10px] text-[#E94B22] font-bold mt-0.5">
                              한도초과 (+{req.overCapacityAmount || Math.round(req.requiredDays)}일)
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 6. Due Date */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-mono text-[#181715] font-bold tabular-nums">
                        {req.dueDate}
                      </div>
                      <div className="font-mono text-[10px] text-[#5F5A52] mt-0.5">
                        접수: {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </td>

                    {/* 7. Action buttons */}
                    <td
                      className="py-3.5 px-4 align-top text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(req)}
                          className="px-2.5 py-1 text-xs text-[#181715] bg-[#EAE2D3] hover:bg-[#181715] hover:text-[#EAE2D3] border border-[#181715]/15 rounded-[3px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title={isAdmin ? '관리자 권한으로 수정' : '비밀번호 확인 후 수정'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>수정</span>
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setDeletingRequest(req)}
                            className="px-2 py-1 text-xs text-[#E94B22] hover:bg-[#E94B22] hover:text-white bg-[#E94B22]/10 border border-[#E94B22]/35 rounded-[3px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="접수 내역 삭제 (관리자 전용)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>삭제</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="px-4 py-3 bg-[#EFE8DA]/65 border-t border-[#181715]/15 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5F5A52] gap-2">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>
            TOTAL <strong className="text-[#181715]">{filteredRequests.length}</strong>건 표시
          </span>
          <span aria-hidden="true">·</span>
          <span>
            합계 소요일:{' '}
            <strong className="text-[#181715] font-mono tabular-nums">
              {Math.round(filteredRequests.reduce((sum, r) => sum + r.requiredDays, 0))}일
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#5F5A52] text-[11px]">
          <span>* 항목 클릭 시 상세 내용을 확인할 수 있습니다.</span>
        </div>
      </div>

      {/* Request Detail Modal Window */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 bg-[#181715]/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-[#FAF7F0] rounded-[4px] shadow-[0_24px_60px_rgba(24,23,21,0.25)] max-w-lg w-full border border-[#181715]/20 overflow-hidden text-[#181715]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`px-5 py-3.5 border-b flex items-center justify-between ${
                selectedRequest.isOverCapacity
                  ? 'bg-[#EC5B34] border-[#181715]/20 text-white'
                  : 'bg-[#EFE8DA] border-[#181715]/15 text-[#181715]'
              }`}
            >
              <div className="flex items-center gap-2">
                {selectedRequest.isOverCapacity ? (
                  <div className="px-2 py-0.5 rounded-[2px] text-[11px] font-bold bg-white text-[#E94B22] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>초과 접수 건</span>
                  </div>
                ) : (
                  <div className="px-2 py-0.5 rounded-[2px] text-[11px] font-bold bg-[#689EC9] text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>정상 접수</span>
                  </div>
                )}
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-[2px] border ${
                    selectedRequest.isOverCapacity
                      ? 'bg-[#181715]/25 text-white border-white/25'
                      : 'bg-[#FAF7F0] text-[#181715] border-[#181715]/20'
                  }`}
                >
                  {selectedRequest.id}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className={`p-1 rounded-[3px] cursor-pointer ${
                  selectedRequest.isOverCapacity
                    ? 'text-white/85 hover:text-white'
                    : 'text-[#5F5A52] hover:text-[#181715]'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {selectedRequest.isOverCapacity && (
                <div className="p-3.5 rounded-[3px] bg-[#E94B22]/12 border border-[#E94B22]/40 border-l-4 border-l-[#E94B22] text-[#181715] space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-[#E94B22]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>분기 총 가용 일수 초과 상태에서 등록된 프로젝트입니다</span>
                  </div>
                  <p className="text-[#4C4740] leading-relaxed text-[11px]">
                    해당 분기의 영상 제작 가용 일수가 전액 차감된 시점에 접수되었습니다. 우선순위
                    재조정 회의 또는 외주 제작 지원 여부를 제작팀과 즉시 협의하시기 바랍니다.
                  </p>
                </div>
              )}

              <div>
                <span className="font-mono text-[#5F5A52] text-[10px] uppercase tracking-wider block mb-1">
                  PROJECT TITLE
                </span>
                <h3 className="text-base font-extrabold text-[#181715] leading-snug">
                  {selectedRequest.taskName}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3.5 bg-[#EAE2D3]/65 rounded-[3px] border border-[#181715]/15">
                <div>
                  <span className="text-[#5F5A52] text-[11px] block">의뢰 부서 및 담당자</span>
                  <div className="font-bold text-[#181715] mt-0.5">
                    {selectedRequest.headquarters} · {selectedRequest.team}
                  </div>
                  <div className="text-[#5F5A52] mt-0.5">
                    담당자: <strong className="text-[#181715]">{selectedRequest.requesterName}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[#5F5A52] text-[11px] block">희망 완료일</span>
                  <div className="font-extrabold text-[#181715] mt-0.5 font-mono text-sm">
                    {selectedRequest.dueDate}
                  </div>
                  <div className="text-[#5F5A52] font-mono text-[10px] mt-0.5">
                    신청: {new Date(selectedRequest.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#EAE2D3]/65 rounded-[3px] border border-[#181715]/15 space-y-2">
                <span className="text-[#5F5A52] text-[11px] block">영상 분류 및 소요일 산정 결과</span>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#181715]">{selectedRequest.majorCategory}</div>
                    <div className="text-[#5F5A52] mt-0.5">↳ {selectedRequest.subCategory}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#5F5A52] block">업무 소요일</span>
                    <span
                      className={`text-xl font-extrabold font-mono tabular-nums ${
                        selectedRequest.isOverCapacity ? 'text-[#E94B22]' : 'text-[#181715]'
                      }`}
                    >
                      {Math.round(selectedRequest.requiredDays)}일
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#181715]/12 flex items-center justify-between text-[11px] text-[#5F5A52]">
                  <span>규격: {selectedRequest.aspectRatio || '16:9'}</span>
                  <span>분량: {selectedRequest.targetLength || '표준'}</span>
                </div>
              </div>

              <div className="p-3 bg-[#FCF9F3] rounded-[3px] border border-[#181715]/15 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#5F5A52] text-[10px] block">제작 담당자 배정</span>
                  <div className="mt-1">
                    {selectedRequest.assignedProducer ? (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-[2px] border inline-block ${getProducerBadgeStyle(
                          selectedRequest.assignedProducer
                        )}`}
                      >
                        ✓ {selectedRequest.assignedProducer} 담당
                      </span>
                    ) : (
                      <span className="text-[#5F5A52] text-xs">미배정 (일정표에서 지정 가능)</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[#5F5A52] text-[10px] block">달력 배정 기간</span>
                  <div className="font-mono text-xs font-bold text-[#181715] mt-1">
                    {selectedRequest.assignedStartDate ? (
                      <span className="text-[#4F8A6B] font-extrabold">
                        {selectedRequest.assignedStartDate} ~ {selectedRequest.assignedEndDate}
                      </span>
                    ) : (
                      <span className="text-[#5F5A52] font-normal">달력 미배정</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[#5F5A52] text-[11px] block mb-1">
                  상세 요청사항 및 레퍼런스
                </span>
                <div className="p-3 bg-[#FCF9F3] rounded-[3px] border border-[#181715]/15 text-[#181715] whitespace-pre-wrap leading-relaxed min-h-16">
                  {selectedRequest.notes || '등록된 추가 요청사항이나 레퍼런스 링크가 없습니다.'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#181715]/12">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedRequest;
                    setSelectedRequest(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-3.5 py-1.5 text-xs text-[#181715] bg-[#EAE2D3] hover:bg-[#181715] hover:text-[#EAE2D3] border border-[#181715]/20 rounded-[3px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>수정하기</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      const toDelete = selectedRequest;
                      setSelectedRequest(null);
                      setDeletingRequest(toDelete);
                    }}
                    className="px-3 py-1.5 text-xs text-[#E94B22] hover:text-white bg-[#E94B22]/10 hover:bg-[#E94B22] border border-[#E94B22]/35 rounded-[3px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>접수 취소/삭제</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Verification Modal Dialog */}
      {passwordPromptRequest && (
        <div
          className="fixed inset-0 z-[100] bg-[#181715]/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPasswordPromptRequest(null)}
        >
          <div
            className="bg-[#F5F0E6] rounded-[4px] shadow-[0_24px_60px_rgba(24,23,21,0.3)] max-w-sm w-full p-5 border border-[#181715]/25 space-y-4 text-[#181715]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#181715] shrink-0" />
              <h3 className="text-sm font-extrabold">수정 비밀번호 확인</h3>
            </div>

            <p className="text-xs text-[#5F5A52] leading-relaxed">
              <strong className="text-[#181715]">'{passwordPromptRequest.taskName}'</strong> 접수 건을 수정하려면 신청 시 설정한 비밀번호를 입력해주세요.
            </p>

            <form onSubmit={handleVerifyPassword} className="space-y-3">
              <div>
                <input
                  type="password"
                  autoFocus
                  placeholder="비밀번호 입력"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs rounded-[3px] border border-[#181715]/25 bg-[#FCF9F3] p-2.5 focus:border-[#181715] focus:bg-white focus:outline-none"
                  required
                />
                {passwordError && (
                  <p className="text-[11px] text-[#E94B22] font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#181715]/12">
                <button
                  type="button"
                  onClick={() => setPasswordPromptRequest(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#5F5A52] hover:text-[#181715] rounded-[3px] hover:bg-[#EAE2D3] transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#EAE2D3] bg-[#181715] hover:bg-[#E94B22] hover:text-white rounded-[3px] transition-colors cursor-pointer"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Request Modal Window */}
      {editingRequest && (
        <EditRequestModal
          request={editingRequest}
          categories={categories}
          isAdmin={isAdmin}
          isOpen={!!editingRequest}
          onClose={() => setEditingRequest(null)}
          onSave={(updated) => {
            onUpdateRequest(updated);
            setEditingRequest(null);
          }}
        />
      )}

      {/* In-UI Deletion Confirmation Dialog (Admin only) */}
      {deletingRequest && (
        <div
          className="fixed inset-0 z-[100] bg-[#181715]/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeletingRequest(null)}
        >
          <div
            className="bg-[#F5F0E6] rounded-[4px] shadow-[0_24px_60px_rgba(24,23,21,0.3)] max-w-sm w-full p-5 border border-[#181715]/25 space-y-4 text-[#181715]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-[#E94B22]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-extrabold text-[#181715]">영상 제작 접수 삭제 (관리자)</h3>
            </div>

            <p className="text-xs text-[#5F5A52] leading-relaxed">
              <strong className="text-[#181715]">'{deletingRequest.taskName}'</strong> 접수 건을 정말 삭제하시겠습니까?
              <br />
              삭제 시 차감되었던 <strong className="text-[#181715] font-mono">{Math.round(deletingRequest.requiredDays)}일</strong>의 제작 가용 일수가 즉시 반환됩니다.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#181715]/12">
              <button
                type="button"
                onClick={() => setDeletingRequest(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#5F5A52] hover:text-[#181715] rounded-[3px] hover:bg-[#EAE2D3] transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRequest(deletingRequest.id);
                  setDeletingRequest(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#E94B22] hover:bg-[#c73c17] rounded-[3px] transition-colors cursor-pointer"
              >
                삭제 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
