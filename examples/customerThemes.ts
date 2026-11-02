import { createMotionTokens, darkTokens } from '@guidoshar/chat-motion-react';

// Customer differences live in this file; the chat markup stays identical.
// These are synthetic palettes, not customer assets or official brand specifications.
export const customerThemes = {
  navy: createMotionTokens('#184c8c', {
    panelRadius: 0, panelPadding: 20, responseGap: 14,
    conversationMaxWidth: 1000, conversationPadding: 20, messageGap: 24,
    responseShadow: '0 1px 2px rgb(15 30 50 / .03), 0 6px 20px rgb(15 30 50 / .05)',
    fontFamily: 'system-ui, sans-serif', codeFontFamily: 'ui-monospace, monospace',
    responseFontSize: 16, responseLineHeight: 1.7, labelSize: 14, orbSize: 46, gap: 10,
    responseTransitionMs: 200, collapseMs: 900, expandMs: 420, activityDotOpacity: .12,
    waitingMessageMs: 5000, waitingVariantMs: 15000,
    revealCharactersPerSecond: 80, revealTailMs: 1200,
  }),
  warm: createMotionTokens('#8a682f', {
    panelRadius: 12, panelPadding: 24, responseGap: 18,
    conversationMaxWidth: 880, conversationPadding: 24, messageGap: 28,
    responseShadow: '0 4px 16px rgb(60 45 20 / .08)',
    fontFamily: 'system-ui, sans-serif', responseFontSize: 17, responseLineHeight: 1.8,
    labelSize: 14, orbSize: 46, gap: 10, responseTransitionMs: 300,
    collapseMs: 650, expandMs: 350, activityDotOpacity: .08,
    waitingMessageMs: 6000, waitingVariantMs: 18000,
    revealCharactersPerSecond: 100, revealTailMs: 800,
  }),
  dark: createMotionTokens('#74b8de', {
    ...darkTokens, panelRadius: 6, panelPadding: 20,
    conversationMaxWidth: 960, conversationPadding: 20, messageGap: 24,
    responseShadow: '0 4px 18px rgb(0 0 0 / .2)',
    linkColor: '#8ecbef', codeBackgroundColor: '#122132', codeTextColor: '#d3e6f6',
    labelSize: 14, orbSize: 46, gap: 10, activityDotOpacity: .08,
  }),
};
