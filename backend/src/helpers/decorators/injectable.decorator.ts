export const SERVICE_REGISTRY = new Map<string, any>();
export const DEPENDENCIES_REGISTRY = new Map<string, string[]>();

export function Injectable(dependencies: string[] = []) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    SERVICE_REGISTRY.set(constructor.name, constructor);

    if (dependencies.length > 0) {
      DEPENDENCIES_REGISTRY.set(constructor.name, dependencies);
    }

    return constructor;
  };
}