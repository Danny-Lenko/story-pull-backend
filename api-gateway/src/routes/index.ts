import { Router } from 'express';
import authRoutes from './auth.routes';
import contentRoutes from './content.routes';
import userRoutes from './user.routes';
import analyticsRoutes from './analytics.routes';
import mediaRoutes from './media.routes';
import searchRoutes from './search.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/media', mediaRoutes);
router.use('/search', searchRoutes);

export default router;
