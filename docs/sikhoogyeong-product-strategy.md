# 식후경 제품·UX·기술·사업 설계서

## 1. 서비스 개요

### 1.1 한 줄 정의

**식후경**은 단체 모임의 **일정 조율 → 참석 확정 → 차수별 기록 → 더치페이 정산 → 최소 송금 경로 → 히스토리 관리**를 하나의 링크 기반 모바일 웹 흐름으로 연결하는 **Group Operating System**이다.

### 1.2 핵심 가치 제안

- **핵심 가치:** “모임장이 카카오톡에서 더 이상 계산기 두드리지 않게 만든다.”
- **슬로건:** “누가 왔고, 어디 갔고, 얼마 냈는지 자동 정리”
- **핵심 고객:** 동아리장, 스터디장, 러닝크루 운영자, 프로젝트 리더, 총무.
- **초기 채널:** 카카오톡 단체방에 공유되는 초대 링크.
- **초기 디바이스:** 앱 설치 없는 모바일 웹/PWA.

### 1.3 제품 포지셔닝

| 구분 | 기존 일정 조율 | 기존 더치페이 | 식후경 |
|---|---|---|---|
| 주 사용 시점 | 모임 전 | 모임 후 | 모임 전·중·후 전체 |
| 핵심 객체 | 시간 후보 | 비용 | 그룹, 이벤트, 참석자, 차수, 비용, 정산 |
| 반복 모임 히스토리 | 약함 | 일부 가능 | 그룹 단위 누적 관리 |
| 한국식 1차/2차/n차 | 없음 | 제한적 | 핵심 구조로 지원 |
| 카카오톡 운영 흐름 | 보조 | 보조 | 링크 공유를 기본 진입점으로 설계 |

### 1.4 경쟁 서비스 관찰 요약

2026년 5월 기준 공개 자료를 바탕으로 보면 Doodle은 그룹 투표, 마감, 리마인더, 캘린더 초대 중심의 회의 일정 조율에 강하고, Splitwise는 그룹 비용, 균등/비균등 분할, 부채 단순화, 정산 기록에 강하다. 카카오페이는 카카오톡 대화방 맥락에서 정산 요청과 송금 접근성이 강하다. 반면 이들 모두가 **반복 모임 운영 히스토리와 한국식 차수별 참석자 구조**를 하나의 기본 모델로 제공하지는 않는다.

참고한 공개 자료:

- Doodle 공식 기능 페이지: 그룹 투표, 마감, 자동 리마인더, 캘린더 초대.
- Doodle 도움말: Group Poll에서 복수 소요시간 후보를 제안할 수 있으나 최종 선택은 하나의 옵션 중심.
- Splitwise 공식 페이지: 그룹 비용, 균등/비균등 분할, 부채 단순화, 정산 기록, Pro 기능.
- WhenToMeet 공개 페이지: 간단한 가능 시간 입력과 공통 가능 시간 탐색.
- 카카오페이 송금 공식 페이지: 카카오톡 채팅방에서 모임비 정산 요청과 송금.

---

## 2. 문제 정의

### 2.1 문제 1 — 일정 조율의 비효율

카카오톡 단체방에서 “언제 돼?”를 물으면 다음 문제가 생긴다.

- 대답 형식이 제각각이다.
- 가능한 시간과 애매한 시간을 분리하기 어렵다.
- 핵심 인원이 가능한지 한눈에 보이지 않는다.
- 최종 확정 후에도 다시 공지, 캘린더 저장, 참석자 확인을 반복해야 한다.

### 2.2 문제 2 — 반복 모임 관리의 어려움

동아리, 스터디, 크루, 연구팀은 한 번의 약속이 아니라 **연속적인 운영 단위**다.

- 누가 꾸준히 참석하는지 모른다.
- 어떤 장소를 자주 갔는지 사라진다.
- 누적 지출과 미정산자가 카카오톡 공지 속에 묻힌다.
- 운영진 인수인계 시 모임 데이터가 남지 않는다.

### 2.3 문제 3 — 현실적인 더치페이의 복잡성

한국식 모임은 한 번의 영수증으로 끝나지 않는다.

- 1차, 2차, 3차 참석자가 다르다.
- 중간 합류, 조기 귀가, 술 제외, 부분 부담이 존재한다.
- 결제자가 여러 명일 수 있다.
- 회비, 쿠폰, 선결제, 현장 현금이 섞인다.
- 최종적으로는 “그래서 누가 누구에게 얼마 보내?”만 필요하다.

### 2.4 문제 4 — 모임장의 운영 피로도

가장 큰 pain point는 일반 참석자가 아니라 **운영자/총무**에게 집중된다.

- 일정 투표 링크 만들기.
- 미응답자 독촉.
- 참석자 변경 반영.
- 차수별 결제자와 참석자 확인.
- 송금 요청 메시지 작성.
- 미정산자 추적.

식후경의 제품 목표는 “참석자 편의”보다 먼저 **모임장의 운영 생산성 향상**이다.

---

## 3. 사용자 시나리오

### 3.1 핵심 페르소나

#### 페르소나 A — 대학 동아리 총무

- 23세, 동아리 회식과 MT 뒤풀이를 관리한다.
- 매달 정기 모임이 있고 참석 인원이 바뀐다.
- 카카오톡으로 정산 요청을 올리지만 미정산 추적이 힘들다.

#### 페르소나 B — 스터디장

- 27세, 취업 스터디 주 1회 모임을 운영한다.
- 매번 가능한 요일이 달라 일정을 조율한다.
- 회식은 가끔 있지만 참석률과 스터디 참여 기록이 중요하다.

#### 페르소나 C — 러닝크루 운영자

- 30세, 주말 러닝과 뒤풀이를 운영한다.
- 참석자는 많지만 실제 뒤풀이 참석자는 일부다.
- 게스트 참여가 잦아 가입 없이 링크로 입력되는 흐름이 필요하다.

### 3.2 핵심 사용자 여정

1. 모임장이 카카오톡 단체방에 식후경 이벤트 링크를 공유한다.
2. 참석자는 로그인 없이 이름/전화번호 뒷자리 또는 카카오 소셜 로그인으로 가능 시간을 입력한다.
3. 식후경이 전원 가능, 핵심 인원 포함, 참석률, 선호도를 기준으로 추천 시간을 보여준다.
4. 모임장이 최종 시간과 장소를 확정한다.
5. 모임 당일 1차/2차/n차 참석자를 빠르게 체크하고 결제 금액과 결제자를 입력한다.
6. 식후경이 차수별 부담액과 개인별 순채권/순채무를 계산한다.
7. 최소 송금 경로를 생성하고 카카오톡 공유용 메시지를 만든다.
8. 참석자는 송금 완료를 체크하고, 모임장은 미정산자를 필터링한다.
9. 그룹 히스토리에 참석률, 총 지출, 자주 간 장소, 미정산 내역이 누적된다.

### 3.3 MVP의 “와우 모먼트”

