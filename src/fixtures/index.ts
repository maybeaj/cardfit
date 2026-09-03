import type { Profile } from '@/domain/cardfit/types'
import { changeCase } from './change-case'
import { maintainCase } from './maintain-case'

/**
 * Mock 프로필 2개는 내부 테스트 fixture다.
 * 화면에 프로필 선택 UI나 인물 이름을 노출하지 않는다 (T17 · P03).
 * 기본 흐름은 변경형 1세트를 이름 없이 로드하고, 유지형은 테스트에서만 주입한다.
 */
export const DEFAULT_PROFILE: Profile = changeCase

export const PROFILES = { change_case: changeCase, maintain_case: maintainCase } as const
export type ProfileId = keyof typeof PROFILES

export { changeCase, maintainCase }
