import AddButton from '@/components/AddButton'
import GridRow from '@/components/RecordGrid/GridRow'
import InlineRemoveButton from '@/components/RecordGrid/InlineRemoveButton'
import styles from './styles.module.css'

type TextColumn<T> = {
  kind: 'text' | 'description'
  value: (row: T) => string
  update: (row: T, value: string) => T
}

type NumberColumn<T> = {
  kind: 'number'
  value: (row: T) => number
  update: (row: T, value: number) => T
}

type SelectColumn<T> = {
  kind: 'select'
  value: (row: T) => string
  options: readonly { value: string; label: string }[]
  update: (row: T, value: string) => T
}

export type GridColumn<T> = {
  id: string
  label: string
  width?: string
} & (TextColumn<T> | NumberColumn<T> | SelectColumn<T>)

type RecordGridProps<T extends { id: string; name: string }> = {
  label: string
  rows: T[]
  columns: GridColumn<T>[]
  onChange: (rows: T[]) => void
  createRow: () => T
  addLabel: string
  emptyMessage: string
}

const RecordGrid = <T extends { id: string; name: string }>({
  label,
  rows,
  columns,
  onChange,
  createRow,
  addLabel,
  emptyMessage,
}: RecordGridProps<T>) => {
  const update = (next: T) => onChange(rows.map((row) => (row.id === next.id ? next : row)))

  return (
    <div className={styles.section}>
      <section className={styles.scroll} aria-label={`${label} grid`}>
        <table className={styles.table} aria-label={label}>
          <colgroup>
            {columns.map((column) => (
              <col key={column.id} style={{ width: column.width }} />
            ))}
            <col className={styles.actionColumn} />
          </colgroup>
          <thead>
            <tr>
              {columns.map((column) => (
                <th scope="col" key={column.id}>
                  {column.label}
                </th>
              ))}
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <GridRow key={row.id}>
                {columns.map((column) => {
                  const accessibleLabel = `${column.label}, row ${index + 1}`
                  return (
                    <td key={column.id}>
                      {column.kind === 'description' || column.kind === 'text' ? (
                        <textarea
                          className={styles.cell}
                          aria-label={accessibleLabel}
                          rows={1}
                          value={column.value(row)}
                          onChange={(event) => update(column.update(row, event.target.value))}
                        />
                      ) : column.kind === 'select' ? (
                        <select
                          className={styles.cell}
                          aria-label={accessibleLabel}
                          value={column.value(row)}
                          onChange={(event) => update(column.update(row, event.target.value))}
                        >
                          {column.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : column.kind === 'number' ? (
                        <input
                          className={styles.cell}
                          aria-label={accessibleLabel}
                          type="number"
                          required
                          min={0}
                          step={1}
                          max={Number.MAX_SAFE_INTEGER}
                          value={column.value(row)}
                          onChange={(event) => {
                            const input = event.currentTarget
                            if (!input.reportValidity()) return
                            update(column.update(row, input.valueAsNumber))
                          }}
                        />
                      ) : null}
                    </td>
                  )
                })}
                <td>
                  <InlineRemoveButton
                    name={row.name}
                    rowNumber={index + 1}
                    onConfirm={() => onChange(rows.filter((item) => item.id !== row.id))}
                  />
                </td>
              </GridRow>
            ))}
          </tbody>
        </table>
      </section>
      {rows.length === 0 && <p className={styles.empty}>{emptyMessage}</p>}
      <AddButton onClick={() => onChange([...rows, createRow()])}>{addLabel}</AddButton>
    </div>
  )
}

export default RecordGrid
