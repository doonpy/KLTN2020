import { initAdministrativeData } from './administrative';
import { initVisualSummaryData } from '@background-job/initialize-data/visual-summary';
import { initVisualAnalyticsData } from '@background-job/initialize-data/visual-analytics';

/**
 * Main
 */
export const initData = async (): Promise<void> => {
    await initAdministrativeData();
    await initVisualSummaryData();
    await initVisualAnalyticsData();
};