> 1차 6명, 2차 4명, 3차 2명과 복수 결제자를 입력했더니 3초 만에 “민수 → 지민 18,000원” 같은 최종 송금표가 나온다.

---

## 4. 핵심 기능

### 4.1 그룹 생성

필수 기능:

- 그룹명.
- 설명.
- 그룹 이미지.
- 멤버 초대 링크.
- 반복 모임 여부.
- 역할: Owner, Admin, Member.
- 게스트 참여 허용 여부.

MVP 우선순위:

1. 그룹명/설명/초대 링크.
2. Owner/Admin/Member.
3. 그룹 이미지.
4. 반복 모임 여부.

### 4.2 이벤트 생성

필수 기능:

- 제목.
- 설명.
- 후보 날짜/시간.
- 장소 후보.
- 최대 인원.
- 투표 마감 시간.
- 공개/비공개 여부.

MVP 우선순위:

1. 제목과 후보 날짜/시간.
2. 투표 마감.
3. 장소 후보.
4. 최대 인원과 공개 범위.

### 4.3 가능 시간 입력

지원 기능:

- 날짜별 가능 여부.
- 시간대 드래그 UI.
- 가능/애매/불가능.
- 선호 시간 표시.
- 부분 가능 시간.

추천 기준:

1. 전원 가능.
2. 핵심 인원 포함 최대 참석.
3. 참석률 최대.
4. 선호도 평균 최대.
5. 반복 모임 패턴 고려.

### 4.4 모임 확정

지원 기능:

- 최종 시간 확정.
- 최종 장소 확정.
- 참석자 확정.
- 카카오톡 공유용 확정 메시지.
- 캘린더 저장 링크.
- 자동 알림.

MVP에서는 실제 푸시 알림 대신 카카오톡 공유 텍스트와 웹 알림 상태를 우선한다.

### 4.5 차수 기반 기록

각 차수는 독립 객체로 저장한다.

- 차수 번호: 1차, 2차, 3차.
- 장소.
- 참석자.
- 결제 금액.
- 결제자.
- 메모.
- 쿠폰/회비/할인 반영.

### 4.6 고급 더치페이

필수 지원:

- 차수별 참석자 분리.
- n분의 1.
- 일부 제외.
- 술 제외 옵션.
- 회비 차감.
- 부분 부담.
- 복수 결제자.
- 쿠폰 반영.
- 수동 수정.

MVP에서는 “차수별 참석자 + 복수 결제자 + 수동 조정”을 우선하고, 술 제외/회비/쿠폰은 조정 항목으로 단순화한다.

### 4.7 최소 송금 경로

목표:

- 개인별 정산 잔액을 먼저 계산한다.
- 받을 사람과 보낼 사람을 분리한다.
- 가장 큰 채권자와 가장 큰 채무자를 매칭한다.
- 송금 횟수를 최소화한다.

### 4.8 정산 상태 관리

필수 기능:

- 미정산.
- 송금 완료.
- 부분 송금.
- 독촉 메시지 생성.
- 정산 히스토리.

### 4.9 모임 히스토리

그룹 단위 지표:

- 최근 모임.
- 참석률.
- 총 지출.
- 개인별 누적 지출.
- 자주 간 장소.
- 미정산 금액.
- 모임 통계.

---

## 5. UX 흐름

### 5.1 UX 원칙

1. **카카오톡 링크가 제품의 홈 화면이다.** 사용자는 앱을 찾아 들어오지 않고 공유 링크로 들어온다.
2. **참석자는 30초 안에 입력을 끝내야 한다.** 이름 입력, 가능 시간 드래그, 제출까지 3단계 이하.
3. **모임장은 한 화면에서 결정을 내려야 한다.** 추천 시간, 핵심 인원 가능 여부, 미응답자를 동시에 보여준다.
4. **정산은 “계산 과정”보다 “최종 행동”이 중요하다.** 최종 송금표와 완료 체크를 최상단에 둔다.
5. **모바일 한 손 조작을 우선한다.** 하단 고정 CTA, 큰 터치 영역, 단계별 입력.

### 5.2 랜딩 페이지

주요 컴포넌트:

- 히어로 카피: “모임장님, 정산표는 식후경이 만들게요.”
- 3단계 데모: 일정 조율 → 차수 기록 → 최소 송금표.
- 한국식 차수 정산 예시 카드.
- 카카오톡 공유 흐름 미리보기.
- CTA: “무료로 모임 만들기”.

사용자 행동 흐름:

1. 문제 공감.
2. 예시 정산표 확인.
3. 그룹 생성으로 이동.

모바일 UX:

- 첫 화면에 CTA를 노출한다.
- 예시는 좌우 스와이프 카드로 제공한다.

### 5.3 그룹 생성 페이지

주요 컴포넌트:

- 그룹명 입력.
- 설명 입력.
- 이미지 업로드.
- 반복 모임 토글.
- 역할 안내.
- 초대 링크 생성 완료 모달.

핵심 CTA:

- “그룹 만들고 이벤트 생성하기”.

사용자 행동 흐름:

1. 그룹명 입력.
2. 반복 모임 여부 선택.
3. 생성 완료.
4. 이벤트 생성 또는 초대 링크 공유.

### 5.4 이벤트 생성 페이지

주요 컴포넌트:

- 이벤트 제목.
- 후보 날짜 선택 캘린더.
- 시간 범위 선택.
- 장소 후보 입력.
- 투표 마감 설정.
- 핵심 인원 선택.

핵심 CTA:

- “투표 링크 만들기”.

모바일 UX:

- 날짜 선택은 월간 캘린더보다 하단 시트형 날짜 칩을 우선한다.
- 시간 후보는 프리셋: 점심, 저녁, 주말 오후, 직접 설정.

### 5.5 시간 투표 페이지

주요 컴포넌트:

- 이름/간편 프로필.
- 날짜별 탭.
- 드래그 가능한 시간 그리드.
- 가능/애매/불가능 토글.
- 선호 표시 별표.
- 제출 CTA.

핵심 CTA:

- “내 가능 시간 제출”.

모바일 UX:

- 30분 단위 그리드.
- 긴 드래그보다 시작/끝 선택 보조 기능 제공.
- 제출 후 “카톡방에 완료했다고 알리기” 버튼 제공.

### 5.6 결과 추천 페이지

주요 컴포넌트:

- 추천 시간 Top 3.
- 참석 가능자/불가능자 리스트.
- 핵심 인원 포함 여부 배지.
- 미응답자 목록.
- 장소 후보 투표 결과.

핵심 CTA:

- “이 시간으로 확정”.

사용자 행동 흐름:

1. 추천 후보 확인.
2. 핵심 인원 포함 여부 확인.
3. 미응답자 독촉 또는 확정.
4. 확정 메시지 공유.

### 5.7 차수 기록 페이지

주요 컴포넌트:

- 차수 카드 리스트.
- “+ 차수 추가”.
- 참석자 체크리스트.
- 장소 입력.
- 총액 입력.
- 결제자/결제 금액 입력.
- 제외/조정 항목.

핵심 CTA:

- “정산 계산하기”.

