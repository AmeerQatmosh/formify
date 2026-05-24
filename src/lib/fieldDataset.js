/**
 * Dataset rows are `{ recordId?, [fieldLabel]: value }`.
 * Mutate label keys without touching recordId.
 */

export function renameLabelInRows(rows, oldLabel, newLabel) {
  if (oldLabel === newLabel) return rows;
  return rows.map((row) => {
    if (!Object.prototype.hasOwnProperty.call(row, oldLabel)) return row;
    const next = { ...row };
    next[newLabel] = next[oldLabel];
    delete next[oldLabel];
    return next;
  });
}

export function dropLabelFromRows(rows, label) {
  return rows.map((row) => {
    if (!Object.prototype.hasOwnProperty.call(row, label)) return row;
    const { [label]: _, ...rest } = row;
    return rest;
  });
}
