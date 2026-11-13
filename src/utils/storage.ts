import { INITIAL_CATEGORIES, INITIAL_QUARTERS } from '../data/categories';
import { INITIAL_REQUESTS } from '../data/mockRequests';
import { CapacitySummary, MajorCategory, QuarterConfig, VideoRequest } from '../types';

const REQUESTS_STORAGE_KEY = 'video_production_requests_v3';
const QUARTERS_STORAGE_KEY = 'video_production_quarters_v3';
const CATEGORIES_STORAGE_KEY = 'video_production_categories_v3';

export function getStoredRequests(): VideoRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load requests from localStorage:', err);
    return INITIAL_REQUESTS;
  }
}

export function saveRequests(requests: VideoRequest[]): void {
  try {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save requests to localStorage:', err);
  }
}

export function getStoredQuarters(): QuarterConfig[] {
  try {
    const raw = localStorage.getItem(QUARTERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(QUARTERS_STORAGE_KEY, JSON.stringify(INITIAL_QUARTERS));
      return INITIAL_QUARTERS;
    }
    const parsed: QuarterConfig[] = JSON.parse(raw);
    return parsed.map((q) => {
      const workingDays = q.workingDays ?? 60;
      const multiplier = q.multiplier ?? 4.5;
      const baseCapacityDays = q.baseCapacityDays ?? Math.round(workingDays * multiplier);
      const memberDeductions =
        q.memberDeductions && q.memberDeductions.length > 0
          ? q.memberDeductions
          : INITIAL_QUARTERS[0]?.memberDeductions || [
              { name: '민규', adminDays: 30, vacationDays: 15 },
              { name: '신혜', adminDays: 30, vacationDays: 15 },
              { name: '유진', adminDays: 25, vacationDays: 15 },
              { name: '승아', adminDays: 25, vacationDays: 15 },
              { name: '외주', adminDays: 40, vacationDays: 0 },
            ];
      const totalDeductions = memberDeductions.reduce(
        (sum, m) => sum + (Number(m.adminDays) || 0) + (Number(m.vacationDays) || 0),
        0
      );
      const totalDays = typeof q.totalDays === 'number'
        ? q.totalDays
        : Math.max(0, baseCapacityDays - totalDeductions);

      return {
        ...q,
        workingDays,
        multiplier,
        baseCapacityDays,
        totalDeductionDays: totalDeductions,
        memberDeductions,
        totalDays,
      };
    });
  } catch (err) {
    console.error('Failed to load quarters from localStorage:', err);
    return INITIAL_QUARTERS;
  }
}

export function saveQuarters(quarters: QuarterConfig[]): void {
  try {
    localStorage.setItem(QUARTERS_STORAGE_KEY, JSON.stringify(quarters));
  } catch (err) {
    console.error('Failed to save quarters to localStorage:', err);
  }
}

export function getStoredCategories(): MajorCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load categories from localStorage:', err);
    return INITIAL_CATEGORIES;
  }
}

export function saveCategories(categories: MajorCategory[]): void {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories to localStorage:', err);
  }
}

export function resetAllData(): { requests: VideoRequest[]; quarters: QuarterConfig[]; categories: MajorCategory[] } {
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(QUARTERS_STORAGE_KEY, JSON.stringify(INITIAL_QUARTERS));
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
  return {
    requests: INITIAL_REQUESTS,
    quarters: INITIAL_QUARTERS,
    categories: INITIAL_CATEGORIES,
  };
}

export function getRequestSequence(req: VideoRequest): number {
  if (req.id) {
    const match = req.id.match(/(\d+)$/);
    if (match) return parseInt(match[1], 10);
  }
  const t = req.createdAt ? new Date(req.createdAt).getTime() : 0;
  return isNaN(t) ? 0 : t;
}

export function sortRequestsByRegistrationOrder(
  requests: VideoRequest[],
  order: 'asc' | 'desc' = 'asc'
): VideoRequest[] {
  return [...requests].sort((a, b) => {
    const seqA = getRequestSequence(a);
    const seqB = getRequestSequence(b);
    if (seqA !== seqB) {
      return order === 'desc' ? seqB - seqA : seqA - seqB;
    }
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) {
      return order === 'desc' ? timeB - timeA : timeA - timeB;
    }
    return order === 'desc' ? (b.id || '').localeCompare(a.id || '') : (a.id || '').localeCompare(b.id || '');
  });
}

/**
 * Calculates current quarter capacity breakdown
 */
export function calculateCapacitySummary(
  requests: VideoRequest[],
  quarter: QuarterConfig
): CapacitySummary {
  const quarterRequests = requests.filter((r) => r.quarter === quarter.id && r.status !== '반려');
  
  // Sum up all required days (rounded to integer)
  const totalAllocated = Math.round(quarterRequests.reduce((sum, r) => sum + (Number(r.requiredDays) || 0), 0));
  
  // When over capacity, remainingDays is negative (e.g. -3)
  const remaining = quarter.totalDays - totalAllocated;
  const overCapacityAmount = Math.max(0, totalAllocated - quarter.totalDays);
  
  const overCapacityList = quarterRequests.filter((r) => r.isOverCapacity);
  
  const utilization = quarter.totalDays > 0 ? (totalAllocated / quarter.totalDays) * 100 : 0;

  return {
    quarter,
    totalDays: quarter.totalDays,
    allocatedDays: totalAllocated,
    remainingDays: remaining,
    utilizationRate: Math.round(utilization),
    totalRequestsCount: quarterRequests.length,
    overCapacityCount: overCapacityList.length,
    totalOverCapacityDays: overCapacityAmount,
  };
}