모바일 UX:

- 기본값으로 이전 차수 참석자를 복사한다.
- 2차 생성 시 “1차 참석자 중 선택”을 먼저 보여준다.
- 금액 입력은 숫자 키패드를 강제한다.

### 5.8 정산 결과 페이지

주요 컴포넌트:

- 최종 송금표.
- 개인별 받을/낼 금액.
- 차수별 상세 계산 접기/펼치기.
- 송금 완료 체크박스.
- 부분 송금 입력.
- 독촉 메시지 복사.

핵심 CTA:

- “카카오톡에 정산표 공유”.

모바일 UX:

- 최상단에는 “누가 누구에게 얼마”만 보여준다.
- 상세 계산은 접어둔다.
- 각 송금 행에 완료 체크를 크게 둔다.

### 5.9 그룹 히스토리 페이지

주요 컴포넌트:

- 최근 이벤트 타임라인.
- 월별 총 지출.
- 참석률 랭킹.
- 미정산 현황.
- 자주 간 장소.
- 개인별 누적 지표.

핵심 CTA:

- “다음 모임 만들기”.

모바일 UX:

- 운영자에게 필요한 미정산 카드와 다음 모임 CTA를 상단에 둔다.

---

## 6. 시스템 아키텍처

### 6.1 전체 구조

```text
Mobile Web/PWA (Next.js)
        |
        | HTTPS / REST / Server Actions
        v
API Gateway / BFF Layer
        |
        v
Application Backend (NestJS or FastAPI)
        |
        +--> PostgreSQL: core relational data
        +--> Redis: sessions, rate limit, invite tokens, realtime fanout
        +--> Object Storage: group images, receipts in future
        +--> WebSocket/SSE: live voting and settlement status updates
        +--> Queue Worker: reminders, settlement nudges, analytics rollups
```

### 6.2 Frontend

추천:

- **Next.js + React + TypeScript.**
- **Tailwind CSS + shadcn/ui.**
- **PWA 지원.**

선택 이유:

- 모바일 웹 링크 공유가 핵심이므로 앱보다 웹 배포 속도가 중요하다.
- Next.js는 랜딩 SEO와 로그인 후 앱 영역을 함께 처리하기 좋다.
- TypeScript는 정산 계산처럼 오류 비용이 큰 도메인에 적합하다.
- Tailwind는 빠른 MVP UI 반복에 강하다.

### 6.3 Backend

추천 1안:

- **NestJS + TypeScript.**

선택 이유:

- 프론트엔드와 타입 언어를 통일할 수 있다.
- 모듈 구조가 Group, Event, Settlement 같은 도메인 분리에 적합하다.
- WebSocket, Queue, OpenAPI 문서화가 쉽다.

추천 2안:

- **FastAPI + Python.**

선택 이유:

- 알고리즘 실험과 데이터 분석에는 Python 생태계가 유리하다.
- 단, 프론트와 타입 공유가 약해 초기 풀스택 속도는 NestJS가 더 낫다.

결론:

- MVP는 **Next.js 풀스택 + PostgreSQL**로 시작해도 충분하다.
- 정산/추천 로직이 복잡해지면 **NestJS API 서버**로 분리한다.

### 6.4 Database

- **PostgreSQL**을 기본 DB로 사용한다.
- 관계형 데이터, 트랜잭션, 정산 정확성, JSONB 확장성을 모두 만족한다.
- 금액은 `integer` 원 단위로 저장해 부동소수점 오류를 피한다.

### 6.5 Realtime 구조

MVP:

- 투표 결과 새로고침 또는 짧은 polling.

Post-MVP:

- WebSocket 또는 Server-Sent Events.
- 시간 투표 결과, 미응답자, 정산 완료 상태를 실시간 반영.

### 6.6 Scaling 전략

1. **초기:** Vercel + Supabase/Neon PostgreSQL + Upstash Redis.
2. **성장:** AWS ECS/Fargate 또는 Kubernetes, RDS PostgreSQL, ElastiCache Redis.
3. **읽기 확장:** 그룹 히스토리/통계는 materialized view 또는 rollup table.
4. **쓰기 분리:** 정산 계산은 idempotent job으로 처리.
5. **대용량 이벤트:** availability slot을 압축 저장하거나 bitmap/JSONB로 최적화.

---

## 7. DB 구조

### 7.1 ERD 개요

```text
User 1---N GroupMember N---1 Group
Group 1---N Event
Event 1---N Availability
Event 1---N Round
Round 1---N Expense
Event 1---N Settlement
User 1---N Availability
User 1---N Settlement as payer/payee
```

### 7.2 users

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | 사용자 ID |
| name | varchar(80) | 표시 이름 |
| phone_hash | varchar(255), nullable | 전화번호 해시 |
| kakao_id | varchar(120), nullable | 카카오 로그인 ID |
| avatar_url | text, nullable | 프로필 이미지 |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

인덱스:

- unique nullable index on `kakao_id`.
- index on `phone_hash`.

### 7.3 groups

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | 그룹 ID |
| owner_id | uuid fk users.id | 소유자 |
| name | varchar(120) | 그룹명 |
| description | text | 설명 |
| image_url | text, nullable | 그룹 이미지 |
| is_recurring | boolean | 반복 모임 여부 |
| invite_code | varchar(32) | 초대 코드 |
| visibility | enum | private, link_public |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

인덱스:

- unique index on `invite_code`.
- index on `owner_id`.
- index on `(owner_id, created_at desc)`.

### 7.4 group_members

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | 멤버십 ID |
| group_id | uuid fk groups.id | 그룹 |
| user_id | uuid fk users.id | 사용자 |
| role | enum | owner, admin, member |
| is_core | boolean | 핵심 인원 여부 |
| joined_at | timestamptz | 가입일 |

인덱스:

- unique index on `(group_id, user_id)`.
- index on `(group_id, role)`.
- index on `(group_id, is_core)`.

### 7.5 events

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | 이벤트 ID |
| group_id | uuid fk groups.id | 그룹 |
| creator_id | uuid fk users.id | 생성자 |
| title | varchar(160) | 제목 |
| description | text | 설명 |
| status | enum | draft, voting, confirmed, settled, archived |
| candidate_places | jsonb | 장소 후보 배열 |
| candidate_time_ranges | jsonb | 후보 시간 범위 배열 |
| max_participants | integer, nullable | 최대 인원 |
| vote_deadline_at | timestamptz, nullable | 투표 마감 |
| confirmed_start_at | timestamptz, nullable | 확정 시작 |
| confirmed_end_at | timestamptz, nullable | 확정 종료 |
| confirmed_place | text, nullable | 확정 장소 |
| visibility | enum | private, link_public |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

인덱스:

- index on `(group_id, created_at desc)`.
- index on `(group_id, status)`.
- index on `vote_deadline_at`.

