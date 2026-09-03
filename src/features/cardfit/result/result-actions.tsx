'use client'

import { CONCLUSION_COPY } from '@/content/copy'
import { Actions, GhostLink, SecondaryLink } from '@/components/shell'

/**
 * 결과 화면의 행동 — `좋아요`가 종착 행동이다 (`T12`).
 *
 * 북극성(조합안 선택률)의 측정 지점이라 다른 버튼보다 앞에 둔다.
 * 누른 뒤에는 이름이 바뀌어 반영됐다는 것을 알린다 — 같은 버튼을 다시 눌러도
 * 값이 덧쓰기될 뿐이라 되돌릴 것이 없다.
 */
export function ResultActions({
  liked,
  onLike,
}: {
  liked: boolean
  onLike: () => void
}) {
  return (
    <Actions>
      <button
        type="button"
        className={liked ? 'primary liked' : 'primary'}
        aria-pressed={liked}
        onClick={onLike}
      >
        {liked ? '좋아요를 반영했어요' : '이 조합 좋아요'}
      </button>
      <SecondaryLink href="/app/evidence">{CONCLUSION_COPY.evidenceCta}</SecondaryLink>
      <GhostLink href="/app/plan">{CONCLUSION_COPY.editPlanCta}</GhostLink>
    </Actions>
  )
}
