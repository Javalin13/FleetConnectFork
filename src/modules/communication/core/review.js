/**
 * FleetConnect Global Review Configuration
 */
import { CommunicationConfig } from './config.js';

export const ReviewConfig = {
    googleReviewUrl: window.FLEETCONNECT_REVIEW_URL || CommunicationConfig.brand.reviewUrl || CommunicationConfig.brand.website,
};