### 7.6 availability

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | 가능 시간 ID |
| event_id | uuid fk events.id | 이벤트 |
| user_id | uuid fk users.id | 사용자 |
| start_at | timestamptz | 시작 |
| end_at | timestamptz | 종료 |
| status | enum | available, maybe, unavailable |
| preference_score | smallint | 0~2 또는 0~5 |
| note | text, nullable | 메모 |
| created_at | timestamptz | 생성일 |

인덱스:

- index on `(event_id, user_id)`.
- index on `(event_id, start_at, end_at)`.
- exclusion constraint 고려: 같은 사용자/이벤트의 중복 time range 방지.

### 7.7 rounds

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | 차수 ID |
| event_id | uuid fk events.id | 이벤트 |
| round_no | integer | 1, 2, 3... |
| place_name | varchar(160) | 장소명 |
| started_at | timestamptz, nullable | 시작 시간 |
| ended_at | timestamptz, nullable | 종료 시간 |
| memo | text | 메모 |
| created_at | timestamptz | 생성일 |

인덱스:

- unique index on `(event_id, round_no)`.
- index on `(event_id, created_at)`.

### 7.8 round_participants

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | 참여 ID |
| round_id | uuid fk rounds.id | 차수 |
| user_id | uuid fk users.id | 참석자 |
| participation_weight | numeric(6,3) | 1.0 기본, 부분 부담 반영 |
| exclude_alcohol | boolean | 술 제외 여부 |
| manual_adjustment_amount | integer | 원 단위 수동 조정 |
| created_at | timestamptz | 생성일 |

인덱스:

- unique index on `(round_id, user_id)`.
- index on `(user_id)`.

### 7.9 expenses

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | 비용 ID |
| round_id | uuid fk rounds.id | 차수 |
| paid_by_user_id | uuid fk users.id | 결제자 |
| amount | integer | 결제 금액, 원 단위 |
| category | enum | food, alcohol, activity, transport, other |
| description | text | 설명 |
| discount_amount | integer | 쿠폰/할인 금액 |
| fund_applied_amount | integer | 회비 차감액 |
| created_at | timestamptz | 생성일 |

인덱스:

- index on `(round_id)`.
- index on `(paid_by_user_id)`.
- index on `(round_id, paid_by_user_id)`.

### 7.10 settlements

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | 정산 ID |
| event_id | uuid fk events.id | 이벤트 |
| payer_user_id | uuid fk users.id | 보내는 사람 |
| payee_user_id | uuid fk users.id | 받는 사람 |
| amount | integer | 송금 필요 금액 |
| paid_amount | integer | 송금 완료 금액 |
| status | enum | pending, partial, paid, waived |
| due_at | timestamptz, nullable | 송금 기한 |
| completed_at | timestamptz, nullable | 완료일 |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

인덱스:

- index on `(event_id, status)`.
- index on `(payer_user_id, status)`.
- index on `(payee_user_id, status)`.
- unique index on `(event_id, payer_user_id, payee_user_id)`.

---

## 8. API 구조

### 8.1 인증/사용자

- `POST /auth/kakao` — 카카오 로그인.
- `POST /auth/guest` — 게스트 세션 생성.
- `GET /me` — 내 정보 조회.
- `PATCH /me` — 이름/프로필 수정.

### 8.2 그룹

- `POST /groups` — 그룹 생성.
- `GET /groups/:groupId` — 그룹 상세.
- `PATCH /groups/:groupId` — 그룹 수정.
- `POST /groups/:groupId/invite-link` — 초대 링크 재생성.
- `POST /groups/join/:inviteCode` — 초대 코드로 가입.
- `GET /groups/:groupId/members` — 멤버 목록.
- `PATCH /groups/:groupId/members/:userId` — 역할/핵심 인원 수정.

### 8.3 이벤트/일정

- `POST /groups/:groupId/events` — 이벤트 생성.
- `GET /events/:eventId` — 이벤트 상세.
- `PATCH /events/:eventId` — 이벤트 수정.
- `POST /events/:eventId/availability` — 가능 시간 제출.
- `GET /events/:eventId/recommendations` — 추천 시간 조회.
- `POST /events/:eventId/confirm` — 최종 시간/장소 확정.

### 8.4 차수/비용

- `POST /events/:eventId/rounds` — 차수 생성.
- `PATCH /rounds/:roundId` — 차수 수정.
- `POST /rounds/:roundId/participants` — 참석자 저장.
- `POST /rounds/:roundId/expenses` — 비용 추가.
- `PATCH /expenses/:expenseId` — 비용 수정.
- `DELETE /expenses/:expenseId` — 비용 삭제.

### 8.5 정산

- `POST /events/:eventId/settlements/calculate` — 정산 계산.
- `GET /events/:eventId/settlements` — 정산 결과 조회.
- `PATCH /settlements/:settlementId/status` — 완료/부분 송금 처리.
- `POST /events/:eventId/settlements/share-message` — 카카오톡 공유용 텍스트 생성.

### 8.6 히스토리/통계

- `GET /groups/:groupId/history` — 이벤트 히스토리.
- `GET /groups/:groupId/stats` — 참석률, 지출, 미정산 통계.
- `GET /groups/:groupId/places` — 자주 간 장소.

---

## 9. 알고리즘 설계

### 9.1 시간 추천 알고리즘

#### 입력

- 후보 시간 슬롯 목록.
- 사용자별 가능/애매/불가능.
- 사용자별 선호 점수.
- 핵심 인원 여부.
- 반복 모임의 과거 참석 패턴.

#### 점수 설계

각 슬롯의 점수는 다음과 같이 계산한다.

```text
score(slot) =
  attendance_rate * 40
+ core_member_rate * 30
+ preference_avg * 20
+ recurring_pattern_score * 10
- conflict_penalty
```

가중치 초기값:

- 참석률 40%.
- 핵심 인원 포함 30%.
- 선호도 20%.
- 반복 패턴 10%.

운영자 화면에서는 점수뿐 아니라 “왜 추천됐는지”를 설명해야 한다.

예시:

- “8명 중 7명 가능.”
- “핵심 인원 3명 전원 가능.”
- “선호 표시 5개로 가장 높음.”

#### 의사코드

```pseudo
function recommendTimes(eventId):
    slots = expandCandidateRangesToSlots(eventId, interval=30min)
    members = getEventParticipants(eventId)
    coreMembers = filter(members, m.isCore)
    pastPatterns = getRecurringPatterns(event.groupId)

    results = []

    for slot in slots:
        availableCount = 0
        maybeCount = 0
        unavailableCount = 0
        preferenceSum = 0
        coreAvailableCount = 0

        for member in members:
            response = getAvailability(member, slot)

            if response.status == "available":
                availableCount += 1
                preferenceSum += response.preferenceScore
                if member.isCore:
                    coreAvailableCount += 1
            else if response.status == "maybe":
                maybeCount += 1
                preferenceSum += response.preferenceScore * 0.5
            else:
                unavailableCount += 1

        attendanceRate = (availableCount + maybeCount * 0.5) / count(members)
        coreMemberRate = coreAvailableCount / max(1, count(coreMembers))
        preferenceAvg = preferenceSum / max(1, count(members))
        recurringPatternScore = calculatePatternFit(slot, pastPatterns)
        conflictPenalty = unavailableCount == count(members) ? 100 : 0

        score = attendanceRate * 40
              + coreMemberRate * 30
              + normalize(preferenceAvg) * 20
              + recurringPatternScore * 10
              - conflictPenalty

        results.push({ slot, score, availableCount, maybeCount, coreAvailableCount })

    return sortByScoreDesc(results).take(3)
```

