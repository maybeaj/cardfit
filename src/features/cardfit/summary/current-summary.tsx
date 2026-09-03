"use client";

import { useState } from "react";
import { CURRENT_STATE_NOTICE } from "@/content/cardfit-copy";
import { won } from "@/domain/cardfit/format";
import { Metric } from "@/components/shell";

/**
 * UI-001 현재 상태 지표 — 최근 12개월 지출액과 받은 혜택.
 *
 * 데이터 출처를 모른다. 화면은 숫자만 받아 그리고, 그 값이 진단에서 왔는지 DB에서
 * 왔는지는 부르는 쪽이 정한다 — 나중에 공급원을 바꿔도 이 파일은 그대로다.
 *
 * 받은 혜택은 관찰값이라 강조한다. 절감 가능액이 아니다 (`T5`).
 */
export function CurrentSummary({
  annualSpend,
  annualBenefit,
}: {
  annualSpend: number;
  annualBenefit: number;
}) {
  // 남이 보는 화면에서 금액을 잠시 가린다. 값 자체는 그대로 두고 표시만 바꾼다
  const [hidden, setHidden] = useState(false);

  return (
    <div className="grid current-summary">
      <Metric label={CURRENT_STATE_NOTICE.spendLabel} className="metric-with-action">
        <div className="metric-value-row">
          <strong className="metric-value tabular-nums">
            {hidden ? CURRENT_STATE_NOTICE.masked : won(annualSpend)}
          </strong>
          <button
            type="button"
            className="visibility-toggle"
            aria-pressed={hidden}
            onClick={() => setHidden((prev) => !prev)}
          >
            <span className="eye-icon" aria-hidden>
              {hidden ? "◌" : "◉"}
            </span>
            <span className="visibility-label">
              {hidden ? CURRENT_STATE_NOTICE.show : CURRENT_STATE_NOTICE.hide}
            </span>
          </button>
        </div>
      </Metric>

      {/* 받은 혜택은 관찰값이라 강조한다. 절감 가능액이 아니다 */}
      <Metric
        label={CURRENT_STATE_NOTICE.benefitLabel}
        className="benefit-highlight"
      >
        <span className="benefit-symbol" aria-hidden>
          ✦
        </span>
        <strong className="tabular-nums">{won(annualBenefit)}</strong>
        <small className="metric-caption">
          {CURRENT_STATE_NOTICE.benefitCaption}
        </small>
      </Metric>
    </div>
  );
}
