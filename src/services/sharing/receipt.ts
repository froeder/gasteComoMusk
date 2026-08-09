import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import type { GameSummary, UserProfile, WealthSnapshot } from "@/src/types";
import { formatCurrency, formatPercentageFromBasisPoints } from "@/src/utils/money";
import { formatDuration } from "@/src/utils/time";

export function buildReceiptHtml(profile: UserProfile, summary: GameSummary, snapshot: WealthSnapshot): string {
  const rows = summary.boughtItems
    .slice(0, 30)
    .map(
      (item) => `<tr><td>${item.quantity}x</td><td>${item.name}</td><td>${formatCurrency(item.subtotalCents)}</td></tr>`,
    )
    .join("");

  return `<!doctype html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #07101f; color: #f8fafc; padding: 28px; }
        .receipt { border: 1px solid #8cff4f; border-radius: 16px; padding: 24px; }
        h1 { margin: 0 0 4px; color: #8cff4f; }
        .muted { color: #b7c1d4; }
        table { width: 100%; border-collapse: collapse; margin-top: 18px; }
        td { border-bottom: 1px solid #26364f; padding: 8px 0; }
        td:last-child { text-align: right; }
        .total { font-size: 24px; color: #8cff4f; font-weight: 800; }
        .footer { margin-top: 20px; font-size: 12px; color: #b7c1d4; }
      </style>
    </head>
    <body>
      <section class="receipt">
        <h1>Gaste como Musk</h1>
        <p class="muted">Nota divertida sem validade fiscal</p>
        <p>Apelido: <strong>${profile.nickname}</strong></p>
        <p>Partida: ${summary.gameId}</p>
        <p>Fortuna inicial: ${formatCurrency(snapshot.initialWealthCents)}</p>
        <p class="total">Total gasto: ${formatCurrency(summary.totalSpentCents)}</p>
        <p>Saldo restante: ${formatCurrency(summary.remainingBalanceCents)}</p>
        <p>Percentual gasto: ${formatPercentageFromBasisPoints(summary.percentageSpentBasisPoints)}</p>
        <p>Tempo ativo: ${formatDuration(summary.activeDurationMs)}</p>
        <p>Categoria favorita: ${summary.mainCategory}</p>
        <p>Item mais caro: ${summary.mostExpensiveItemName ?? "Nenhum"}</p>
        <table>${rows}</table>
        <p class="footer">Simulacao ficticia - sem valor fiscal. Patrimonio e cotacao sao estimativas e podem variar por mercado e metodologia.</p>
      </section>
    </body>
  </html>`;
}

export function buildShareText(summary: GameSummary): string {
  return `Consegui gastar ${formatCurrency(summary.totalSpentCents)} da fortuna simulada em ${formatDuration(
    summary.activeDurationMs,
  )}. Isso representa ${formatPercentageFromBasisPoints(summary.percentageSpentBasisPoints)} da fortuna. Voce consegue gastar mais rapido?`;
}

export async function shareReceiptPdf(profile: UserProfile, summary: GameSummary, snapshot: WealthSnapshot): Promise<void> {
  const html = buildReceiptHtml(profile, summary, snapshot);
  const file = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/pdf",
      dialogTitle: "Compartilhar recibo Gaste como Musk",
      UTI: "com.adobe.pdf",
    });
  }
}
