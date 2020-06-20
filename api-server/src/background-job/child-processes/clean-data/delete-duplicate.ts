import { DetailUrlDocumentModel } from '@service/detail-url/interface';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import { CleanDataConstant } from '@background-job/child-processes/clean-data/constant';
import RawDataLogic from '@service/raw-data/RawDataLogic';
import DetailUrlLogic from '@service/detail-url/DetailUrlLogic';

type AggregationGroupDataResult = {
    _id: string;
    docList: DetailUrlDocumentModel[];
    docSize: number;
};

const rawDataLogic = RawDataLogic.getInstance();
const detailUrlLogic = DetailUrlLogic.getInstance();

const _deleteDuplicate = async ({
    _id,
    isExtracted,
}: DetailUrlDocumentModel) => {
    await detailUrlLogic.delete(_id);

    if (isExtracted) {
        const idList = (
            await rawDataLogic.getAll({
                conditions: { detailUrlId: _id },
            })
        ).documents.map(({ _id: rawDataId }) => rawDataId);
        const promises = idList.map((rawDataId) =>
            rawDataLogic.delete(rawDataId)
        );
        await Promise.all(promises);
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Clean data - Duplicate data -> DID: ${_id} - RID: ${
                idList[0] ?? NaN
            }`
        ).show();
    } else {
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Clean data - Duplicate data -> DID: ${_id}`
        ).show();
    }
};

/**
 * Delete duplicate detail URL and raw data which scraped from that.
 */
export const deleteDuplicate = async (
    script: AsyncGenerator
): Promise<void> => {
    const aggregationResult = await detailUrlLogic.getWithAggregation<
        AggregationGroupDataResult
    >(CleanDataConstant.DUPLICATE_DETAIL_URL_AGGREGATIONS);
    try {
        for (const item of aggregationResult) {
            const promises = item.docList.map((doc) => _deleteDuplicate(doc));
            await Promise.all(promises);
        }
    } catch (error) {
        new ConsoleLog(
            ConsoleConstant.Type.ERROR,
            `Clean data - Duplicate data - Error: ${error.message}`
        ).show();
    }

    script.next();
};
