"use client";

import { useState } from "react";
import Image from "next/image";
import { CURRENT_STATE_NOTICE, DATA_NOTICE } from "@/content/cardfit-copy";
import type { Diagnosis } from "@/domain/cardfit/diagnose";
import { HORIZON_MONTHS } from "@/domain/cardfit/plan";
import { percent, won } from "@/domain/cardfit/format";
import { CARD_ART } from "@/fixtures/mydata/rules";

/**
 * UI-001 보유 카드 목록 — 누르면 주요 혜택이 펼쳐진다.
 *
 * 한 번에 하나만 연다. 여러 장을 동시에 펼치면 화면이 길어져 아래 CTA가 밀린다.
 * 이미지가 없는 카드는 기준본의 `.art` 그라데이션 자리표시를 쓴다 — 다른 카드의
 * 이미지를 빌려 쓰면 그 카드인 것처럼 보여 `T18`을 깬다.
 */
export function OwnedCardList({ cards }: { cards: Diagnosis["perCard"] }) {
  const [openCard, setOpenCard] = useState<string | null>(null);

  return (
    <>
      <div className="section-heading">
        <h3>{CURRENT_STATE_NOTICE.cardsHeading}</h3>
        <p>{CURRENT_STATE_NOTICE.cardsLead}</p>
      </div>

      <div className="grid card-list">
        {cards.map((card, index) => {
          const open = openCard === card.card_id;
          const art = CARD_ART[card.card_id];
          return (
            <div key={card.card_id}>
              <button
                type="button"
                className="cardrow card-toggle"
                aria-expanded={open}
                onClick={() => setOpenCard(open ? null : card.card_id)}
              >
                {art ? (
                  <Image
                    className="card-art"
                    src={art}
                    alt=""
                    width={48}
                    height={30}
                  />
                ) : (
                  <span className={`art tone-${(index % 3) + 1}`} aria-hidden />
                )}
                <div className="card-copy">
                  <div className="card-title-row">
                    <b>{card.name}</b>
                    <span className="category-tag">
                      {DATA_NOTICE.sampleBadge}
                    </span>
                  </div>
                  <small>
                    {card.issuer} · 최근 12개월 혜택{" "}
                    {won(card.monthlyBenefit * HORIZON_MONTHS)}
                  </small>
                </div>
                <span className="card-chevron" aria-hidden>
                  {open ? "⌃" : "⌄"}
                </span>
              </button>

              {open ? (
                <div className="card-detail">
                  <b>{card.name} 주요 혜택</b>
                  <ul>
                    <li>
                      <span className="benefit-list-icon" aria-hidden>
                        📈
                      </span>
                      적용 적립·할인율{" "}
                      {card.tier ? percent(card.tier.rate) : "—"}
                    </li>
                    <li>
                      <span className="benefit-list-icon" aria-hidden>
                        🎯
                      </span>
                      월 한도 {card.tier ? won(card.tier.monthly_cap) : "—"}
                    </li>
                    <li>
                      <span className="benefit-list-icon" aria-hidden>
                        💳
                      </span>
                      연회비 {won(card.annual_fee)}
                    </li>
                    <li>
                      <span className="benefit-list-icon" aria-hidden>
                        🛍️
                      </span>
                      혜택 대상 {card.categories.length}종
                    </li>
                  </ul>
                  <p className="mt-2 mb-0 text-[9px] leading-[1.4] text-[var(--color-subtle)]">
                    {card.categories.join(" · ")}
                  </p>
                  {card.tierIsLowest ? (
                    <p className="mt-2 mb-0 rounded-lg bg-[var(--color-amber)] px-2.5 py-2 text-[9px] text-[var(--color-warning)]">
                      {CURRENT_STATE_NOTICE.lowestTier}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
