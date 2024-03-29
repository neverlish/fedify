import { encodeBase58 } from "@std/encoding/base58";
import type { PropertySchema, TypeSchema } from "./schema.ts";
import { areAllScalarTypes, getTypeNames } from "./type.ts";

export async function getFieldName(
  propertyUri: string,
  prefix = "#",
): Promise<string> {
  const hashedUri = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(propertyUri),
  );
  return `${prefix}_${encodeBase58(hashedUri)}`;
}

export async function generateField(
  property: PropertySchema,
  types: Record<string, TypeSchema>,
  prefix = "#",
): Promise<string> {
  const fieldName = await getFieldName(property.uri, prefix);
  if (areAllScalarTypes(property.range, types)) {
    return `${fieldName}: ${
      getTypeNames(property.range, types, true)
    }[] = [];\n`;
  } else {
    return `${fieldName}: (${
      getTypeNames(property.range, types)
    } | URL)[] = [];\n`;
  }
}

export async function* generateFields(
  typeUri: string,
  types: Record<string, TypeSchema>,
): AsyncIterable<string> {
  const type = types[typeUri];
  for (const property of type.properties) {
    yield await generateField(property, types);
  }
}
