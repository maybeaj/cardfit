'use client'

import { CONCLUSION_COPY } from '@/content/cardfit-copy'
import { Actions, GhostLink } from '@/components/shell'

/**
 * 결과 화면의 행동 — 조합 선택이 종착 행동이다 (`T12`).
 *
 * 북극성(조합안 선택률)의 측정 지점이라 다른 버튼보다 앞에 둔다. 누르면 같은 화면에서
 * `다음에 하면 되는 일`이 펼쳐진다 — 별도 확정 화면으로 넘기지 않는다.
 *
 * **근거로 가는 링크를 여기 두지 않는다.** 근거는 결론 카드의 `계산 기준 보기`가
 * 시트로 열고, 더 볼 사람만 그 시트에서 전체 근거로 넘어간다. 여기에 또 두면 같은 곳으로
 * 가는 문이 둘이 되고, 금액을 보던 자리를 떠나야 이유를 알 수 있는 것처럼 읽힌다.
 */
export function ResultActions({ liked, onLike }: { liked: boolean; onLike: () => void }) {
  return (
    <Actions>
      <button
        type="button"
        className={liked ? 'primary liked' : 'primary'}
        aria-pressed={liked}
        onClick={onLike}
      >
        {liked ? CONCLUSION_COPY.likedCta : CONCLUSION_COPY.likeCta}
      </button>
      <GhostLink href="/app/plan">{CONCLUSION_COPY.editPlanCta}</GhostLink>
    </Actions>
  )
}
