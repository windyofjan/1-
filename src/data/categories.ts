import { MajorCategory, QuarterConfig } from '../types';

export const INITIAL_CATEGORIES: MajorCategory[] = [
  {
    id: 'campaign',
    name: '캠페인',
    example: '국내 / 해외 캠페인 Global 6K, Give a nice day, 초즌 등',
    description: '국내외 모금/옹호 캠페인 영상 기획, 편집, 종편 및 파생 규격 제작',
    subcategories: [
      {
        id: 'camp_main',
        name: '메인편 편집+종편+음향',
        defaultDays: 20,
        description: '캠페인 메인 본편 영상 편집, 종합편집(색보정/2D자막), 오디오 믹싱 마스터링',
        deliverables: '메인 마스터 영상'
      },
      {
        id: 'camp_report',
        name: '결과보고 편집+종편+음향',
        defaultDays: 15,
        description: '캠페인 성과 및 집행 결과보고 영상 편집, 종편, 사운드 믹스',
        deliverables: '결과보고 영상'
      },
      {
        id: 'camp_add_comp',
        name: '구성 추가',
        defaultDays: 5,
        description: '기존 메인 영상 기반 서브 스토리 또는 추가 씬/인터뷰 구성 변형',
        deliverables: '추가 구성 버전'
      },
      {
        id: 'camp_add_size',
        name: '사이즈 추가',
        defaultDays: 3,
        description: '9:16 세로형 숏폼/릴스 또는 1:1 정방형 등 추가 화면 비율 리사이징',
        deliverables: '추가 비율 파생본'
      },
      {
        id: 'camp_add_number',
        name: '번호고지 추가',
        defaultDays: 1,
        description: '후원 안내 ARS 번호, 계좌번호, QR코드 등 엔딩/로어써드 고지 추가',
        deliverables: '번호고지 적용본'
      },
      {
        id: 'camp_shooting',
        name: '촬영',
        defaultDays: 1,
        description: '캠페인 관련 현장 추가 촬영 (1일 기준)',
        deliverables: '촬영 원본 소스'
      }
    ]
  },
  {
    id: 'pr_video',
    name: '홍보영상',
    example: '기관 브랜드/사업 홍보영상',
    description: '기관 브랜드 및 중점 사업 홍보를 위한 풀 프로덕션 및 외주 조율',
    subcategories: [
      {
        id: 'pr_full_prod',
        name: '기획+구성+편집+모션+종편+음향',
        defaultDays: 30,
        description: '사전 기획, 콘티 구성, 종합 편집, 2D 모션그래픽, 종편 및 음향 마스터링 풀 패키지',
        deliverables: '홍보 마스터 필름'
      },
      {
        id: 'pr_outsource_coordination',
        name: '홍보영상 외주조율',
        defaultDays: 10,
        description: '외부 프로덕션 선정, 콘티/가편집본 감수, 피드백 조율 및 최종 납품 검수',
        deliverables: '외주 제작 관리 및 검수'
      },
      {
        id: 'pr_add_comp',
        name: '구성 추가',
        defaultDays: 5,
        description: '기관 홍보영상 타깃별(후원자/기업/일반) 서브 구성 추가 편집',
        deliverables: '서브 구성 버전'
      },
      {
        id: 'pr_add_size',
        name: '사이즈 추가',
        defaultDays: 3,
        description: 'SNS 및 옥외 전광판, 세로형 디스플레이 맞춤 사이즈 추가 제작',
        deliverables: '파생 사이즈 에셋'
      },
      {
        id: 'pr_shooting',
        name: '촬영',
        defaultDays: 1,
        description: '브랜드/사업 홍보 관련 인터뷰 및 스케치 촬영 (1일 기준)',
        deliverables: '촬영 원본 소스'
      }
    ]
  },
  {
    id: 'project_report',
    name: '사업 결과보고',
    example: 'PNS / 고액 / 기업 등',
    description: 'PNS(파트너십/특정사업), 고액 후원자 및 기업 사회공헌 결과보고 영상',
    subcategories: [
      {
        id: 'proj_edit_master',
        name: '편집+종편+음향',
        defaultDays: 15,
        description: '사업 현장 소스 정리, 타임라인 컷편집, 성과 자막 및 종편, 음향 믹싱',
        deliverables: '결과보고 마스터 영상'
      },
      {
        id: 'proj_motion_outsource',
        name: '모션 외주조율',
        defaultDays: 3,
        description: '데이터 시각화 및 인포그래픽 모션 외주 조율 및 납품 검수',
        deliverables: '외주 모션 에셋 적용'
      },
      {
        id: 'proj_shooting',
        name: '촬영',
        defaultDays: 1,
        description: '결과보고용 현장 취재 및 인터뷰 촬영 (1일 기준)',
        deliverables: '촬영 원본 소스'
      }
    ]
  },
  {
    id: 'event',
    name: '행사',
    example: '고액후원 행사 등',
    description: '후원자의 밤, 고액 기부자 예우 행사, 기념식 등 오프라인 행사 영상',
    subcategories: [
      {
        id: 'event_edit_master',
        name: '편집+종편+음향',
        defaultDays: 15,
        description: '행사 현장 종합 스케치, 주요 인사 발언 자막, 하이라이트 편집, 사운드 믹스',
        deliverables: '행사 스케치 마스터'
      },
      {
        id: 'event_add_comp',
        name: '구성 추가',
        defaultDays: 5,
        description: 'VIP 배포용 숏 클립 또는 특정 프로그램별 추가 챕터 구성',
        deliverables: '추가 구성 클립'
      },
      {
        id: 'event_add_size',
        name: '사이즈 추가',
        defaultDays: 3,
        description: '인스타그램 릴스 등 모바일 세로형 리사이징',
        deliverables: '세로형/정방형 에셋'
      },
      {
        id: 'event_shooting',
        name: '촬영',
        defaultDays: 1,
        description: '행사 현장 스케치 및 현장 인터뷰 당일 촬영 (1일 기준)',
        deliverables: '행사 촬영 원본'
      }
    ]
  },
  {
    id: 'external_edu',
    name: '외부교육',
    example: '세계시민교육 등',
    description: '학교, 기관, 후원자 대상 세계시민교육 및 외부 공개 교육 콘텐츠',
    subcategories: [
      {
        id: 'ext_edit_motion_master',
        name: '편집+모션+종편+음향',
        defaultDays: 25,
        description: '강의/교재 기반 풀 모션그래픽, 교육용 시각자료 애니메이션, 편집 및 음향',
        deliverables: '외부교육 풀패키지 영상'
      },
      {
        id: 'ext_edit_master',
        name: '편집+종편+음향',
        defaultDays: 15,
        description: '강의/현장 영상 컷편집, 키워드 자막, 종편 및 오디오 노멀라이징',
        deliverables: '교육 영상 편집본'
      },
      {
        id: 'ext_add_size',
        name: '사이즈 추가',
        defaultDays: 3,
        description: '온라인 강의 플랫폼 및 모바일 시청 맞춤 화면비율 변환',
        deliverables: '추가 사이즈 버전'
      },
      {
        id: 'ext_shooting',
        name: '촬영',
        defaultDays: 1,
        description: '강사 강의 스튜디오 촬영 또는 교육 현장 촬영 (1일 기준)',
        deliverables: '촬영 원본'
      }
    ]
  },
  {
    id: 'internal_use',
    name: '내부용',
    example: '직원 교육용 전략 관련 영상 등',
    description: '전사 타운홀 미팅, 직원 교육, 기관 중장기 전략 공유 및 사내 소통 영상',
    subcategories: [
      {
        id: 'int_edit_motion_master',
        name: '편집+모션+종편+음향',
        defaultDays: 25,
        description: '전략 핵심 지표 인포그래픽, 모션 타이포, 기획 편집 및 사운드 마스터링',
        deliverables: '사내 전략 교육 마스터'
      },
      {
        id: 'int_edit_master',
        name: '편집+종편+음향',
        defaultDays: 15,
        description: '임직원 인터뷰, 발표 세션 타임라인 편집, 자막 및 종편 작업',
        deliverables: '사내용 편집 영상'
      },
      {
        id: 'int_shooting',
        name: '촬영',
        defaultDays: 1,
        description: '임직원 인터뷰 및 사내 행사 현장 촬영 (1일 기준)',
        deliverables: '사내 촬영 원본'
      }
    ]
  },
  {
    id: 're_editing',
    name: '재편집',
    example: '기존에 완성된 영상 재편집',
    description: '기존 완성본 영상의 자막 변경, 컷 재구성, 모션 추가 및 비율 변환',
    subcategories: [
      {
        id: 're_edit_subtitle_motion_sound',
        name: '재편집+자막+모션+음향',
        defaultDays: 15,
        description: '기존 마스터 영상 전면 재구성, 신규 모션그래픽 삽입, 자막 교체 및 음향 재작업',
        deliverables: '전면 리뉴얼 재편집본'
      },
      {
        id: 're_edit_subtitle_sound',
        name: '재편집+자막+음향',
        defaultDays: 10,
        description: '타임라인 재편집, 전체 자막 디자인 변경/오타 수정, BGM 재싱크',
        deliverables: '부분 수정 재편집본'
      },
      {
        id: 're_add_size',
        name: '사이즈 추가',
        defaultDays: 3,
        description: '기존 완성 영상을 9:16 세로형 숏폼 또는 타 플랫폼 규격으로 리프레이밍',
        deliverables: '사이즈 변환본'
      },
      {
        id: 're_simple_sub_cut',
        name: '자막만 / 컷 삭제 / 영상 연결',
        defaultDays: 2,
        description: '단순 텍스트 자막 수정, 불필요한 구간 컷 삭제, 2개 이상 영상 단순 이어붙이기',
        deliverables: '단순 수정본'
      }
    ]
  },
  {
    id: 'greeting_speech',
    name: '인사말 촬영',
    example: '회장님 인사말 영상',
    description: '회장님/이사장님/대표자 기념 인사말, 대외 축사 및 메시지 영상',
    subcategories: [
      {
        id: 'greet_full_package',
        name: '촬영+편집+자막+음향',
        defaultDays: 10,
        description: '프롬프터 및 조명/마이크 세팅 촬영, NG컷 정리, 공식 자막바, 배경음악 믹싱',
        deliverables: '인사말 완성 영상'
      },
      {
        id: 'greet_shoot_sub_sound',
        name: '촬영+자막+음향',
        defaultDays: 5,
        description: '원테이크 인사말 촬영, 기본 자막 삽입 및 오디오 정제',
        deliverables: '인사말 기본 편집본'
      },
      {
        id: 'greet_shoot_only',
        name: '촬영',
        defaultDays: 1,
        description: '인사말 단독 촬영 지원 (1일 기준)',
        deliverables: '촬영 원본'
      }
    ]
  },
  {
    id: 'asset_request',
    name: '영상 자료 요청',
    example: '자료 요청, 저장, 영상 링크 생성',
    description: '아카이브 소스 검색/제공, 완료 영상 DB 입고 및 스트리밍 링크 발급',
    subcategories: [
      {
        id: 'asset_search_provide',
        name: '자료 검색 및 제공',
        defaultDays: 5,
        description: '해외 사업장 및 국내 아카이브 서버에서 요청 키워드 영상 소스 검색 및 변환 제공',
        deliverables: '요청 영상 소스 파일'
      },
      {
        id: 'asset_db_intake',
        name: '영상 DB 입고',
        defaultDays: 2,
        description: '제작 완료된 마스터 및 클린본 영상 메타데이터 정리 및 아카이브 스토리지 입고',
        deliverables: 'DB 등록 및 관리'
      },
      {
        id: 'asset_vimeo_link',
        name: 'Vimeo 링크 생성',
        defaultDays: 2,
        description: '비메오(Vimeo) 고화질 업로드, 접근 권한/비밀번호 설정 및 임베드 링크 생성',
        deliverables: 'Vimeo 스트리밍 링크'
      }
    ]
  }
];