### 9.2 차수별 부담액 계산

#### 기본 원칙

1. 각 차수의 실제 부담 대상자를 확정한다.
2. 비용별로 할인/회비 차감 후 정산 대상 금액을 계산한다.
3. 참석자 weight를 반영해 개인별 부담액을 계산한다.
4. 결제자는 지불액만큼 credit을 얻고, 부담액만큼 debit을 가진다.
5. 전체 이벤트 단위로 개인별 net balance를 합산한다.

#### 의사코드

```pseudo
function calculateNetBalances(eventId):
    balances = Map<UserId, Integer>(default=0)

    rounds = getRounds(eventId)

    for round in rounds:
        participants = getRoundParticipants(round.id)
        expenses = getExpenses(round.id)

        for expense in expenses:
            netAmount = expense.amount - expense.discountAmount - expense.fundAppliedAmount
            payer = expense.paidByUserId
            balances[payer] += netAmount

            eligibleParticipants = filterEligibleParticipants(participants, expense.category)
            totalWeight = sum(p.participationWeight for p in eligibleParticipants)

            remaining = netAmount
            shares = []

            for p in eligibleParticipants:
                rawShare = floor(netAmount * p.participationWeight / totalWeight)
                adjustedShare = rawShare + p.manualAdjustmentAmount
                shares.push({ userId: p.userId, amount: adjustedShare })
                remaining -= adjustedShare

            distributeRoundingRemainder(shares, remaining)

            for share in shares:
                balances[share.userId] -= share.amount

    return balances
```

### 9.3 최소 송금 알고리즘

#### 목표

- 모든 사용자의 net balance 합이 0이 되도록 한다.
- 양수 balance는 받을 금액, 음수 balance는 보낼 금액이다.
- 가장 큰 채권자와 가장 큰 채무자를 반복 매칭해 송금 횟수를 줄인다.

#### 부분 송금 처리

- 기존 settlement의 `paid_amount`를 반영한다.
- 남은 금액만 다시 최소 경로 계산에 넣는다.
- 이미 완료된 송금은 고정하고 재계산하지 않는다.

#### 의사코드

```pseudo
function minimizeTransfers(balances, existingSettlements):
    adjustedBalances = applyPartialPayments(balances, existingSettlements)

    debtors = []
    creditors = []

    for (userId, balance) in adjustedBalances:
        if balance < 0:
            debtors.push({ userId, amount: -balance })
        else if balance > 0:
            creditors.push({ userId, amount: balance })

    sortDesc(debtors by amount)
    sortDesc(creditors by amount)

    transfers = []
    i = 0
    j = 0

    while i < len(debtors) and j < len(creditors):
        amount = min(debtors[i].amount, creditors[j].amount)

        transfers.push({
            payerUserId: debtors[i].userId,
            payeeUserId: creditors[j].userId,
            amount: amount
        })

        debtors[i].amount -= amount
        creditors[j].amount -= amount

        if debtors[i].amount == 0:
            i += 1
        if creditors[j].amount == 0:
            j += 1

    return transfers
```

#### 정확성 체크

- 계산 전후 모든 balance 합은 0이어야 한다.
- settlement 총액은 전체 개인 부담액 총합과 일치해야 한다.
- 원 단위 나머지는 결정적 규칙으로 분배한다.
- 모든 계산은 서버에서 수행하고 클라이언트 계산은 미리보기로만 사용한다.

---

## 10. MVP 정의

### 10.1 MVP 포함 기능

1. 링크 기반 일정 조율.
2. 가능/애매/불가능 시간 입력.
3. 추천 시간 Top 3.
4. 모임 확정.
5. 차수별 참석자 기록.
6. 차수별 금액과 결제자 입력.
7. 자동 더치페이 계산.
8. 최소 송금 경로 생성.
9. 정산 상태 표시.
10. 카카오톡 공유용 메시지 복사.

### 10.2 MVP 제외 기능

- 실제 송금 연동.
- OCR 영수증 인식.
- AI 맛집 추천.
- 네이티브 앱.
- 실시간 채팅.
- 복잡한 회계 기능.
- 카드/은행 자동 연동.

### 10.3 MVP 성공 지표

활성 지표:

- 생성된 그룹 수.
- 생성된 이벤트 수.
- 이벤트당 평균 참여자 수.
- 투표 링크 제출 완료율.
- 정산 계산 완료율.

가치 지표:

- 모임장이 수동 계산을 하지 않았다고 응답한 비율.
- 정산표 공유까지 걸린 시간.
- 이벤트 생성 후 실제 정산까지 이어진 비율.
- 2회 이상 이벤트를 만든 그룹 비율.

바이럴 지표:

- 이벤트 링크당 신규 사용자 수.
- 카카오톡 공유 메시지 클릭률.
- 그룹 초대 링크 전환율.

### 10.4 검증 가설

- H1: 모임장은 일정 조율보다 정산 자동화에서 더 큰 가치를 느낀다.
- H2: 참석자는 앱 설치 없이 링크로 입력할 때 참여율이 높다.
- H3: 차수별 참석자 구조는 기존 더치페이 대비 차별적 사용 이유가 된다.
- H4: 한 번 정산을 성공한 모임장은 다음 모임도 같은 그룹에서 생성한다.

---

## 11. 우선순위 기반 개발 계획 및 개발 로드맵

### 11.1 우선순위 원칙

식후경의 개발 순서는 “기능이 멋진가”가 아니라 **초기 검증에 필요한가, 모임장의 시간을 실제로 줄이는가, 정산 오류 리스크를 낮추는가**를 기준으로 결정한다.

우선순위 판단 기준:

1. **정산 와우 모먼트 우선:** 차수별 참석자와 최소 송금표가 식후경의 가장 강한 차별점이다.
2. **카카오톡 링크 흐름 우선:** 설치 없는 참여와 공유가 초기 확산의 핵심이다.
3. **운영자 업무 절감 우선:** 참석자 편의보다 모임장/총무의 반복 노동 감소를 먼저 검증한다.
4. **정확성 우선:** 돈 계산은 기능 수보다 신뢰가 중요하므로 테스트와 감사 로그를 초기에 만든다.
5. **자동화보다 수동 보정 우선:** OCR, 송금 연동, AI 추천보다 수동 수정 가능한 정확한 기본 정산이 먼저다.

### 11.2 기능 우선순위 매트릭스

