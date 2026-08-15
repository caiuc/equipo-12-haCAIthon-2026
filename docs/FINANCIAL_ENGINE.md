# Motores financieros

El frontend puede ejecutar cada cálculo directamente, de forma síncrona y sin
solicitudes HTTP. Las tres funciones se importan desde el mismo módulo:

```ts
import {
  calculateCreditPlan,
  calculateDebtPlan,
  calculateInvestmentPlan,
} from "@/lib/mathEngine";
```

Cada componente puede importar solamente la función que necesita. Todos los
montos se expresan en pesos chilenos (CLP) y las tasas públicas como
porcentajes: `2` representa `2%`.

## Crédito

```ts
calculateCreditPlan(input: CreditEngineInput): CreditEngineResult
```

| Campo | Tipo | Requerido | Descripción |
| --- | --- | :---: | --- |
| `balance` | `number` | Sí | Saldo actual en CLP. Debe ser mayor que `0`. |
| `monthlyInterestRatePercent` | `number` | Sí | Tasa mensual porcentual. Debe ser mayor o igual que `0`. |
| `acceleratedMonthlyPayment` | `number` | Sí | Pago mensual acelerado en CLP. Debe ser mayor que `0`. |

La respuesta incluye `minimum`, `accelerated`, sus líneas de tiempo y
`comparison`. Las diferencias se calculan como pago mínimo menos pago
acelerado; un valor positivo favorece al pago acelerado.

```ts
const creditResult = calculateCreditPlan({
  balance: 100_000,
  monthlyInterestRatePercent: 2,
  acceleratedMonthlyPayment: 20_000,
});
```

## Deudas

```ts
calculateDebtPlan(input: DebtPlanInput): DebtPlanResult
```

| Campo | Tipo | Requerido | Descripción |
| --- | --- | :---: | --- |
| `monthlyNetIncome` | `number` | Sí | Ingreso líquido mensual en CLP. |
| `debtAllocationPercent` | `number` | Sí | Porcentaje del ingreso destinado al pago de deudas. Debe ser mayor que `0` y menor o igual que `100`. |
| `debts` | `Debt[]` | Sí | Deudas que se compararán mediante Bola de Nieve y Avalancha. |

### Tipo `Debt`

| Campo | Tipo | Requerido | Descripción |
| --- | --- | :---: | --- |
| `id` | `string` | Sí | Identificador único de la deuda. |
| `name` | `string` | Sí | Nombre visible de la deuda. |
| `balance` | `number` | Sí | Saldo pendiente en CLP. |
| `monthlyInterestRate` | `number` | Sí | Tasa mensual porcentual. |
| `minimumPayment` | `number` | Sí | Pago mínimo mensual en CLP. |

La respuesta incluye los planes `snowball`, `avalanche`, sus líneas de tiempo,
órdenes de pago y la comparación final.

```ts
const debtResult = calculateDebtPlan({
  monthlyNetIncome: 2_000_000,
  debtAllocationPercent: 30,
  debts: [
    {
      id: "tarjeta",
      name: "Tarjeta de crédito",
      balance: 700_000,
      monthlyInterestRate: 3,
      minimumPayment: 70_000,
    },
  ],
});
```

## Inversión

```ts
calculateInvestmentPlan(input: InvestmentPlanInput): InvestmentPlanResult
```

| Campo | Tipo | Requerido | Descripción |
| --- | --- | :---: | --- |
| `monthlyNetIncome` | `number` | Sí | Ingreso líquido mensual en CLP. |
| `investmentAllocationPercent` | `number` | Sí | Porcentaje del ingreso destinado al aporte mensual. |
| `initialCapital` | `number` | No | Capital inicial en CLP. Si se omite, se usa `0`. |
| `horizonYears` | `number` entero | Sí | Horizonte de inversión entre 1 y 40 años. |

La respuesta incluye el aporte mensual y los escenarios educativos de
rentabilidad anual de 0%, 5% y 9%, junto con sus líneas de tiempo.

```ts
const investmentResult = calculateInvestmentPlan({
  monthlyNetIncome: 2_000_000,
  investmentAllocationPercent: 10,
  initialCapital: 1_000_000,
  horizonYears: 5,
});
```

Los errores de datos se informan mediante excepciones `TypeError`, `RangeError`
o `InvestmentValidationError`. Cada formulario puede envolver su llamada en
`try/catch` y mostrar el mensaje correspondiente.
