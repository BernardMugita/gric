/** FR-DC-2: auto-compute the total from per-category values, and flag a manual total that doesn't match. */
export function computeSum(values: (number | undefined)[]): number {
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
}

export function sumMismatches(computed: number, manualTotal: number | undefined): boolean {
  return manualTotal !== undefined && manualTotal !== computed
}