| 우선순위 | 기능 | 이유 | 출시 기준 |
|---|---|---|---|
| P0 | 차수별 참석자 기록 | 한국식 모임 차별화의 핵심 | 1차/2차/n차별 참석자 복사·수정 가능 |
| P0 | 비용/결제자 입력 | 정산 계산의 필수 입력 | 복수 결제자와 원 단위 금액 저장 가능 |
| P0 | 더치페이 계산 엔진 | 돈 계산 신뢰의 핵심 | n분의 1, 부분 부담, 수동 조정 테스트 통과 |
| P0 | 최소 송금 경로 | 공유 가능한 최종 결과물 | 개인별 balance 합계 0 검증, 최소 송금표 생성 |
| P0 | 정산 결과 공유 | 카카오톡 확산의 핵심 | 카카오톡 복사용 메시지 생성 |
| P1 | 링크 기반 이벤트 생성 | 참여자 유입 장벽 제거 | 로그인 없이 투표/참석 입력 가능 |
| P1 | 가능/애매/불가능 시간 투표 | 모임 전 단계 연결 | 모바일에서 30초 내 제출 가능 |
| P1 | 추천 시간 Top 3 | 모임장 결정 보조 | 참석률·핵심 인원·선호도 기준 표시 |
| P1 | 정산 상태 체크 | 모임 후 운영 피로 감소 | 미정산/부분/완료 상태 관리 |
| P2 | 그룹 히스토리 | 반복 사용과 락인 | 최근 모임, 총 지출, 미정산 요약 제공 |
| P2 | 역할/권한 | 운영진 협업 | Owner/Admin/Member 권한 구분 |
| P2 | 기본 통계 | 유료화 근거 | 참석률, 개인별 누적 지출, 장소 통계 |
| P3 | 회비 관리 | 고급 정산 확장 | 이벤트별 회비 차감 자동화 |
| P3 | OCR/AI/송금 연동 | 편의 기능이지만 초기 리스크 큼 | MVP 검증 후 별도 실험 |

### 11.3 0~2주: P0 정산 코어 스프린트

목표:

- 일정 조율 없이도 “차수별 정산표가 정확하게 나온다”는 핵심 가치를 검증한다.

개발 범위:

- 이벤트 임시 생성.
- 참석자 직접 추가.
- 차수 생성/수정/삭제.
- 차수별 참석자 체크.
- 비용, 결제자, 복수 결제자 입력.
- 수동 조정 금액 입력.
- 더치페이 계산 엔진.
- 최소 송금 경로 생성.
- 정산 결과 카카오톡 복사용 메시지.

제외:

- 로그인 고도화.
- 그룹 히스토리.
- 실시간 투표.
- 회비/OCR/송금 연동.

완료 기준:

- 10개 정산 테스트 케이스가 모두 통과한다.
- 6명, 3차, 복수 결제자 시나리오를 3분 이내 입력할 수 있다.
- 최종 송금표의 총액과 개인별 balance가 서버에서 검증된다.

### 11.4 3~4주: P1 링크 기반 일정 조율 스프린트

목표:

- 카카오톡 공유 링크로 참석자가 들어와 시간 투표와 참석 의사를 제출하는 흐름을 만든다.

개발 범위:

- 그룹/이벤트 생성 최소 플로우.
- 초대/투표 링크 생성.
- 게스트 이름 입력.
- 가능/애매/불가능 시간 입력.
- 선호 시간 표시.
- 추천 시간 Top 3.
- 모임 확정 상태.
- 확정 메시지 복사.

완료 기준:

- 참석자가 로그인 없이 링크에서 30초 안에 투표를 제출할 수 있다.
- 모임장이 추천 시간에서 확정까지 2클릭 이내로 진행할 수 있다.
- 미응답자 목록이 표시된다.

### 11.5 5~6주: P1 정산 상태·운영자 대시보드 스프린트

목표:

- 모임장이 정산 이후 미정산자를 추적하고 관계 부담 없이 독촉할 수 있게 한다.

개발 범위:

- settlement 저장.
- 미정산/부분 송금/완료 상태.
- 부분 송금 금액 입력.
- 정산 상세 접기/펼치기.
- 개인별 “내가 보낼 금액” 화면.
- 독촉 메시지 복사.
- 운영자 이벤트 대시보드.

완료 기준:

- 참석자별 정산 상태가 이벤트 단위로 유지된다.
- 부분 송금 후 남은 금액만 표시된다.
- 모임장이 미정산자만 필터링할 수 있다.

### 11.6 7~8주: Closed Beta 운영 스프린트

목표:

- 실제 동아리/스터디/크루 10개 그룹에서 반복 사용 가능성을 검증한다.

개발 범위:

- 오류 추적과 계산 감사 로그.
- 관리자용 정산 재계산 기능.
- 모바일 UX 개선.
- 빈 상태/에러 상태 개선.
- 카카오톡 공유 문구 A/B 테스트.
- 개인정보 최소 수집 정책 반영.

운영 방식:

- 10개 그룹을 직접 온보딩한다.
- 첫 정산은 운영자가 함께 지켜본다.
- 복잡한 정산 케이스를 태깅해 백로그에 반영한다.

완료 기준:

- 베타 그룹 중 50% 이상이 2번째 이벤트를 생성한다.
- 정산 결과 수정 요청률이 10% 이하로 내려간다.
- 이벤트 생성부터 정산 공유까지 완료한 그룹이 7개 이상이다.

### 11.7 9~12주: Public MVP 출시 스프린트

목표:

- 셀프서브로 신규 그룹이 생성되고 카카오톡 링크를 통해 자연 확산되는 구조를 만든다.

개발 범위:

- 랜딩 페이지.
- 온보딩 체크리스트.
- 그룹 히스토리 MVP.
- 최근 이벤트/총 지출/미정산 요약.
- 기본 역할: Owner/Admin/Member.
- Rate limit과 초대 링크 재생성.
- 간단한 이용 제한 기반 Freemium 실험.

완료 기준:

- 외부 사용자가 설명 없이 첫 그룹과 첫 이벤트를 만들 수 있다.
- 그룹 히스토리에서 다음 모임 생성 CTA가 작동한다.
- 신규 이벤트의 30% 이상이 기존 그룹에서 생성된다.

### 11.8 3~6개월: Retention & Monetization 스프린트

목표:

- 반복 사용 지표와 유료화 근거를 만든다.

개발 범위:

- 고급 그룹 히스토리.
- 참석률/누적 지출/자주 간 장소 통계.
- 정산 템플릿.
- 회비 차감 기본 기능.
- 운영진 다중 권한.
- CSV 내보내기.
- Group Pro 결제 실험.

완료 기준:

- 활성 그룹의 월 2회 이상 이벤트 생성률이 증가한다.
- Pro 기능 클릭률/결제 전환 의향이 측정된다.
- 운영자가 “히스토리 때문에 계속 쓴다”고 응답하는 사례가 확보된다.

### 11.9 6~12개월: Platform Expansion 스프린트

목표:

- 단순 정산 도구를 넘어 커뮤니티 운영 OS로 확장한다.

개발 후보:

- 회비 관리 고도화.
- 출석/멤버십 관리.
- 대학/동아리 B2B 대시보드.
- OCR 영수증 인식.
- 외부 캘린더 연동.
- 송금/페이 연동 검토.
- AI 운영 도우미.

