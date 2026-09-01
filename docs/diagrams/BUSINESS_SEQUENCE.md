# CardFit 비즈니스 로직 시퀀스 다이어그램

> 기준: `PRD.md` v0.1 · `SRS.md` · `CALC_SPEC.md`

```mermaid
sequenceDiagram
    autonumber
    actor U as 사용자
    participant UI as CardFit UI
    participant D as Prisma/Supabase Seed
    participant A as Server Actions
    participant S as Session State
    participant C as 계산 엔진
    participant R as 혜택 규칙 엔진
    participant E as 근거 검증기
    participant K as 카드사 공식 페이지

    U->>UI: 시작하기
    UI-->>U: 예시 데이터 사용 고지
    U->>UI: 예시 데이터 연결하기
    UI->>A: 예시 데이터 연결 요청
    A->>D: 보유카드·최근 소비·혜택규칙 조회
    D-->>A: 12개월 Mock 데이터 + rule_version + 기준일
    A-->>UI: 예시 데이터 반환
    UI-->>U: 현재 혜택 요약과 카드 진단
    Note over UI,U: 최근 12개월 소비 기준<br/>앞으로의 지출은 아직 미반영

    U->>UI: 앞으로 쓸 돈 반영하기
    UI->>A: 과거 패턴 기반 제안값 요청
    A->>D: 과거 12개월 지출 조회
    D-->>A: 과거 지출 Mock
    A-->>UI: 앞으로 12개월 지출 제안 초안
    UI-->>U: 미래지출 목록과 제안 출처 표시
    U->>UI: 항목 추가·수정·삭제 또는 그대로 확인

    alt 모든 항목 삭제 또는 금액 전부 0원
        UI-->>U: 다음 CTA 비활성 + 입력 필요 안내
        Note over UI: CardFit 최종 결과를 만들지 않음
    else 확인할 계획이 1건 이상
        UI-->>U: 카드 수·신규 발급 허용 조건 표시
        U->>UI: 이 계획대로 계산하기
        UI->>S: 외부 링크 복귀용 임시 상태 저장
        UI->>A: 확인된 계획 저장·계산 요청
        A->>D: 미래 계획·계산 결과 저장
        A->>C: 확인된 계획의 카드 조합 계산 요청
        C->>C: 12개월 지출 계획 생성
        C->>C: 유효 조합 생성
        Note over C: 사용 카드 최대 2장<br/>신규 카드 최대 1장
        C->>R: 카드별 실적·한도·제외조건 평가
        R-->>C: Gross Benefit + 적용 규칙
        C->>C: Net Benefit 계산
        Note over C: Gross - 연회비 - 실적 재적립 손실 - 발급 대기 비용

        alt Net ≥ 50,000원 AND Net ≥ Gross × 15%
            C->>C: 카드별 신규·유지·정리 상태 결정
        else 둘 중 하나라도 미달
            C->>C: 모든 보유 카드 유지
            Note over C: 신규·정리 0건
        end

        C->>C: 카테고리별 결제수단 배분
        Note over C: 배분 합과 계획 총액 오차 ≤ 1원
        C->>E: 결과 근거 완전성 검사
        E->>R: 근거 6항목 조회
        R-->>E: 실적·한도·연회비·제외조건·기준일·미반영 항목

        alt 필수 근거 6항목 충족
            E-->>C: 검증 완료
        C-->>A: 단일 조합안·배분·근거 반환
        A-->>UI: 단일 조합안·배분·근거 반환
        else 근거 누락
            E-->>C: EVIDENCE_INCOMPLETE
            C-->>A: 결과 노출 거부
            A-->>UI: 결과 노출 거부
        end

        UI->>A: 결과·확정 후보 저장
        A->>D: 계산 결과 저장
        UI->>S: 외부 링크 복귀용 임시 상태 저장
        UI-->>U: 카드별 신규·유지·정리 + 결제 배분 표시

        opt 사용자가 계획을 다시 수정
            U->>UI: 입력으로 돌아가기
            S-->>UI: 직전 입력값 복원
            Note over U,C: 수정된 계획으로 다시 계산
        end

        U->>UI: 계산 근거 확인
        UI-->>U: 근거 6항목 + 출처 있는 미반영 상한
        U->>UI: 이 조합 적용하기
        UI->>S: 확정 조합 저장

        alt 신규 카드 포함
            UI-->>U: 확정 요약·다음 행동·실행 경계
            U->>UI: 카드사에서 직접 신청하기
            UI->>K: 공식 신청 페이지 새 탭 열기
            K-->>U: 카드사 절차
            U->>UI: CardFit으로 복귀
            S-->>UI: 입력·확정 조합 복원
        else 유지·정리만 포함
            UI-->>U: 계속 사용 또는 직접 해지 안내
            Note over UI,U: 정리 카드 실행 버튼 0개
        end
    end
```

## 핵심 판정 규칙

| 지점 | 판정 |
| --- | --- |
| 미래 계획 확정 | 화면의 전체 값을 사용자가 확인하면 성립하며 별도 입력 비율 기준은 없음 |
| 계산 기간 | 기준일로부터 12개월, 결과는 `연 n원` |
| 조합 표시 | 카드마다 `신규·유지·정리` 중 정확히 하나의 상태 표시 |
| 변경 권장 | Net Benefit 5만원 이상이면서 Gross Benefit의 15% 이상 |
| 임계 미달 | 모든 보유 카드 `유지`, `신규·정리` 0건 |
| 근거 | 6항목 미달이면 결과 노출 거부 |
| 실행 | 신규는 카드사 링크, 정리는 안내만 제공 |
