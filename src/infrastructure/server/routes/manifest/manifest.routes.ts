import { Router } from 'express'
import manifest from '@manifest'

const manifestRoutes = Router()

manifestRoutes.get('/__/manifest', (req, res) => {
  res.json(manifest)
})

export { manifestRoutes }