진입 조건:

- Public MVP에서 반복 그룹 사용이 검증된다.
- 정산 정확성 관련 CS가 안정화된다.
- 월간 활성 그룹과 정산 이벤트가 유료화 실험을 할 만큼 확보된다.

### 11.10 추천 개발 순서 요약

```text
1순위: 차수별 정산 코어
  → 참석자, 차수, 비용, 결제자, 최소 송금표

2순위: 카카오톡 링크 기반 일정 조율
  → 이벤트 링크, 시간 투표, 추천 시간, 확정 메시지

3순위: 정산 상태와 운영자 대시보드
  → 미정산 추적, 부분 송금, 독촉 메시지

4순위: 그룹 히스토리와 반복 사용
  → 최근 모임, 누적 지출, 참석률, 장소 기록

5순위: 유료화/확장 기능
  → 회비, 고급 통계, B2B, OCR, 송금 연동
```

핵심 결론:

> 식후경은 처음부터 완전한 모임 운영 OS를 만들기보다, **“차수별 정산을 정확하게 끝내는 P0 제품” → “카카오톡 링크로 일정 조율까지 연결하는 P1 제품” → “히스토리와 운영 대시보드로 반복 사용을 만드는 P2 제품”** 순서로 개발해야 한다.
## 11. 개발 로드맵

### 11.1 0~4주: Prototype

목표:

- 와우 모먼트 검증.

범위:

- 그룹/이벤트 생성.
- 시간 투표.
- 차수 입력.
- 정산 계산.
- 최소 송금표.

운영:

- 5~10개 실제 동아리/스터디에 수동 온보딩.
- 정산 결과 오류를 직접 모니터링.

### 11.2 5~8주: MVP Beta

목표:

- 반복 사용 검증.

범위:

- 그룹 히스토리.
- 정산 상태 관리.
- 카카오톡 공유 메시지 개선.
- 관리자 권한.
- 기본 통계.

지표:

- 그룹 2회차 이벤트 생성률.
- 정산 완료율.
- 미정산 독촉 사용률.

### 11.3 9~12주: Public MVP

목표:

- 셀프서브 성장.

범위:

- 랜딩 페이지 SEO.
- 초대 링크 UX 개선.
- PWA 설치 안내.
- 장애/오류 추적.
- 결제 없는 Freemium 제한.

### 11.4 3~6개월: Monetization Ready

범위:

- Group Pro.
- 고급 통계.
- 운영진 다중 권한.
- 회비 관리.
- 정산 템플릿.
- 외부 캘린더 연동.

### 11.5 6~12개월: Platform Expansion

범위:

- 커뮤니티 운영툴.
- 대학/동아리 B2B.
- 멤버십/출석 관리.
- 송금/페이 연동 검토.
- 영수증 OCR/AI 추천 확장.

---

## 12. 사업 전략

### 12.1 시장 분석

식후경은 일정 조율 시장과 개인 간 비용 정산 시장이 겹치는 지점에 있다. 하지만 핵심 시장은 두 기능의 단순 합이 아니라 **비공식 그룹 운영 생산성 시장**이다.

주요 시장:

- 대학 동아리/학회/학생회.
- 스터디/취업 준비 모임.
- 러닝크루/운동 커뮤니티.
- 프로젝트팀/소규모 조직.
- 친목 모임/동창회.

### 12.2 TAM/SAM/SOM

정확한 시장 규모는 추후 리서치가 필요하지만, 스타트업 초기 관점에서는 다음 방식으로 추정한다.

TAM:

- 한국의 20~39세 모바일 금융/커뮤니티 사용 인구 전체.
- 단체 모임, 회식, 여행, 스터디를 경험하는 모든 사용자.

SAM:

- 월 1회 이상 단체 모임을 운영하거나 참석하는 대학생/20대/30대.
- 카카오톡 단체방을 통해 모임을 운영하는 그룹.

SOM:

- 초기 12개월 내 확보 가능한 대학교 동아리, 스터디, 러닝크루 중심 그룹.
- 목표 예시: 1년 내 활성 그룹 3,000개, 월간 정산 이벤트 10,000건.

### 12.3 한국 모임 문화 특성

- 카카오톡 단체방이 기본 운영 채널이다.
- “1차/2차/3차”로 이동하는 회식 문화가 강하다.
- 참석자가 차수별로 달라지는 것이 자연스럽다.
- 한 사람이 결제하고 나중에 정산하는 문화가 많다.
- 미정산 독촉은 관계 부담이 있어 표현을 부드럽게 만들어야 한다.
- 앱 설치 장벽이 높으므로 링크 기반 모바일 웹이 유리하다.

### 12.4 수익 모델

#### Freemium

무료:

- 그룹 3개.
- 이벤트 월 5개.
- 기본 정산.
- 기본 히스토리.

유료 개인/그룹:

- 무제한 이벤트.
- 고급 정산 옵션.
- 히스토리 통계.
- 정산 템플릿.
- 운영진 권한.

#### Group Pro

대상:

- 동아리, 크루, 스터디, 커뮤니티.

가격 예시:

- 그룹당 월 4,900원~19,900원.
- 멤버 수/이벤트 수에 따라 티어링.

기능:

- 운영진 다중 권한.
- 참석률 통계.
- 미정산 자동 리마인드.
- 회비 관리.
- CSV 내보내기.

#### B2B 커뮤니티 운영툴

대상:

- 대학 학생회.
- 사내 동호회.
- 교육/부트캠프 커뮤니티.
- 오프라인 커뮤니티 운영사.

기능:

- 조직 단위 대시보드.
- 다중 그룹 관리.
- 출석/정산 리포트.
- 관리자 계정.

#### 정산 프리미엄 기능

- 회비 차감 자동화.
- 고급 분담 규칙 저장.
- 정산 템플릿.
- OCR 영수증.
- 송금 연동 수수료 또는 제휴.

### 12.5 성장 전략

#### 카카오톡 링크 기반 바이럴

- 모든 이벤트와 정산표는 카카오톡 공유에 최적화한다.
- 공유 메시지는 받는 사람이 클릭하고 싶게 구체적이어야 한다.
- 예시: “5월 회식 정산: 내가 보낼 금액 18,000원 확인하기”.

#### 모임장 중심 확산

- 제품 마케팅 메시지는 일반 참석자보다 모임장을 향한다.
- “총무님 전용 정산 자동화”를 전면에 둔다.
- 한 명의 모임장이 여러 그룹을 만들 가능성이 높다.

#### 대학 커뮤니티 침투

- 학기 초 동아리 모집 시즌에 집중한다.
- 학생회/동아리연합회에 무료 Pro를 제공한다.
- 에브리타임, 인스타그램, 카카오톡 오픈채팅 기반 캠페인을 검토한다.

#### 제품 주도 성장

- 정산 결과 페이지 하단에 “다음 모임도 식후경으로” CTA.
- 참석자가 링크로 들어와 자신의 그룹을 만들 수 있게 한다.
- 그룹 히스토리 가치가 누적될수록 이탈이 줄어든다.

