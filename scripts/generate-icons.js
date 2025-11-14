import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const publicDir = join(rootDir, 'public')

const iconPath = join(publicDir, 'icon.png')
const sizes = [64, 192, 512]

async function generateIcons() {
  try {
    const iconBuffer = readFileSync(iconPath)
    
    for (const size of sizes) {
      const outputPath = join(publicDir, `pwa-${size}x${size}.png`)
      await sharp(iconBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath)
      console.log(`Generated ${outputPath}`)
    }
    
    // Generate maskable icon (512x512 with padding for maskable)
    const maskablePath = join(publicDir, 'maskable-icon-512x512.png')
    await sharp(iconBuffer)
      .resize(384, 384) // 75% of 512 to leave safe zone
      .extend({
        top: 64,
        bottom: 64,
        left: 64,
        right: 64,
        background: { r: 30, g: 64, b: 175, alpha: 1 } // #1e40af
      })
      .png()
      .toFile(maskablePath)
    console.log(`Generated ${maskablePath}`)
    
    // Generate favicon.png (32x32) - modern browsers support PNG favicons
    const faviconPath = join(publicDir, 'favicon.png')
    await sharp(iconBuffer)
      .resize(32, 32)
      .png()
      .toFile(faviconPath)
    console.log(`Generated ${faviconPath}`)
    
    console.log('All icons generated successfully!')
  } catch (error) {
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

generateIcons()

