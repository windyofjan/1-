import React, { useState } from 'react';
import { X, BookOpen, Check, Edit2, RotateCcw } from 'lucide-react';
import { MajorCategory } from '../types';
import { INITIAL_CATEGORIES } from '../data/categories';

interface CategoryReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MajorCategory[];
  onUpdateCategories: (categories: MajorCategory[]) => void;
}

export const CategoryReferenceModal: React.FC<CategoryReferenceModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategories,
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [tempDays, setTempDays] = useState<number>(0);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartEdit = (catId: string, subId: string, currentDays: number) => {
    setEditingCatId(catId);
    setEditingSubId(subId);
    setTempDays(currentDays);
  };

  const handleSaveEdit = (catId: string, subId: string) => {
    const updated = categories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subcategories: cat.subcategories.map((sub) => {
          if (sub.id !== subId) return sub;
          return {
            ...sub,
            defaultDays: Number(tempDays) || sub.defaultDays,
          };
        }),
      };
    });
    onUpdateCategories(updated);
    setEditingCatId(null);
    setEditingSubId(null);
  };

  const handleResetToStandard = () => {
    onUpdateCategories(INITIAL_CATEGORIES);
    setConfirmReset(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#181715]/65 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F0] rounded-[4px] shadow-[0_24px_60px_rgba(24,23,21,0.25)] max-w-5xl w-full max-h-[90vh] flex flex-col border border-[#181715]/20 overflow-hidden text-[#181715]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#181715]/15 flex items-center justify-between bg-[#EFE8DA] text-[#181715] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-[2px] bg-[#E94B22] text-white">
                STANDARD SPEC
              </span>
              <BookOpen className="w-4 h-4 text-[#5A92BF] shrink-0" />
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                영상 제작 대·소분류 및 작업 소요일 기준표
              </h2>
            </div>
            <p className="text-[11px] text-[#5F5A52] mt-1">
              대분류 및 세부 용도(소분류) 선택 시 산정되는 작업 소요일(일) 공식 기준표입니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {confirmReset ? (
              <div className="flex items-center gap-1.5 bg-[#E94B22]/12 border border-[#E94B22] px-2.5 py-1 rounded-[3px]">
                <span className="text-[11px] text-[#181715] font-semibold">표준표로 초기화할까요?</span>
                <button
                  type="button"
                  onClick={handleResetToStandard}
                  className="px-2 py-0.5 text-[11px] font-bold bg-[#E94B22] text-white rounded-[2px] cursor-pointer hover:bg-[#c73c17]"
                >
                  확인
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-1.5 py-0.5 text-[11px] text-[#5F5A52] hover:text-[#181715] cursor-pointer"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs font-semibold text-[#181715] hover:bg-[#181715] hover:text-[#FAF7F0] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[#181715]/20 bg-[#FAF7F0] transition-colors cursor-pointer"
                title="공식 기준표로 복원"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>기준표 초기화</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-[#5F5A52] hover:text-[#181715] p-1.5 rounded-[3px] hover:bg-[#181715]/10 transition-colors cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table - Risograph Print Ledger */}
        <div className="p-5 sm:p-6 overflow-y-auto bg-[#EAE2D3]/45">
          <div className="rounded-[3px] border border-[#181715]/25 overflow-hidden bg-[#FCF9F3]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E94B22] text-white font-bold text-center border-b border-[#181715]/20">
                  <th className="py-3 px-4 w-36 border-r border-white/25">영상 용도(대분류)</th>
                  <th className="py-3 px-4 w-60 border-r border-white/25">예시</th>
                  <th className="py-3 px-4 border-r border-white/25">세부 용도(소분류)</th>
                  <th className="py-3 px-4 w-28">작업소요일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181715]/15">
                {categories.map((cat, catIdx) => {
                  const isEvenCat = catIdx % 2 === 1;
                  const catBgClass = isEvenCat ? 'bg-[#EAE2D3]/40' : 'bg-[#FCF9F3]';

                  return cat.subcategories.map((sub, subIdx) => {
                    const isFirstSub = subIdx === 0;
                    const isEditing = editingCatId === cat.id && editingSubId === sub.id;

                    return (
                      <tr
                        key={sub.id}
                        className={`hover:bg-[#A39B53]/12 transition-colors border-b border-[#181715]/12 last:border-b-0 ${catBgClass}`}
                      >
                        {/* Major Category */}
                        {isFirstSub && (
                          <td
                            rowSpan={cat.subcategories.length}
                            className="py-3 px-4 font-extrabold italic text-[#181715] align-middle text-center border-r border-[#181715]/15 bg-[#EAE2D3]/65 text-sm whitespace-pre-line"
                          >
                            {cat.name}
                          </td>
                        )}

                        {/* Example */}
                        {isFirstSub && (
                          <td
                            rowSpan={cat.subcategories.length}
                            className="py-3 px-4 text-[#5F5A52] align-middle text-center border-r border-[#181715]/15 text-xs leading-relaxed"
                          >
                            {cat.example || '-'}
                          </td>
                        )}

                        {/* Subcategory */}
                        <td className="py-2.5 px-4 font-semibold text-[#181715] border-r border-[#181715]/15 align-middle">
                          <div className="flex items-center justify-between gap-2">
                            <span>{sub.name}</span>
                            {sub.description && (
                              <span className="text-[11px] font-normal text-[#5F5A52] hidden lg:inline">
                                ({sub.description})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Work Required Days */}
                        <td className="py-2.5 px-4 text-center align-middle font-mono font-bold text-[#181715] text-sm">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                step="1"
                                min="1"
                                max="60"
                                value={tempDays}
                                onChange={(e) => setTempDays(parseFloat(e.target.value) || 0)}
                                className="w-14 px-1.5 py-0.5 text-center font-mono font-bold bg-white border border-[#181715]/40 rounded-[2px] focus:outline-none focus:border-[#181715]"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(cat.id, sub.id)}
                                className="p-1 bg-[#181715] text-[#EAE2D3] rounded-[2px] hover:bg-[#E94B22] hover:text-white cursor-pointer"
                                title="저장"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 group">
                              <span className="tabular-nums">{sub.defaultDays}일</span>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(cat.id, sub.id, sub.defaultDays)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-[#5F5A52] hover:text-[#E94B22] rounded-[2px] transition-opacity cursor-pointer"
                                title="소요일 직접 조정"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#181715]/15 bg-[#EFE8DA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#5F5A52] shrink-0">
          <span className="font-mono text-[11px]">
            * 총 {categories.length}개 영상 대분류 및{' '}
            {categories.reduce((acc, c) => acc + c.subcategories.length, 0)}개 세부 용도가 정의되어 있으며, 신청서 작성 시 자동 산정됩니다.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#181715] text-[#EAE2D3] font-bold rounded-[3px] hover:bg-[#E94B22] hover:text-white transition-colors cursor-pointer self-end sm:self-auto"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
