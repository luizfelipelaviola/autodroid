declare global {
  type AtLeastOneProperty<T> = {
    [K in keyof T]-?: Required<Pick<T, K>> &
      Partial<Pick<T, Exclude<keyof T, K>>>;
  }[keyof T];

  type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
      ? RecursivePartial<U>[]
      : T[P] extends object
        ? RecursivePartial<T[P]>
        : T[P];
  };

  type Optional<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> &
    Partial<Pick<T, K>>;

  type EntitySortingOptionsMap<T, U extends keyof T> = {
    [K in U]: T[K];
  };
}

export {};
