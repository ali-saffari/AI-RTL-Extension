declare const __AI_RTL_DEV__: boolean;

interface DebugPageRequire {
    (id: string): { default: import('react').ComponentType };
}

declare const require: DebugPageRequire;
