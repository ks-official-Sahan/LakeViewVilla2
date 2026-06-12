"use client";

import { Birds } from "./Birds";
import { Fish } from "./Fish";

/** Phase 4 fauna — fish and birds. */
export function FaunaSystem() {
  return (
    <group name="fauna-system">
      <Fish />
      <Birds />
    </group>
  );
}
