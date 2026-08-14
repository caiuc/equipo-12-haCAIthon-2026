# API financiera

Las tres rutas reciben `POST` con `Content-Type: application/json`. Todos los
montos se expresan en pesos chilenos (CLP) y todas las tasas del contrato HTTP
se expresan como porcentaje: `2` representa `2%`.

Una respuesta exitosa tiene esta forma:

```json
{ "data": {} }
```

Una solicitud inválida responde con HTTP `400`:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Detalle del campo inválido."
  }
}
```

## Crédito

`POST /api/financial/credit`

Compara el pago mínimo educativo con un pago mensual acelerado.

### Datos de entrada

| Campo | Tipo de dato | Requerido | Descripción |
| --- | --- | :---: | --- |
| `balance` | `number` | Sí | Saldo actual del crédito en CLP. Debe ser mayor que `0`. |
| `monthlyInterestRatePercent` | `number` | Sí | Tasa de interés mensual expresada como porcentaje. Por ejemplo, `2` representa 2% mensual. Debe ser mayor o igual que `0`. |
| `acceleratedMonthlyPayment` | `number` | Sí | Monto fijo que se pagará mensualmente en el escenario acelerado, expresado en CLP. Debe ser mayor que `0`. |

```json
{
  "balance": 100000,
  "monthlyInterestRatePercent": 2,
  "acceleratedMonthlyPayment": 20000
}
```

### Datos de respuesta

| Campo | Tipo de dato | Descripción |
| --- | --- | --- |
| `data.monthlyInterestRatePercent` | `number` | Tasa mensual recibida, conservada como porcentaje. |
| `data.minimum` | `CreditSimulationResult` | Simulación usando el pago mínimo educativo. |
| `data.accelerated` | `CreditSimulationResult` | Simulación usando el pago mensual acelerado. |
| `data.comparison.interestDifference` | `number \| null` | Intereses del escenario mínimo menos los del acelerado. Un valor positivo favorece al pago acelerado. Es `null` si alguno no termina de pagar. |
| `data.comparison.monthsDifference` | `number \| null` | Meses del escenario mínimo menos los del acelerado. Un valor positivo favorece al pago acelerado. Es `null` si alguno no termina de pagar. |

#### Tipo `CreditSimulationResult`

| Campo | Tipo de dato | Descripción |
| --- | --- | --- |
| `initialBalance` | `number` | Saldo inicial en CLP. |
| `totalInterest` | `number` | Total de intereses pagados en CLP. |
| `totalPaid` | `number` | Total pagado en CLP, incluyendo capital e intereses. |
| `remainingBalance` | `number` | Saldo restante al finalizar la simulación. |
| `paidOff` | `boolean` | Indica si el crédito fue pagado completamente. |
| `payoffMonth` | `number \| null` | Mes en que se terminó de pagar; es `null` si no se pagó. |
| `status` | `"paid_off" \| "not_amortizing" \| "max_months_reached"` | Estado final de la simulación. |
| `timeline` | `CreditMonth[]` | Evolución mensual del crédito. |

#### Tipo `CreditMonth`

| Campo | Tipo de dato | Descripción |
| --- | --- | --- |
| `month` | `number` | Número del mes simulado. |
| `startingBalance` | `number` | Saldo al inicio del mes. |
| `interest` | `number` | Interés aplicado durante el mes. |
| `payment` | `number` | Pago realizado durante el mes. |
| `principalPaid` | `number` | Parte del pago que redujo el capital. |
| `endingBalance` | `number` | Saldo al terminar el mes. |

## Deudas

`POST /api/financial/debt`

Compara Bola de Nieve y Avalancha usando todas las deudas ingresadas.

### Datos de entrada

| Campo | Tipo de dato | Requerido | Descripción |
| --- | --- | :---: | --- |
| `monthlyNetIncome` | `number` | Sí | Ingreso líquido mensual en CLP. Debe ser mayor que `0`. |
| `debtAllocationPercent` | `number` | Sí | Porcentaje del ingreso mensual disponible para pagar deudas. Debe ser mayor que `0` y menor o igual que `100`. |
| `debts` | `Debt[]` | Sí | Lista de deudas. Puede incluir múltiples deudas para comparar correctamente ambas estrategias. |

#### Tipo `Debt`

| Campo | Tipo de dato | Requerido | Descripción |
| --- | --- | :---: | --- |
| `id` | `string` | Sí | Identificador único de la deuda. No se permiten IDs duplicados. |
| `name` | `string` | Sí | Nombre visible de la deuda. |
| `balance` | `number` | Sí | Saldo pendiente en CLP. Debe ser mayor o igual que `0`. |
| `monthlyInterestRate` | `number` | Sí | Tasa de interés mensual como porcentaje. Por ejemplo, `3` representa 3% mensual. Debe ser mayor o igual que `0`. |
| `minimumPayment` | `number` | Sí | Pago mínimo mensual de la deuda en CLP. Debe ser mayor o igual que `0`. |

```json
{
  "monthlyNetIncome": 2000000,
  "debtAllocationPercent": 30,
  "debts": [
    {
      "id": "tarjeta",
      "name": "Tarjeta de crédito",
      "balance": 700000,
      "monthlyInterestRate": 3,
      "minimumPayment": 70000
    },
    {
      "id": "consumo",
      "name": "Crédito de consumo",
      "balance": 1000000,
      "monthlyInterestRate": 1,
      "minimumPayment": 100000
    }
  ]
}
```

### Datos de respuesta

| Campo | Tipo de dato | Descripción |
| --- | --- | --- |
| `data.monthlyNetIncome` | `number` | Ingreso líquido mensual normalizado a CLP. |
| `data.debtAllocationPercent` | `number` | Porcentaje del ingreso destinado a deudas. |
| `data.monthlyPaymentCapacity` | `number` | Presupuesto mensual disponible para pagar deudas. |
| `data.totalInitialDebt` | `number` | Suma de los saldos iniciales de todas las deudas. |
| `data.snowball` | `DebtStrategyResult` | Resultado de priorizar primero la deuda con menor saldo. |
| `data.avalanche` | `DebtStrategyResult` | Resultado de priorizar primero la deuda con mayor tasa. |
| `data.comparison` | `DebtPlanComparison` | Diferencias de costo y duración entre las estrategias. |

#### Tipo `DebtStrategyResult`

| Campo | Tipo de dato | Descripción |
| --- | --- | --- |
| `strategy` | `"snowball" \| "avalanche"` | Estrategia simulada. |
| `status` | `"success" \| "insufficient_budget" \| "not_payable"` | Estado final del plan. |
| `monthsToDebtFree` | `number \| null` | Meses necesarios para pagar todo; es `null` si no fue posible. |
| `initialDebt` | `number` | Deuda total al comenzar la estrategia. |
| `totalPaid` | `number` | Total pagado en CLP. |
| `totalInterest` | `number` | Intereses totales pagados en CLP. |
| `monthlyPaymentCapacity` | `number` | Presupuesto mensual disponible. |
| `requiredMinimumPayments` | `number` | Suma de los pagos mínimos requeridos. |
| `monthlyShortfall` | `number` | Monto mensual faltante cuando el presupuesto no cubre los mínimos. |
| `payoffOrder` | `DebtPayoffEvent[]` | Orden y mes en que se paga cada deuda. |
| `timeline` | `DebtTimelineEntry[]` | Evolución mensual de los saldos e intereses. |

#### Tipo `DebtPlanComparison`

| Campo | Tipo de dato | Descripción |
| --- | --- | --- |
| `interestDifference` | `number \| null` | Diferencia absoluta de intereses entre las estrategias. |
| `monthsDifference` | `number \| null` | Diferencia absoluta de duración entre las estrategias. |
| `lowerInterestStrategy` | `"snowball" \| "avalanche" \| "tie" \| null` | Estrategia con menos intereses, empate o `null` si no se pueden comparar. |
| `fasterStrategy` | `"snowball" \| "avalanche" \| "tie" \| null` | Estrategia más rápida, empate o `null` si no se pueden comparar. |

#### Tipos de detalle de deuda

| Tipo | Campos | Descripción |
| --- | --- | --- |
| `DebtPayoffEvent` | `debtId: string`, `debtName: string`, `payoffMonth: number` | Identifica una deuda y el mes en que se terminó de pagar. |
| `DebtTimelineEntry` | `month: number`, `totalRemainingDebt: number`, `totalInterestPaid: number`, `debts: DebtTimelineBalance[]` | Estado consolidado del plan en un mes. |
| `DebtTimelineBalance` | `id: string`, `name: string`, `remainingBalance: number` | Saldo de una deuda dentro de un punto de la línea de tiempo. |

## Inversión

`POST /api/financial/investment`

Proyecta los escenarios educativos de rentabilidad anual de 0%, 5% y 9%.

### Datos de entrada

| Campo | Tipo de dato | Requerido | Descripción |
| --- | --- | :---: | --- |
| `monthlyNetIncome` | `number` | Sí | Ingreso líquido mensual en CLP. Debe ser mayor que `0`. |
| `investmentAllocationPercent` | `number` | Sí | Porcentaje del ingreso que se aportará mensualmente. Debe ser mayor que `0` y menor o igual que `100`. |
| `initialCapital` | `number` | No | Capital inicial en CLP. Debe ser mayor o igual que `0`; si se omite, se usa `0`. |
| `horizonYears` | `number` entero | Sí | Duración de la proyección en años. Debe estar entre `1` y `40`. |

```json
{
  "monthlyNetIncome": 2000000,
  "investmentAllocationPercent": 10,
  "initialCapital": 1000000,
  "horizonYears": 5
}
```

### Datos de respuesta

| Campo | Tipo de dato | Descripción |
| --- | --- | --- |
| `data.monthlyNetIncome` | `number` | Ingreso líquido mensual normalizado a CLP. |
| `data.investmentAllocationPercent` | `number` | Porcentaje mensual destinado a inversión. |
| `data.monthlyContribution` | `number` | Aporte mensual calculado en CLP. |
| `data.initialCapital` | `number` | Capital inicial en CLP. |
| `data.horizonYears` | `number` | Horizonte de inversión en años. |
| `data.months` | `number` | Horizonte total expresado en meses. |
| `data.scenarios` | `InvestmentScenarioResult[]` | Resultados para las rentabilidades anuales de 0%, 5% y 9%. |
| `data.comparison.fiveVsZeroGain` | `number` | Ganancia adicional del escenario 5% frente al 0%. |
| `data.comparison.nineVsZeroGain` | `number` | Ganancia adicional del escenario 9% frente al 0%. |
| `data.comparison.nineVsFiveGain` | `number` | Ganancia adicional del escenario 9% frente al 5%. |

#### Tipo `InvestmentScenarioResult`

| Campo | Tipo de dato | Descripción |
| --- | --- | --- |
| `annualRatePercent` | `number` | Rentabilidad efectiva anual del escenario como porcentaje. |
| `monthlyRateDecimal` | `number` | Tasa mensual equivalente expresada como decimal. |
| `initialCapital` | `number` | Capital inicial en CLP. |
| `monthlyContribution` | `number` | Aporte realizado al final de cada mes en CLP. |
| `horizonYears` | `number` | Horizonte en años. |
| `months` | `number` | Horizonte total en meses. |
| `totalContributions` | `number` | Suma del capital inicial y todos los aportes. |
| `totalReturns` | `number` | Rentabilidad acumulada en CLP. |
| `finalValue` | `number` | Valor final proyectado en CLP. |
| `contributionSharePercent` | `number` | Porcentaje del valor final proveniente de aportes. |
| `returnsSharePercent` | `number` | Porcentaje del valor final proveniente de rentabilidad. |
| `timeline` | `InvestmentTimelineEntry[]` | Evolución mensual del escenario. |

#### Tipo `InvestmentTimelineEntry`

| Campo | Tipo de dato | Descripción |
| --- | --- | --- |
| `month` | `number` | Número del mes; comienza en `0`. |
| `contributedCapital` | `number` | Capital total aportado hasta ese mes. |
| `investmentReturns` | `number` | Rentabilidad acumulada hasta ese mes. |
| `totalValue` | `number` | Valor total de la inversión en ese mes. |

## Ejemplo desde frontend

```ts
const response = await fetch("/api/financial/credit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    balance: 100_000,
    monthlyInterestRatePercent: 2,
    acceleratedMonthlyPayment: 20_000,
  }),
});

const payload = await response.json();

if (!response.ok) {
  throw new Error(payload.error.message);
}

console.log(payload.data);
```