---

## 13. 리스크 분석

### 13.1 제품 리스크

| 리스크 | 설명 | 대응 |
|---|---|---|
| 너무 많은 기능 | 일정, 정산, 히스토리를 모두 만들면 MVP가 무거워짐 | 초기에는 정산 와우 모먼트 중심 |
| 입력 부담 | 참석자/차수/결제자 입력이 귀찮을 수 있음 | 이전 차수 복사, 기본값, 빠른 체크 UX |
| 정산 오류 | 돈과 관련된 오류는 신뢰를 크게 훼손 | 서버 계산, 테스트 케이스, 감사 로그 |
| 앱 설치 요구 | 참석자가 설치를 거부할 수 있음 | 모바일 웹/PWA 우선 |

### 13.2 시장 리스크

| 리스크 | 설명 | 대응 |
|---|---|---|
| 카카오페이/토스와 직접 경쟁 | 송금 자체는 대형 플랫폼이 강함 | 송금 전 운영/차수/히스토리에 집중 |
| 사용 빈도 낮음 | 개인은 월 몇 회만 쓸 수 있음 | 그룹 히스토리와 운영자 반복 사용 확보 |
| 지불 의사 불확실 | 대학생은 결제 저항이 큼 | 그룹 단위 저가 Pro, B2B 전환 |

### 13.3 운영 리스크

| 리스크 | 설명 | 대응 |
|---|---|---|
| 개인정보 | 이름, 참석, 비용 데이터가 민감함 | 최소 수집, 암호화, 초대 링크 만료 |
| 금융 규제 | 실제 송금 연동 시 규제 이슈 | MVP에서는 송금 연동 제외 |
| 악성 링크 | 공개 링크 남용 가능 | rate limit, 신고, 링크 재생성 |

---

## 14. 경쟁 우위

### 14.1 경쟁 분석

| 서비스 | 강점 | 약점 | 한국형 차수 구조 | 식후경의 기회 |
|---|---|---|---|---|
| Doodle | 그룹 일정 조율, 마감, 리마인더, 캘린더 | 정산/히스토리 없음 | 없음 | 일정 이후 운영까지 연결 |
| When2Meet | 매우 단순한 가능 시간 그리드 | 고급 운영 기능 부족 | 없음 | 모바일 UX와 확정/정산 연결 |
| Splitwise | 비용 분할, 그룹 비용, 부채 단순화 | 일정 조율과 한국식 회식 흐름 부족 | 제한적 | 차수별 참석과 모임 전후 흐름 통합 |
| 토스 공동정산 | 송금 접근성, 금융 신뢰 | 모임 운영 히스토리와 일정 조율 부족 | 제한적 | 송금 전 계산/운영 레이어 점유 |
| 카카오페이 정산 | 카카오톡 맥락, 요청/송금 편의 | 복잡한 모임 운영 모델 부족 | 제한적 | 카카오톡 공유 기반 보완재로 시작 |

### 14.2 핵심 차별화

1. **차수 중심 데이터 모델.** 한국식 1차/2차/n차를 예외가 아니라 기본 구조로 취급한다.
2. **모임 전·중·후 통합.** 일정 조율과 정산을 하나의 이벤트 라이프사이클로 묶는다.
3. **운영자 생산성.** 참석자가 아니라 모임장의 반복 노동을 줄인다.
4. **그룹 히스토리.** 누적 참석률, 지출, 장소, 미정산 기록이 다음 모임 운영에 쓰인다.
5. **카카오톡 네이티브 행동 흐름.** 앱 설치보다 링크 공유와 메시지 복사를 우선한다.

---

## 15. 향후 확장 전략

### 15.1 회비 관리

- 월 회비 납부 상태.
- 이벤트별 회비 차감.
- 잔액 관리.
- 회비 사용 내역 공유.

### 15.2 OCR 영수증

- 영수증 촬영.
- 총액/품목/상호 자동 인식.
- 술/음식 항목 분리.
- 품목별 분담.

### 15.3 AI 운영 도우미

- 모임 추천 시간 자동 제안.
- 지난 참석 패턴 기반 일정 후보 생성.
- 정산 메시지 자동 작성.
- 미정산 독촉 메시지 톤 조절.

### 15.4 장소/맛집 추천

- 자주 간 장소와 그룹 취향 기반 추천.
- 인원/예산/위치 기반 후보.
- 예약 링크 연동.

### 15.5 금융/송금 연동

- 토스/카카오페이/오픈뱅킹 연동 검토.
- 실제 송금은 규제와 파트너십을 고려해 후순위로 둔다.
- 초기에는 “송금 완료 체크”와 “공유 메시지”만 제공한다.

### 15.6 커뮤니티 OS

- 출석 관리.
- 공지.
- 멤버 등급.
- 운영진 인수인계.
- 이벤트 템플릿.
- 조직 대시보드.

---

## 16. 초기 실행 계획

### 16.1 첫 10개 고객 확보

- 지인 대학 동아리 3개.
- 개발/취업 스터디 3개.
- 러닝크루 2개.
- 프로젝트팀/친목 모임 2개.

각 그룹에 다음을 관찰한다.

- 기존 일정 조율 방식.
- 기존 정산 방식.
- 정산에 걸리는 시간.
- 차수별 참석자 변경 빈도.
- 모임장이 실제로 귀찮아하는 순간.

### 16.2 Concierge MVP

처음부터 모든 기능을 완전 자동화하지 않는다.

- 입력 UI는 만들되, 정산 오류는 운영자가 직접 검수한다.
- 복잡한 케이스는 고객 인터뷰로 수집한다.
- 반복되는 케이스만 제품 기능으로 승격한다.

### 16.3 정산 테스트 케이스

필수 테스트:

1. 1차만 있고 결제자 1명.
2. 1차/2차 참석자가 다름.
3. 복수 결제자.
4. 수동 조정.
5. 회비 차감.
6. 쿠폰 할인.
7. 부분 송금.
8. 원 단위 나머지.
9. 참석자 1명인 차수.
10. 결제자가 참석자가 아닌 경우.

---

## 17. 최종 제안

식후경의 초기 성공은 모든 모임 기능을 만드는 데서 오지 않는다. MVP는 **“차수별 현실 정산을 카카오톡 링크로 3분 안에 끝내는 제품”**이어야 한다.

가장 중요한 제품 원칙은 다음과 같다.

1. 일정 조율은 유입과 이벤트 생성의 이유다.
2. 차수별 정산은 차별화와 와우 모먼트다.
3. 최소 송금 경로는 공유 가능한 결과물이다.
4. 히스토리는 반복 사용과 유료화의 근거다.
5. 송금 연동은 초기 핵심이 아니라 후속 확장이다.

따라서 1차 MVP의 제품 문장은 다음처럼 정리할 수 있다.

> “카톡방에 링크 하나 보내면, 시간 투표부터 1차/2차 정산표까지 자동으로 정리되는 모임장 전용 운영 도구.”
