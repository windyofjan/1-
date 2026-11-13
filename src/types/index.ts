export interface Subcategory {
  id: string;
  name: string;
  defaultDays: number;
  description: string;
  deliverables?: string;
}

export interface MajorCategory {
  id: string;
  name: string;
  example?: string;
  description?: string;
  subcategories: Subcategory[];
}

export type RequestStatus = '접수완료' | '일정협의' | '제작승인' | '제작진행' | '완료' | '반려';

export interface VideoRequest {
  id: string;
  quarter: string; // e.g. '2026-Q1'
  headquarters: string; // 본부
  team: string; // 팀
  requesterName: string; // 담당자 이름
  requesterContact?: string; // 연락처 / 이메일
  majorCategory: string; // 대분류
  subCategory: string; // 소분류
  taskName: string; // 업무명
  requiredDays: number; // 업무 소요일 (대·소분류 기반 자동 산정)
  dueDate: string; // 희망 완료일
  password?: string; // 작성자 수정 비밀번호
  aspectRatio?: string; // 화면비율 (16:9 가로, 9:16 세로 숏폼 등)
  targetLength?: string; // 영상 분량
  notes?: string; // 상세 요청사항 및 레퍼런스 링크
  status: RequestStatus;
  createdAt: string;
  isOverCapacity: boolean; // 제작 가능 일수 전액 소진/초과 상태에서 등록 여부 (붉은색 표시)
  overCapacityAmount?: number; // 초과된 일수
  remainingDaysSnapshot?: number; // 접수 시점 잔여 가용 일수
  assignedStartDate?: string; // 2027년 1분기 달력 배정 시작일 (YYYY-MM-DD)
  assignedEndDate?: string; // 달력 배정 종료일 (YYYY-MM-DD)
  assignedProducer?: string; // 배정 담당자 (선택)
}

export interface MemberDeduction {
  id?: string;
  name: string; // '민규', '신혜', '유진', '승아', '외주' 등
  adminDays: number; // 행정업무 일수
  vacationDays: number; // 휴가 일정 일수
  note?: string; // 비고
}

export interface QuarterConfig {
  id: string; // e.g. '2027-Q1'
  name: string; // '2027년 1분기'
  totalDays: number; // 총 제작 가능 일수 (최종 계산 결과)
  startDate: string;
  endDate: string;
  description?: string;
  workingDays?: number; // 분기 워킹데이 수 (기본 60일)
  multiplier?: number; // 기준 인원/가중치 배수 (기본 4.5)
  baseCapacityDays?: number; // 기본 가용 일수 (workingDays * multiplier)
  totalDeductionDays?: number; // 총 차감 일수 (∑ 행정 + 휴가)
  memberDeductions?: MemberDeduction[]; // 담당자별 행정업무 및 휴가 일정 차감 내역
}

export interface CapacitySummary {
  quarter: QuarterConfig;
  totalDays: number;
  allocatedDays: number;
  remainingDays: number;
  utilizationRate: number;
  totalRequestsCount: number;
  overCapacityCount: number;
  totalOverCapacityDays: number;
}
