import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Film,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Download,
  BookOpen,
  Settings,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  Shield,
  ShieldCheck,
  Lock,
  X,
} from 'lucide-react';

import { VideoRequest, MajorCategory, QuarterConfig } from './types';
import {
  getStoredRequests,
  saveRequests,
  getStoredQuarters,
  saveQuarters,
  getStoredCategories,
  saveCategories,
  resetAllData,
  calculateCapacitySummary,
  reconcileOverCapacityRequests,
  exportRequestsToCSV,
  sortRequestsByRegistrationOrder,
} from './utils/storage';

import {
  testConnection,
  subscribeToRequests,
  subscribeToQuarters,
  saveRequestToFirestore,
  updateRequestInFirestore,
  deleteRequestFromFirestore,
  saveQuarterToFirestore,
  seedInitialFirestoreData,
} from './firebase';

import { CapacityDashboard } from './components/CapacityDashboard';
import { RequestForm } from './components/RequestForm';
import { RequestTable } from './components/RequestTable';
import { CategoryReferenceModal } from './components/CategoryReferenceModal';
import { QuarterSettingsModal } from './components/QuarterSettingsModal';
import { AdminCalendarPlanner } from './components/AdminCalendarPlanner';

export default function App() {
  // State with lazy initializers so data is available on first render
  const [requests, setRequests] = useState<VideoRequest[]>(() => getStoredRequests());
  const [quarters, setQuarters] = useState<QuarterConfig[]>(() => getStoredQuarters());
  const quartersRef = useRef(quarters);
  quartersRef.current = quarters;
  const [categories, setCategories] = useState<MajorCategory[]>(() => getStoredCategories());
  const [currentQuarterId, setCurrentQuarterId] = useState<string>('2027-Q1');
  const [activeTab, setActiveTab] = useState<'table' | 'calendar'>('table');

  // Admin Mode state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminPasswordError, setAdminPasswordError] = useState<string>('');

  // Firebase Realtime Sync State
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Modals
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState<boolean>(false);
  const [isCategoryGuideOpen, setIsCategoryGuideOpen] = useState<boolean>(false);
  const [isQuarterSettingsOpen, setIsQuarterSettingsOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);

  // Current quarter object
  const currentQuarter = useMemo(() => {
    return quarters.find((q) => q.id === currentQuarterId) || quarters[0] || {
      id: '2027-Q1',
      name: '2027년 1분기',
      totalDays: 270,
      startDate: '2027-01-01',
      endDate: '2027-03-31',
      workingDays: 60,
      multiplier: 4.5,
      memberDeductions: [
        { name: '민규', adminDays: 0, vacationDays: 0 },
        { name: '신혜', adminDays: 0, vacationDays: 0 },
        { name: '유진', adminDays: 0, vacationDays: 0 },
        { name: '승아', adminDays: 0, vacationDays: 0 },
        { name: '외주', adminDays: 0, vacationDays: 0 },
      ],
    };
  }, [quarters, currentQuarterId]);

  // Capacity summary
  const capacitySummary = useMemo(() => {
    if (!currentQuarter) {
      return {
        quarter: { id: '2027-Q1', name: '2027년 1분기', totalDays: 60, startDate: '', endDate: '' },
        totalDays: 60,
        allocatedDays: 0,
        remainingDays: 60,
        utilizationRate: 0,
        totalRequestsCount: 0,
        overCapacityCount: 0,
        totalOverCapacityDays: 0,
      };
    }
    return calculateCapacitySummary(requests, currentQuarter);
  }, [requests, currentQuarter]);

  // Filter requests for active quarter (접수 등록 순서대로 정렬)
  const quarterRequests = useMemo(() => {
    const list = requests.filter((r) => r.quarter === currentQuarterId);
    return sortRequestsByRegistrationOrder(list, 'asc');
  }, [requests, currentQuarterId]);

  // Toast helper
  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Firebase Setup & Realtime Subscriptions
  useEffect(() => {
    // 1. Test connection
    testConnection();

    // 2. Seed initial data to Firestore if empty
    seedInitialFirestoreData(requests, quarters);

    // 3. Realtime requests listener (전사 공유)
    const unsubscribeRequests = subscribeToRequests(
      (remoteRequests) => {
        if (remoteRequests && remoteRequests.length > 0) {
          setRequests((prev) => {
            // Merge remote requests with any local unsynced requests
            const remoteMap = new Map(remoteRequests.map((r) => [r.id, r]));
            const localOnly = prev.filter((r) => !remoteMap.has(r.id));

            // Background sync any local-only requests to Firestore
            if (localOnly.length > 0) {
              localOnly.forEach((req) => {
                saveRequestToFirestore(req).catch(console.error);
              });
            }

            const merged = [...remoteRequests, ...localOnly];

            // Automatically reconcile over-capacity status
            const { updatedRequests, convertedRequests } = reconcileOverCapacityRequests(
              merged,
              quartersRef.current
            );

            // Sync converted or newly marked over-capacity to Firestore
            if (convertedRequests.length > 0) {
              convertedRequests.forEach((conv) => {
                updateRequestInFirestore(conv.id, {
                  isOverCapacity: conv.isOverCapacity,
                  overCapacityAmount: conv.overCapacityAmount,
                }).catch(console.error);
              });
            }

            saveRequests(updatedRequests);
            return updatedRequests;
          });
          setIsFirebaseConnected(true);
        }
      },
      (err) => {
        console.warn('Realtime Firestore requests fallback:', err);
      }
    );

    // 4. Realtime quarters listener
    const unsubscribeQuarters = subscribeToQuarters(
      (remoteQuarters) => {
        if (remoteQuarters && remoteQuarters.length > 0) {
          setQuarters(remoteQuarters);
          quartersRef.current = remoteQuarters;
          saveQuarters(remoteQuarters);

          // Reconcile requests against newly loaded quarters
          setRequests((prev) => {
            const { updatedRequests, convertedRequests } = reconcileOverCapacityRequests(
              prev,
              remoteQuarters
            );

            if (convertedRequests.length > 0) {
              convertedRequests.forEach((conv) => {
                updateRequestInFirestore(conv.id, {
                  isOverCapacity: conv.isOverCapacity,
                  overCapacityAmount: conv.overCapacityAmount,
                }).catch(console.error);
              });
            }

            saveRequests(updatedRequests);
            return updatedRequests;
          });
        }
      },
      (err) => {
        console.warn('Realtime Firestore quarters fallback:', err);
      }
    );

    return () => {
      unsubscribeRequests();
      unsubscribeQuarters();
    };
  }, []);

  // Admin Mode Toggle Handler
  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      if (activeTab === 'calendar') {
        setActiveTab('table');
      }
      showToast('관리자 모드가 해제되었습니다. (일반 모드로 전환)', 'info');
    } else {
      setIsAdminAuthModalOpen(true);
      setAdminPasswordInput('');
      setAdminPasswordError('');
    }
  };

  const handleConfirmAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const input = adminPasswordInput.trim();
    if (input === '73319') {
      setIsAdmin(true);
      setIsAdminAuthModalOpen(false);
      setAdminPasswordInput('');
      setAdminPasswordError('');
      showToast('관리자 모드로 전환되었습니다. 달력 배정, 소요일 조정(+/-), 제작 가능 일수 설정 권한이 활성화됩니다.', 'success');
    } else {
      setAdminPasswordError('관리자 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
    }
  };

  // Open Quarter Settings (총 제작 가능 일수 산출 틀 - 관리자 전용)
  const handleOpenQuarterSettings = () => {
    if (!isAdmin) {
      showToast('총 제작 가능 일수는 관리자 모드에서만 설정할 수 있습니다.', 'warning');
      return;
    }
    setIsQuarterSettingsOpen(true);
  };

  // Open new request modal dialog
  const handleOpenNewRequest = () => {
    setIsNewRequestModalOpen(true);
  };

  // Handle request submission
  const handleCreateRequest = async (requestData: Omit<VideoRequest, 'id' | 'createdAt'>) => {
    // Determine unique ID by finding highest existing numeric suffix
    let maxNum = 0;
    for (const r of requests) {
      const match = r.id.match(/REQ-2027-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    }
    const newId = `REQ-2027-${String(maxNum + 1).padStart(3, '0')}`;

    const newRequest: VideoRequest = {
      ...requestData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    // Reconcile all requests strictly in registration sequence
    const rawList = [...requests.filter((r) => r.id !== newId), newRequest];
    const { updatedRequests } = reconcileOverCapacityRequests(
      rawList,
      quartersRef.current
    );
    const finalizedRequest = updatedRequests.find((r) => r.id === newId) || newRequest;

    setRequests(updatedRequests);
    saveRequests(updatedRequests);

    // Save to Firestore for team sharing
    try {
      await saveRequestToFirestore(finalizedRequest);
    } catch (e) {
      console.error('Failed to sync new request to Firestore:', e);
    }

    const idSuffix = ` (접수번호: ${newId})`;
    if (finalizedRequest.isOverCapacity) {
      showToast(
        `[초과 접수 완료] 분기 가용 일수가 소진되어 붉은색 '초과 접수'로 등록되었습니다.${idSuffix}`,
        'warning'
      );
    } else {
      showToast(
        `[정상 접수 완료] 영상 제작 접수가 완료되었습니다. (${finalizedRequest.requiredDays}일 차감${idSuffix})`,
        'success'
      );
    }
  };

  // Update existing request (called from EditRequestModal or Admin adjustment)
  const handleUpdateRequest = async (updatedRequest: VideoRequest) => {
    const rawUpdated = requests.map((r) => (r.id === updatedRequest.id ? updatedRequest : r));
    const { updatedRequests, convertedRequests } = reconcileOverCapacityRequests(
      rawUpdated,
      quarters
    );
    setRequests(updatedRequests);
    saveRequests(updatedRequests);

    // Sync to Firestore
    try {
      await updateRequestInFirestore(updatedRequest.id, updatedRequest);
    } catch (e) {
      console.error('Failed to sync updated request to Firestore:', e);
    }

    // Sync any other converted requests to Firestore
    if (convertedRequests.length > 0) {
      for (const conv of convertedRequests) {
        if (conv.id !== updatedRequest.id) {
          try {
            await updateRequestInFirestore(conv.id, {
              isOverCapacity: false,
              overCapacityAmount: 0,
            });
          } catch (e) {
            console.error(`Failed to sync converted request ${conv.id} to Firestore:`, e);
          }
        }
      }
    }

    const idInfo = isAdmin ? `(${updatedRequest.id}) ` : `'${updatedRequest.taskName}' `;
    if (convertedRequests.length > 0) {
      showToast(
        `접수 건 ${idInfo}내용 수정 완료. 가용 일수 확보로 ${convertedRequests.length}건이 일반 접수로 자동 변경되었습니다.`,
        'success'
      );
    } else {
      showToast(`접수 건 ${idInfo}내용이 성공적으로 수정되었습니다.`, 'success');
    }
  };

  // Calendar Schedule Assignment Handlers (Admin Only)
  const handleAssignRequestDate = async (
    requestId: string,
    startDate: string,
    endDate: string,
    producer?: string
  ) => {
    const updated = requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            assignedStartDate: startDate,
            assignedEndDate: endDate,
            ...(producer !== undefined ? { assignedProducer: producer } : {}),
          }
        : r
    );
    setRequests(updated);
    saveRequests(updated);

    // Sync to Firestore
    try {
      await updateRequestInFirestore(requestId, {
        assignedStartDate: startDate,
        assignedEndDate: endDate,
        ...(producer !== undefined ? { assignedProducer: producer } : {}),
      });
    } catch (e) {
      console.error('Failed to sync calendar assignment to Firestore:', e);
    }

    const target = requests.find((r) => r.id === requestId);
    const assignedName = producer || target?.assignedProducer;
    showToast(
      `'${target?.taskName || requestId}' 업무가 ${startDate} ~ ${endDate}${
        assignedName ? ` (${assignedName} 담당)` : ''
      } 일정으로 배정되었습니다.`,
      'success'
    );
  };

  const handleUpdateProducer = async (requestId: string, producer: string) => {
    const updated = requests.map((r) =>
      r.id === requestId ? { ...r, assignedProducer: producer } : r
    );
    setRequests(updated);
    saveRequests(updated);

    try {
      await updateRequestInFirestore(requestId, {
        assignedProducer: producer,
      });
    } catch (e) {
      console.error('Failed to sync assignedProducer to Firestore:', e);
    }
  };

  const handleUnassignRequest = async (requestId: string) => {
    const updated = requests.map((r) =>
      r.id === requestId ? { ...r, assignedStartDate: undefined, assignedEndDate: undefined } : r
    );
    setRequests(updated);
    saveRequests(updated);

    // Sync to Firestore
    try {
      await updateRequestInFirestore(requestId, {
        assignedStartDate: '',
        assignedEndDate: '',
      });
    } catch (e) {
      console.error('Failed to sync calendar unassignment to Firestore:', e);
    }

    showToast('업무의 달력 배정이 해제되었습니다.', 'info');
  };

  // Delete request (Admin Only)
  const handleDeleteRequest = async (id: string) => {
    const remaining = requests.filter((r) => r.id !== id);

    // If deleting frees up capacity, automatically convert over-capacity requests to normal
    const { updatedRequests, convertedRequests } = reconcileOverCapacityRequests(
      remaining,
      quarters
    );

    setRequests(updatedRequests);
    saveRequests(updatedRequests);

    // Sync deletion to Firestore
    try {
      await deleteRequestFromFirestore(id);
    } catch (e) {
      console.error('Failed to sync deletion to Firestore:', e);
    }

    // Sync converted requests to Firestore
    if (convertedRequests.length > 0) {
      for (const conv of convertedRequests) {
        try {
          await updateRequestInFirestore(conv.id, {
            isOverCapacity: false,
            overCapacityAmount: 0,
          });
        } catch (e) {
          console.error(`Failed to sync converted request ${conv.id} to Firestore:`, e);
        }
      }
    }

    const idSuffix = isAdmin ? `(${id})` : '';
    if (convertedRequests.length === 1) {
      showToast(
        `접수 건${idSuffix}이 삭제되었습니다. 가용 일수 확보로 '${convertedRequests[0].taskName}' 건이 일반 접수 건으로 자동 변경되었습니다.`,
        'success'
      );
    } else if (convertedRequests.length > 1) {
      showToast(
        `접수 건${idSuffix}이 삭제되었습니다. 가용 일수 확보로 초과 접수 ${convertedRequests.length}건이 일반 접수 건으로 자동 변경되었습니다.`,
        'success'
      );
    } else {
      showToast(`접수 건${idSuffix}이 삭제되었습니다. 가용 일수가 반환되었습니다.`, 'info');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    exportRequestsToCSV(quarterRequests, currentQuarter.name);
    showToast(`${currentQuarter.name} 접수 목록이 CSV 파일로 다운로드되었습니다.`, 'info');
  };

  // Update categories
  const handleUpdateCategories = (updatedCategories: MajorCategory[]) => {
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    showToast('소요일 산정 기준표가 업데이트되었습니다.', 'success');
  };

  // Update quarter config
  const handleUpdateQuarter = async (updatedQuarter: QuarterConfig) => {
    const updatedQuarters = quarters.map((q) => (q.id === updatedQuarter.id ? updatedQuarter : q));
    setQuarters(updatedQuarters);
    quartersRef.current = updatedQuarters;
    saveQuarters(updatedQuarters);

    // Reconcile with updated quarter capacity
    const { updatedRequests, convertedRequests } = reconcileOverCapacityRequests(
      requests,
      updatedQuarters
    );
    setRequests(updatedRequests);
    saveRequests(updatedRequests);

    if (convertedRequests.length > 0) {
      for (const conv of convertedRequests) {
        try {
          await updateRequestInFirestore(conv.id, {
            isOverCapacity: conv.isOverCapacity,
            overCapacityAmount: conv.overCapacityAmount,
          });
        } catch (e) {
          console.error(`Failed to sync reconciled request ${conv.id} to Firestore:`, e);
        }
      }
    }

    // Sync to Firestore
    try {
      await saveQuarterToFirestore(updatedQuarter);
    } catch (e) {
      console.error('Failed to sync quarter setting to Firestore:', e);
    }

    if (convertedRequests.length > 0) {
      showToast(
        `${updatedQuarter.name} 총 제작 가능 일수가 ${updatedQuarter.totalDays}일로 변경되었으며, ${convertedRequests.length}건이 일반 접수로 자동 변경되었습니다.`,
        'success'
      );
    } else {
      showToast(
        `${updatedQuarter.name}의 총 제작 가능 일수가 ${updatedQuarter.totalDays}일로 변경되었습니다.`,
        'success'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#6CA3CF] sm:p-4 lg:p-6 flex flex-col font-sans">
      <div className="flex-1 w-full max-w-[1380px] mx-auto bg-[#F4EEE2] text-[#181715] flex flex-col shadow-[0_24px_60px_rgba(24,23,21,0.14)] border border-[#181715]/15">
        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10 space-y-10">
          {/* Toast Alert */}
          {toastMessage && (
            <div
              className={`p-3.5 rounded-[3px] border flex items-center justify-between text-xs font-semibold transition-all ${
                toastMessage.type === 'warning'
                  ? 'bg-[#E94B22] border-[#181715]/20 text-white'
                  : toastMessage.type === 'info'
                  ? 'bg-[#181715] border-[#181715] text-[#EAE2D3]'
                  : 'bg-[#4F8A6B] border-[#181715]/20 text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {toastMessage.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                ) : toastMessage.type === 'info' ? (
                  <Info className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="ml-3 opacity-80 hover:opacity-100 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Capacity Dashboard */}
          <CapacityDashboard
            summary={capacitySummary}
            onOpenQuarterSettings={handleOpenQuarterSettings}
            onOpenCategoryGuide={() => setIsCategoryGuideOpen(true)}
            onOpenCalendar={() => setActiveTab('calendar')}
            onOpenTable={() => setActiveTab('table')}
            onToggleAdmin={handleToggleAdmin}
            activeTab={activeTab}
            isAdmin={isAdmin}
          />

          {/* Dynamic Views: Table (default) or Calendar (Admin only) */}
          {activeTab === 'table' && (
            <section className="space-y-4 pt-4 border-t border-[#181715]/15">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#E94B22]">
                    REQUEST LOG
                  </span>
                  <h2 className="text-xl font-extrabold tracking-tight text-[#181715] mt-0.5">
                    {currentQuarter.name} 영상 제작 접수 목록
                  </h2>
                  <p className="font-mono text-xs text-[#5F5A52] mt-1 tabular-nums">
                    총 {quarterRequests.length}건 등록됨 · 초과 접수 {capacitySummary.overCapacityCount}건
                  </p>
                </div>
                <button
                  onClick={handleOpenNewRequest}
                  className="px-4 py-2 text-xs font-bold text-[#EAE2D3] bg-[#181715] rounded-[3px] hover:bg-[#E94B22] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>신규 접수하기</span>
                </button>
              </div>
              <RequestTable
                requests={quarterRequests}
                categories={categories}
                isAdmin={isAdmin}
                onDeleteRequest={handleDeleteRequest}
                onUpdateRequest={handleUpdateRequest}
                onExportCSV={handleExportCSV}
                onOpenNewRequest={handleOpenNewRequest}
              />
            </section>
          )}

          {/* Calendar Planner View */}
          {activeTab === 'calendar' && isAdmin && (
            <div className="pt-4 border-t border-[#181715]/15">
              <AdminCalendarPlanner
                requests={quarterRequests}
                categories={categories}
                onAssignRequestDate={handleAssignRequestDate}
                onUnassignRequest={handleUnassignRequest}
                onUpdateProducer={handleUpdateProducer}
                onOpenQuarterSettings={handleOpenQuarterSettings}
              />
            </div>
          )}
        </main>

        {/* New Request Modal Popup Window */}
        {isNewRequestModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-[#181715]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden"
            onClick={() => setIsNewRequestModalOpen(false)}
          >
            <div
              className="max-w-3xl w-full my-auto relative shadow-[0_24px_60px_rgba(24,23,21,0.3)] rounded-[4px] max-h-[82vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <RequestForm
                categories={categories}
                currentQuarter={currentQuarter}
                remainingDays={capacitySummary.remainingDays}
                onSubmit={(data) => {
                  handleCreateRequest(data);
                  setIsNewRequestModalOpen(false);
                }}
                onOpenCategoryGuide={() => setIsCategoryGuideOpen(true)}
                onCancel={() => setIsNewRequestModalOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Admin Mode PIN/Password Entry Modal */}
        {isAdminAuthModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-[#181715]/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setIsAdminAuthModalOpen(false)}
          >
            <div
              className="bg-[#FAF7F0] rounded-[4px] shadow-2xl max-w-sm w-full p-5 border border-[#181715]/20 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[#181715]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#E94B22] shrink-0" />
                  <h3 className="text-sm font-bold">관리자 모드 활성화</h3>
                </div>
                <p className="text-[11px] text-[#5F5A52] mt-1">
                  일정 달력 배정 및 접수 삭제/수정 권한을 활성화합니다.
                </p>
              </div>

              <form onSubmit={handleConfirmAdmin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#181715] mb-1">
                    관리자 비밀번호
                  </label>
                  <input
                    type="password"
                    autoFocus
                    placeholder="관리자 비밀번호 입력"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full text-xs rounded-[3px] border border-[#181715]/25 bg-white p-2.5 focus:border-[#181715] focus:outline-none"
                    required
                  />
                  {adminPasswordError && (
                    <p className="text-[11px] text-[#E94B22] font-semibold mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{adminPasswordError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#181715]/10">
                  <button
                    type="button"
                    onClick={() => setIsAdminAuthModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs text-[#5F5A52] hover:text-[#181715] rounded-[3px] hover:bg-[#EAE2D3] transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-[#EAE2D3] bg-[#181715] hover:bg-[#E94B22] hover:text-white rounded-[3px] transition-colors cursor-pointer"
                  >
                    관리자 모드 실행
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Reference Standard Guide Modal */}
        <CategoryReferenceModal
          isOpen={isCategoryGuideOpen}
          onClose={() => setIsCategoryGuideOpen(false)}
          categories={categories}
          onUpdateCategories={handleUpdateCategories}
        />

        {/* Quarter Settings Modal (Admin) */}
        <QuarterSettingsModal
          isOpen={isQuarterSettingsOpen && isAdmin}
          onClose={() => setIsQuarterSettingsOpen(false)}
          quarters={quarters}
          currentQuarterId={currentQuarterId}
          capacitySummary={capacitySummary}
          onUpdateQuarter={handleUpdateQuarter}
          onSelectQuarter={(qId) => setCurrentQuarterId(qId)}
        />
      </div>
    </div>
  );
}
