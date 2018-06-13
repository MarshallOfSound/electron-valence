export type EnjoiSchema = {
  type: 'object';
  properties: {
    [propertyName: string]: EnjoiSchema;
  };
  additionalProperties?: boolean;
  minProperties?: number;
  maxProperties?: number;
} | {
  type: 'string';
  enum?: string[];
  format: 'date' | 'date-time';
  minimum?: string;
  maximum?: string;
} | {
  type: 'string';
  enum?: string[];
  format: 'binary';
  minLength?: number;
  maxLength?: number;
} | {
  type: 'string';
  enum?: string[];
  format?: 'email' | 'hostname' | 'ipv4' | 'ipv6' | 'uri' | 'byte';
  pattern?: string;
  minLength?: number;
  maxLength?: number;
} | {
  type: 'integer' | 'number';
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
} | {
  type: 'boolean';
} | {
  type: 'array';
  items: EnjoiSchema[];
  ordered: EnjoiSchema[];
  additionalItems?: boolean;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
} | {
  type: 'null';
};

export enum PropertyType {
  VALUE,
  METHOD,
  OBJECT
}

export type SimpleProperty = {
  type: PropertyType.METHOD;
  argValidators: EnjoiSchema[];
} | {
  type: PropertyType.VALUE;
} | {
  type: PropertyType.OBJECT;
  properties: TypeInterface;
};

export type Property = SimpleProperty | {
  type: PropertyType.METHOD;
  argValidators?: EnjoiSchema[];
} | PropertyType.VALUE;

export interface TypeInterface {
  [propertyName: string]: Property;
}

export const simplifyProperty = (prop: Property): SimpleProperty => {
  if (prop === PropertyType.VALUE) {
    return {
      type: PropertyType.VALUE,
    };
  }
  if (prop.type === PropertyType.METHOD) {
    return {
      type: PropertyType.METHOD,
      argValidators: prop.argValidators || [],
    }
  }
  return prop;
}
