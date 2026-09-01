# Issue Map — CardFit

> GitHub: [`maybeaj/cardfit`](https://github.com/maybeaj/cardfit) · 생성일 2026-09-01  
> 구성: Epic 9건(`#1~#9`) + 원자 Task 54건(`#10~#63`)

| Task | GitHub Issue | 선행 Issue | 시작 조건 |
| --- | --- | --- | --- |
| IN-01 | [#1](https://github.com/maybeaj/cardfit/issues/1) | 없음 | 즉시 |
| DS-01 | [#2](https://github.com/maybeaj/cardfit/issues/2) | #1 | 앱 셸 실행 가능 |
| FX-01 | [#3](https://github.com/maybeaj/cardfit/issues/3) | #1 | 타입·테스트 기반 존재 |
| CE-01 | [#4](https://github.com/maybeaj/cardfit/issues/4) | #3 | Fixture와 정답 계약 확정 |
| FE-01 | [#5](https://github.com/maybeaj/cardfit/issues/5) | #2, #3 | 공통 UI와 예시 데이터 준비 |
| FE-02 | [#6](https://github.com/maybeaj/cardfit/issues/6) | #2, #3 | 공통 UI와 제안값 준비 |
| FE-03 | [#7](https://github.com/maybeaj/cardfit/issues/7) | #4, #6 | 계산 결과 계약과 입력 흐름 준비 |
| QA-01 | [#8](https://github.com/maybeaj/cardfit/issues/8) | #4, #7 | 계산·결과 구현 완료 |
| QA-02 | [#9](https://github.com/maybeaj/cardfit/issues/9) | #5~#8 | 전체 Happy Path 연결 |

## 원자 Task Issue 범위

| Epic | Task 수 | GitHub Issue |
| --- | ---: | --- |
| IN-01 | 5 | [#10](https://github.com/maybeaj/cardfit/issues/10)~[#14](https://github.com/maybeaj/cardfit/issues/14) |
| DS-01 | 7 | [#15](https://github.com/maybeaj/cardfit/issues/15)~[#21](https://github.com/maybeaj/cardfit/issues/21) |
| FX-01 | 6 | [#22](https://github.com/maybeaj/cardfit/issues/22)~[#27](https://github.com/maybeaj/cardfit/issues/27) |
| CE-01 | 10 | [#28](https://github.com/maybeaj/cardfit/issues/28)~[#37](https://github.com/maybeaj/cardfit/issues/37) |
| FE-01 | 5 | [#38](https://github.com/maybeaj/cardfit/issues/38)~[#42](https://github.com/maybeaj/cardfit/issues/42) |
| FE-02 | 6 | [#43](https://github.com/maybeaj/cardfit/issues/43)~[#48](https://github.com/maybeaj/cardfit/issues/48) |
| FE-03 | 7 | [#49](https://github.com/maybeaj/cardfit/issues/49)~[#55](https://github.com/maybeaj/cardfit/issues/55) |
| QA-01 | 4 | [#56](https://github.com/maybeaj/cardfit/issues/56)~[#59](https://github.com/maybeaj/cardfit/issues/59) |
| QA-02 | 4 | [#60](https://github.com/maybeaj/cardfit/issues/60)~[#63](https://github.com/maybeaj/cardfit/issues/63) |

원자 Task의 제목·요구사항·선행 관계 정본은 [`TASK_LIST.md`](TASK_LIST.md)다. GitHub Project는 아직 만들지 않는다. 32시간 범위에서는 Issue의 open/closed 상태와 위 선행 관계만으로 충분하며, 별도 보드 운영이 필요해질 때 `.github/labels.md`의 필드 정의를 사용한다.
