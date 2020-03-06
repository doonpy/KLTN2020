import QueueSave from './save/queue.save';
import QueueJob from './job/queue.job';

export namespace BgrQueue {
    export const Save = QueueSave;
    export type Save = QueueSave;

    export const Job = QueueJob;
    export type Job = QueueJob;
}
