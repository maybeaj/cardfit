# CardFit 비즈니스 로직 시퀀스 다이어그램

> 기준: `PRD.md` v0.1 · `SRS.md` · `CALC_SPEC.md`  
> 범위: Mock 프로토타입의 온보딩부터 조합 확정·카드사 아웃링크 복귀까지

```mermaid
sequenceDiagram
    autonumber
    actor U as 사용자
    participant UI as CardFit UI
    participant F as Mock Fixture
    participant S as Session State
    participant C as 계산 엔진
    participant R as 혜택 규칙 엔진
    participant E as 근거 검증기
    participant K as 카드사 공식 페이지

    U->>UI: 시작하기
    UI-->>U: 예시 데이터 사용 고지
    U->>UI: 예시 데이터 연결하기
    UI->>F: 보유카드·최근 소비·혜택규칙 요청
    F-->>UI: Mock 데이터 + rule_version + 기준일
    UI-->>U: 현재 혜택 요약
    Note over UI,U: 최근 12개월 소비 기준<br/>앞으로의 지출은 아직 미반영
    UI-->>U: 현재 카드 진단

    U->>UI: 앞으로 쓸 돈 반영하기
    UI->>F: 과거 패턴 기반 제안값 요청
    F-->>UI: 앞으로 12개월 지출 제안 초안
    UI-->>U: 미래지출 목록과 제안 출처 표시
    U->>UI: 항목 추가·수정·삭제 또는 그대로 확인

    alt 모든 항목 삭제 또는 금액 전부 0원
        UI-->>U: 다음 CTA 비활성 + 입력 필요 안내
        Note over UI: AC-001<br/>CardFit 최종 결과를 만들지 않음
    else 확인할 계획이 1건 이상
        UI-->>U: 카드 수·신규 발급 허용 조건 표시
        U->>UI: 이 계획대로 계산하기
        UI->>S: 미래 계획·제약 입력 스냅샷 저장
        UI->>C: LOW·EXPECTED·HIGH 일괄 계산 요청

        loop 세 시나리오 모두 선계산
            C->>C: 과거 기저 + 확인한 미래 변경분 적용
            Note over C: LOW 80% / EXPECTED 100% / HIGH 120%<br/>과거 패턴 기저에는 ±20% 미적용
            C->>C: 유효 조합 생성
            Note over C: 사용 카드 최대 2장<br/>신규 카드 최대 1장
            C->>R: 카드별 실적·한도·제외조건 평가
            R-->>C: Gross Benefit + 적용 규칙
            C->>C: Switching Cost 계산
            Note over C: 연회비 + 실적 재적립 손실 + 발급 대기 비용
            C->>C: Net Benefit = Gross - Switching Cost

            alt Net ≥ 50,000원 AND Net ≥ Gross × 15%
                C->>C: 조합 변경안 선택
            else 둘 중 하나라도 미달
                C->>C: 현재 조합 유지 선택
                Note over C: 실패가 아니라 정상 결과
            end

            C->>C: 카테고리별 결제수단 배분
            Note over C: 배분 합과 계획 총액 오차 ≤ 1원
            C->>E: 결과 근거 완전성 검사
            E->>R: 실적·한도·연회비·제외조건·기준일·미반영 항목 조회
            R-->>E: 근거 6항목 + 출처 있는 미반영 상한

            alt 필수 근거 6항목 충족
                E-->>C: 검증 완료
            else 근거 누락
                E-->>C: EVIDENCE_INCOMPLETE
                C-->>UI: 결과 노출 거부
            end
        end

        C-->>UI: 세 시나리오 결과·배분·근거 반환
        UI->>S: 결과와 EXPECTED 기본 탭 저장
        UI-->>U: 예상대로 탭의 결론 + 결제 배분 표시

        opt 사용자가 적게·많이 탭 선택
            U->>UI: 시나리오 탭 전환
            UI->>S: 선택 탭 저장
            UI-->>U: 선계산 결과 표시
            Note over UI: 탭 전환 재계산 0회
        end

        opt 사용자가 계획을 다시 수정
            U->>UI: 입력으로 돌아가기
            S-->>UI: 직전 입력값 복원
            Note over U,C: 수정 후 새 스냅샷으로 다시 계산
        end

        U->>UI: 계산 근거 확인
        UI-->>U: 근거 6항목 + 최대 ±n원 미반영 상한
        Note over UI: 미반영 상한은 결론 차액에 합산하지 않음
        U->>UI: 이 조합 적용하기
        UI->>S: 확정 조합·선택 탭 저장

        alt 신규 카드가 있는 변경안
            UI-->>U: 확정 요약·다음 행동·실행 경계
            U->>UI: 카드사에서 직접 신청하기
            UI->>K: 공식 신청 페이지 새 탭 열기
            K-->>U: 카드사 절차
            U->>UI: CardFit으로 복귀
            S-->>UI: 입력·확정 조합·선택 탭 복원
        else 현재 조합 유지 또는 해지만 포함
            UI-->>U: 계속 사용 또는 직접 해지 안내
            Note over UI,U: 해지 실행 버튼 0개<br/>신청·해지는 카드사에서 직접 진행
        end
    end
```

## 핵심 판정 규칙

| 지점 | 판정 |
| --- | --- |
| 미래 계획 확정 | 사용자가 화면의 전체 값을 확인하면 성립한다. 별도 30% 입력 기준은 없다 |
| 계산 기간 | 기준일로부터 12개월, 결과는 `연 n원` |
| 시나리오 | 확인한 미래 변경분만 80%·100%·120% 적용 |
| 변경 권장 | Net Benefit 5만원 이상이면서 Gross Benefit의 15% 이상 |
| 근거 | 6항목 미달이면 결과 노출 거부 |
| 미반영 상한 | 출처 있는 값만 별도 표시하며 결론 차액에는 미합산 |
| 확정·실행 | CardFit은 계산과 근거까지만 책임지고 신청·해지는 사용자가 카드사에서 직접 수행 |

## 구현 참여자 매핑

| 다이어그램 참여자 | 구현 위치 |
| --- | --- |
| CardFit UI | `src/app`, `src/components` |
| Mock Fixture | `src/fixtures` |
| Session State | `src/state` |
| 계산·혜택 규칙 엔진 | `src/domain` |
| 근거 검증기 | `src/domain` |
| 카드사 공식 페이지 | 외부 아웃링크, 신규 카드 최대 1개 |
