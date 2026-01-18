export interface Storage {
    get: (key: string) => Promise<{ value: string | null }>;
    set: (key: string, value: string) => Promise<void>;
    delete: (key: string) => Promise<void>;
}

declare global {
    interface Window {
        storage: Storage;
    }
}

export const initStorage = () => {
    window.storage = {
        get: async (key: string) => {
            const value = localStorage.getItem(key);
            return { value };
        },
        set: async (key: string, value: string) => {
            localStorage.setItem(key, value);
        },
        delete: async (key: string) => {
            localStorage.removeItem(key);
        }
    };
};
