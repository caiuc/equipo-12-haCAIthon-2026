"use client";

import { Plus, Trash2 } from "lucide-react";

import { NumberField } from "@/components/ui/NumberField";
import { formatCLP } from "@/lib/format";
import type { DebtItem } from "@/lib/types";

/**
 * The debt table the Snowball/Avalanche engine runs on. A single "total debt"
 * figure cannot tell the two strategies apart — one orders by balance and the
 * other by rate — so each debt is entered with its own balance, rate and
 * minimum payment.
 */
interface DebtListProps {
  debts: DebtItem[];
  onChange: (debts: DebtItem[]) => void;
}

/** Past this the controls column stops being readable, not an engine limit. */
const MAX_DEBTS = 5;

/** Seed for a new row: a plausible retail card the user then edits. */
const NEW_DEBT = {
  name: "Nueva deuda",
  balance: 200_000,
  monthlyInterestRate: 2.5,
  minimumPayment: 15_000,
} as const;

export function DebtList({ debts, onChange }: DebtListProps) {
  const total = debts.reduce((sum, debt) => sum + debt.balance, 0);

  function updateDebt(id: string, patch: Partial<DebtItem>) {
    onChange(debts.map((debt) => (debt.id === id ? { ...debt, ...patch } : debt)));
  }

  function addDebt() {
    // Timestamp ids: the engine only requires them to be unique within the
    // list, and rows can be removed in any order.
    onChange([...debts, { ...NEW_DEBT, id: `debt-${Date.now()}` }]);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink">
          Tus Deudas
        </p>
        <span className="font-score text-lg leading-none tabular-nums text-ink">
          {formatCLP(total)}
        </span>
      </div>

      <ul className="mt-2.5 grid list-none gap-2.5 p-0">
        {debts.map((debt) => (
          <li key={debt.id} className="pixel pixel-sm pixel-flat pixel-cream p-2.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                aria-label="Nombre de la deuda"
                className="pixel-focus min-w-0 flex-1 bg-transparent text-[11px] font-extrabold uppercase tracking-[0.06em] text-ink outline-none"
                value={debt.name}
                onChange={(event) => updateDebt(debt.id, { name: event.target.value })}
              />

              <button
                type="button"
                onClick={() => onChange(debts.filter((item) => item.id !== debt.id))}
                aria-label={`Eliminar ${debt.name}`}
                className="pixel-focus shrink-0 text-ink-muted transition-colors hover:text-critical"
              >
                <Trash2 size={14} aria-hidden="true" strokeWidth={2.5} />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1.2fr)] gap-2">
              <NumberField
                label="Saldo"
                value={debt.balance}
                step={10_000}
                prefix="$"
                onChange={(balance) => updateDebt(debt.id, { balance })}
              />
              <NumberField
                label="Tasa"
                value={debt.monthlyInterestRate}
                step={0.1}
                suffix="%"
                onChange={(monthlyInterestRate) =>
                  updateDebt(debt.id, { monthlyInterestRate })
                }
              />
              <NumberField
                label="Mínimo"
                value={debt.minimumPayment}
                step={5_000}
                prefix="$"
                onChange={(minimumPayment) => updateDebt(debt.id, { minimumPayment })}
              />
            </div>
          </li>
        ))}
      </ul>

      {debts.length < MAX_DEBTS ? (
        <button
          type="button"
          onClick={addDebt}
          className="pixel-focus mt-2.5 inline-flex items-center gap-1.5 font-pixel text-[9px] uppercase leading-none text-ink-secondary hover:text-accent-strong"
        >
          <Plus size={12} aria-hidden="true" strokeWidth={3} />
          Agregar deuda
        </button>
      ) : null}
    </div>
  );
}
