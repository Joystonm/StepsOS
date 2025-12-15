export const serializer = {
  serialize: (obj: any) => JSON.stringify(obj),
  deserialize: (str: string) => JSON.parse(str)
};
