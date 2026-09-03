'use server'

import type { ActionResult } from '@/server/errors'
import type { Profile } from '@/domain/cardfit/types'
import { loadProfile } from '@/server/repositories/profile.repository'

/** 화면이 쓰는 Fixture 적재. Prisma는 Repository 밖으로 나오지 않는다 (`TEC-06`). */

export async function loadProfileAction(fixtureId: string): Promise<ActionResult<Profile>> {
  return loadProfile(fixtureId)
}
