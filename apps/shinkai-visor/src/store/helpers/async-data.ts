export interface AsyncData<DataType, ErrorType = string> {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error?: ErrorType;
    data?: DataType;
}
