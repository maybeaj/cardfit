import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('.omx/artifacts/visual-ralph/cardfit-v04')
await mkdir(path.join(root, 'diff'), { recursive: true })

async function difference(name) {
  const referencePath = path.join(root, `reference/${name}-panel.png`)
  const currentPath = path.join(root, `current/${name}-mobile.png`)
  const current = sharp(currentPath).flatten({ background: '#ffffff' })
  const { width = 402, height = 874 } = await current.metadata()
  const reference = await sharp(referencePath)
    .flatten({ background: '#ffffff' })
    .resize(width, height, { fit: 'contain', position: 'top', background: '#ffffff' })
    .png()
    .toBuffer()

  await current
    .composite([{ input: reference, blend: 'difference' }])
    .modulate({ brightness: 1.7, saturation: 2 })
    .png()
    .toFile(path.join(root, `diff/${name}-difference.png`))
}

await difference('result')
await difference('evidence')
