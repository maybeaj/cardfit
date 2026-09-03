'use client'

import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * 바텀시트 primitive — 기준본의 오버레이 3종이 공유하는 껍데기.
 *
 * 마이데이터 동의·카테고리 선택·계산 기준이 각자 backdrop과 닫기 처리를 따로 구현하면
 * 세 개가 조금씩 다르게 동작한다. 실제로 그랬다 — 어떤 시트는 ESC로 닫히고 어떤 시트는
 * 스크롤을 잠그지 않았다. 껍데기를 하나로 두고 내용만 갈아 끼운다.
 *
 * 닫는 경로는 넷이고 전부 같은 곳으로 모인다 — 닫기 버튼, backdrop 클릭, `Escape`,
 * 그리고 **브라우저 뒤로가기**. 모바일에서 시트를 뒤로가기로 닫으려는 건 자연스러운
 * 동작인데, 처리하지 않으면 시트를 열어 둔 채 이전 화면으로 나가 버린다.
 */
export function BottomSheet({
  open,
  onClose,
  labelledBy,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  /** 제목 노드의 id. `BottomSheet.Header`가 넘겨주는 값을 그대로 쓴다 */
  labelledBy?: string
  className?: string
  children: ReactNode
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  /** 뒤로가기용으로 우리가 밀어 넣은 history 항목이 아직 스택에 있는지 */
  const pushedRef = useRef(false)

  const close = useCallback(() => {
    if (pushedRef.current) {
      // 우리 항목을 걷어내면 popstate가 돌아 아래 핸들러가 onClose를 부른다
      pushedRef.current = false
      window.history.back()
      return
    }
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    /*
     * 바깥 스크롤을 잠근다. 잠그지 않으면 시트 끝에서 계속 쓸어내릴 때 뒤 화면이
     * 따라 움직여 시트가 떠 있는 종이처럼 보인다.
     */
    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    document.querySelector('.mobile-shell')?.classList.add('modal-open')

    window.history.pushState({ cardfitSheet: true }, '')
    pushedRef.current = true

    const onPop = () => {
      pushedRef.current = false
      onClose()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener('popstate', onPop)
    document.addEventListener('keydown', onKey)
    sheetRef.current?.focus()

    return () => {
      body.style.overflow = previousOverflow
      document.querySelector('.mobile-shell')?.classList.remove('modal-open')
      window.removeEventListener('popstate', onPop)
      document.removeEventListener('keydown', onKey)
      /*
       * 여기서 `history.back()`을 부르지 않는다.
       *
       * 정리가 도는 이유는 둘이다 — 사용자가 시트를 닫았거나, 시트 안의 링크로 다른
       * 화면에 갔거나. 앞의 경우는 `close()`가 이미 되돌렸고, 뒤의 경우에 되돌리면
       * **그 이동 자체가 취소돼** 화면이 제자리로 돌아온다. 실제로 `전체 근거 보기`와
       * `동의하고 계속하기`가 먹통이 됐다.
       *
       * 남는 비용은 부모가 `open`을 직접 내렸을 때 더미 항목 하나가 스택에 남는 것뿐이고,
       * 그 경우는 곧바로 화면을 옮기므로 사용자가 마주치지 않는다.
       */
      pushedRef.current = false
    }
  }, [open, onClose, close])

  if (!open) return null

  return (
    <div
      className="sheet-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={className ? `bottom-sheet ${className}` : 'bottom-sheet'}
      >
        <div className="sheet-handle" aria-hidden />
        {children}
      </div>
    </div>
  )
}

/**
 * 시트 머리 — 닫기 버튼·눈썹 문구·제목·부연.
 *
 * 제목 id를 부르는 쪽이 만들어 넘긴다. 시트가 스스로 만들면 `aria-labelledby`로
 * 이어 붙일 방법이 없다.
 */
BottomSheet.Header = function BottomSheetHeader({
  id,
  eyebrow,
  title,
  lead,
  onClose,
  closeLabel = '시트 닫기',
}: {
  id: string
  eyebrow?: string
  title: ReactNode
  lead?: string
  onClose: () => void
  closeLabel?: string
}) {
  return (
    <>
      <button type="button" className="sheet-close" onClick={onClose} aria-label={closeLabel}>
        ×
      </button>
      {eyebrow ? <div className="sheet-eyebrow">{eyebrow}</div> : null}
      <h2 id={id}>{title}</h2>
      {lead ? <p className="sheet-sub">{lead}</p> : null}
    </>
  )
}

/** 시트 바닥의 행동. 하나면 꽉 채우고 둘이면 나눠 놓는다 */
BottomSheet.Actions = function BottomSheetActions({ children }: { children: ReactNode }) {
  return <div className="sheet-actions">{children}</div>
}

/** 제목 id를 만들어 준다 — `useId`를 부르는 쪽마다 반복하지 않기 위해서다 */
export function useSheetTitleId() {
  return useId()
}