export const INITIAL_QUARTERS: QuarterConfig[] = [
  {
    id: '2027-Q1',
    name: '2027년 1분기 (1월~3월)',
    totalDays: 60,
    startDate: '2027-01-01',
    endDate: '2027-03-31',
    workingDays: 60,
    multiplier: 4.5,
    baseCapacityDays: 270,
    totalDeductionDays: 210,
    memberDeductions: [
      { name: '민규', adminDays: 30, vacationDays: 15 },
      { name: '신혜', adminDays: 30, vacationDays: 15 },
      { name: '유진', adminDays: 25, vacationDays: 15 },
      { name: '승아', adminDays: 25, vacationDays: 15 },
      { name: '외주', adminDays: 40, vacationDays: 0 },
    ],
  }
];

export const PRESET_ORGANIZATIONS = [
  {
    headquarters: '마케팅본부',
    teams: ['브랜드마케팅팀', '캠페인운영팀', '디지털콘텐츠팀', '미디어홍보팀']
  },
  {
    headquarters: '나눔사업본부',
    teams: ['국내사업기획팀', '글로벌사업1팀', '글로벌사업2팀', '긴급구호팀']
  },
  {
    headquarters: '모금기획본부',
    teams: ['후원자개발팀', '기업협력팀', '디지털모금팀', '메이저기부팀']
  },
  {
    headquarters: '후원서비스본부',
    teams: ['후원자경험(CX)팀', '데이터인사이트팀', '커뮤니케이션센터']
  },
  {
    headquarters: '경영지원본부',
    teams: ['전략기획팀', '인재개발팀', '총무자산팀', 'IT인프라팀']
  }
];
