import { SERVICE_REGISTRY, DEPENDENCIES_REGISTRY } from './decorators/injectable.decorator';

class Container {
  private static instance: Container;
  private instances: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  register<T>(name: string, instance: T): void {
    this.instances.set(name, instance);
  }

  get<T>(serviceName: string): T {
    if (this.instances.has(serviceName)) {
      return this.instances.get(serviceName) as T;
    }

    const ServiceClass = SERVICE_REGISTRY.get(serviceName);
    if (!ServiceClass) {
      throw new Error(`Servicio "${serviceName}" no está registrado`);
    }

    const dependenciesNames = DEPENDENCIES_REGISTRY.get(serviceName) || [];

    const dependencies = dependenciesNames.map(depName => this.get(depName));

    const instance = new ServiceClass(...dependencies);

    this.instances.set(serviceName, instance);

    return instance as T;
  }

  has(serviceName: string): boolean {
    return SERVICE_REGISTRY.has(serviceName) || this.instances.has(serviceName);
  }
}

export const container = Container.getInstance();