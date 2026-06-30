import { Router } from 'express';
import authRoutes from './auth.routes';
import educationRoutes from './education.routes';
import experienceRoutes from './experience.routes';
import projectRoutes from './project.routes';
import skillRoutes from './skill.routes';
import socialLinkRoutes from './social-link.routes';
import strengthRoutes from './strength.routes';
import interestRoutes from './interest.routes';
import languageRoutes from './language.routes';
import newsRoutes from './news.routes';
import userRoutes from './user.routes';
import contactMessageRoutes from './contact-message.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/education', educationRoutes);
router.use('/experience', experienceRoutes);
router.use('/projects', projectRoutes);
router.use('/skills', skillRoutes);
router.use('/social-links', socialLinkRoutes);
router.use('/strengths', strengthRoutes);
router.use('/interests', interestRoutes);
router.use('/languages', languageRoutes);
router.use('/news', newsRoutes);
router.use('/users', userRoutes);
router.use('/contact-messages', contactMessageRoutes);

export default router;
