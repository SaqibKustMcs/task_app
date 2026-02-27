export interface RequestUser {
    id: string;
    role?: string;
    departmentId?: string | null;
}
export declare const User: (...dataOrPipes: unknown[]) => ParameterDecorator;
