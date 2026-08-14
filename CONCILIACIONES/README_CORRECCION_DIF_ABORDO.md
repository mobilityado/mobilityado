# CONCIL.IA Enterprise 9.3 — Corrección DIF.ABORDO

Esta entrega agrega la regla de negocio de cancelaciones de efectivo del reporte CIA:

- Lee el campo `Dif. Abordo` / `DIF.ABORDO` del resumen por marca del CIA.
- Normaliza cualquier importe detectado como un ajuste negativo.
- Lo coloca en la sección **Efectivo abordo > (+) Ingreso manual** junto a su marca:
  - SUR VOLKSBUS
  - SUR
  - TRT
  - TRT VB
- Mantiene las fórmulas del formato oficial para que el ajuste reste del **Total Efectivo abordo**, del **Total Efectivo** y del **Total de efectivo a depositar**.
- Muestra en el portal una validación de las cancelaciones detectadas por marca.
- CONCI puede responder preguntas sobre `DIF.ABORDO` o cancelaciones de efectivo.

El archivo MasterWeb descargado conserva el formato oficial de la empresa.