/**
 * Reconciles requests' over-capacity status strictly in chronological registration order.
 * - Requests within totalDays are normal (isOverCapacity: false).
 * - Requests that push accumulated days beyond totalDays (or are registered while over capacity)
 *   are automatically marked as over-capacity (isOverCapacity: true).
 * - If an earlier request is deleted or reduced, freeing up capacity, subsequent over-capacity requests
 *   that now fit within totalDays are automatically converted to normal requests.
 */
export function reconcileOverCapacityRequests(
  requests: VideoRequest[],
  quarters: QuarterConfig[]
): {
  updatedRequests: VideoRequest[];
  convertedRequests: VideoRequest[];
} {
  const convertedRequests: VideoRequest[] = [];
  const quartersMap = new Map(quarters.map((q) => [q.id, q]));

  // Group requests by quarter
  const requestsByQuarter = new Map<string, VideoRequest[]>();
  for (const r of requests) {
    const list = requestsByQuarter.get(r.quarter) || [];
    list.push(r);
    requestsByQuarter.set(r.quarter, list);
  }

  const updatedRequestsMap = new Map<string, VideoRequest>();

  for (const [quarterId, qReqs] of requestsByQuarter.entries()) {
    const quarter = quartersMap.get(quarterId);
    const totalDays = quarter ? quarter.totalDays : 60;

    // Sort strictly in registration order (오래된 순: 1번부터 오름차순)
    const sorted = sortRequestsByRegistrationOrder(qReqs, 'asc');

    let accumulatedDays = 0;

    for (const req of sorted) {
      // Rejected requests ('반려') do not consume quarter capacity
      if (req.status === '반려') {
        const cleaned: VideoRequest = {
          ...req,
          isOverCapacity: false,
          overCapacityAmount: 0,
        };
        updatedRequestsMap.set(req.id, cleaned);
        continue;
      }

      const reqDays = Number(req.requiredDays) || 0;
      const nextAccumulated = accumulatedDays + reqDays;

      if (nextAccumulated <= totalDays) {
        // Fits within the quarter's available capacity!
        if (req.isOverCapacity) {
          // Converted from over-capacity to normal request
          const converted: VideoRequest = {
            ...req,
            isOverCapacity: false,
            overCapacityAmount: 0,
          };
          convertedRequests.push(converted);
          updatedRequestsMap.set(req.id, converted);
        } else {
          updatedRequestsMap.set(req.id, req);
        }
        accumulatedDays = nextAccumulated;
      } else {
        // Exceeds total capacity! Must be marked as over-capacity
        const overAmount = Math.max(1, nextAccumulated - totalDays);
        const updated: VideoRequest = {
          ...req,
          isOverCapacity: true,
          overCapacityAmount: overAmount,
        };
        if (!req.isOverCapacity) {
          convertedRequests.push(updated);
        }
        updatedRequestsMap.set(req.id, updated);
        accumulatedDays = nextAccumulated;
      }
    }
  }

  const updatedRequests = requests.map((r) => updatedRequestsMap.get(r.id) || r);

  return {
    updatedRequests,
    convertedRequests,
  };
}

/**
 * Export requests to CSV with UTF-8 BOM
 */
export function exportRequestsToCSV(requests: VideoRequest[], quarterName: string): void {
  const headers = [
    '접수ID',
    '분기',
    '본부',
    '팀',
    '담당자',
    '대분류',
    '소분류',
    '업무명',
    '산정소요일(일)',
    '희망완료일',
    '화면비율',
    '초과접수여부',
    '상태',
    '접수일시',
    '상세요청내용'
  ];

  const rows = requests.map((r) => [
    r.id,
    r.quarter,
    `"${r.headquarters.replace(/"/g, '""')}"`,
    `"${r.team.replace(/"/g, '""')}"`,
    `"${r.requesterName.replace(/"/g, '""')}"`,
    `"${(r.requesterContact || '').replace(/"/g, '""')}"`,
    `"${r.majorCategory.replace(/"/g, '""')}"`,
    `"${r.subCategory.replace(/"/g, '""')}"`,
    `"${r.taskName.replace(/"/g, '""')}"`,
    r.requiredDays,
    r.dueDate,
    `"${(r.aspectRatio || '').replace(/"/g, '""')}"`,
    r.isOverCapacity ? '초과접수' : '정상접수',
    r.status,
    new Date(r.createdAt).toLocaleString('ko-KR'),
    `"${(r.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `영상제작접수_${quarterName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
