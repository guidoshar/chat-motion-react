'use client';

import { useRef } from 'react';
import { StatusPill } from './StatusPill.js';
import { StreamingText } from './StreamingText.js';
import { responsePresets, type ResponsePreset } from './responsePresets.js';
import { motionTokens, type MotionTokens, type MotionStyle } from './tokens.js';
import { useMotionActivity } from './useMotionActivity.js';

export type ResponsePhase = 'thinking' | 'streaming' | 'complete' | 'error' | 'idle';
export interface ResponseExperienceProps {
  /** Complete accumulated reply. This component never calls a model or queues text. */
  text: string;
  phase?: ResponsePhase;
  preset?: ResponsePreset;
  /** Public stage summary, never private model reasoning. */
  label?: string;
  detail?: string;
  paused?: boolean;
  announce?: boolean;
  tokens?: MotionTokens;
  style?: MotionStyle;
  className?: string;
}
const labels: Record<ResponsePhase, string> = {
  thinking: '正在思考', streaming: '正在组织回答', complete: '已完成', error: '暂时中断', idle: '等待开始',
};

/** Coordinated thinking → streaming → completion. Host owns all phase transitions. */
export function ResponseExperience({
  text, phase = 'thinking', preset = 'clear', label, detail, paused = false,
  announce = false, tokens, style, className = '',
}: ResponseExperienceProps) {
  const host = useRef<HTMLDivElement>(null);
  const active = useMotionActivity(host, paused);
  const safePreset = Object.hasOwn(responsePresets, preset) ? preset : 'clear';
  const definition = responsePresets[safePreset];
  const status = phase === 'complete' ? 'success' : phase === 'error' ? 'error' : phase === 'idle' ? 'idle' : 'running';
  const streamPhase = phase === 'streaming' ? 'writing' : phase === 'complete' ? 'settled' : 'idle';
  return <div ref={host} className={`cm-response ${className}`} data-preset={safePreset}
    data-phase={phase} data-motion-paused={!active} style={{ ...motionTokens(tokens), ...style }}>
    <div className="cm-response-heading">
      <span className="cm-response-light" aria-hidden="true"/>
      <StatusPill className="cm-response-status" variant={definition.orb} colorMode={definition.colorMode}
        status={status} label={label ?? labels[phase]} paused={!active} announce={announce}/>
      {detail && <span className="cm-response-detail" key={detail}>{detail}</span>}
    </div>
    {text && <div className="cm-response-body" aria-busy={phase === 'streaming'}>
      <StreamingText text={text} phase={streamPhase} reveal={definition.reveal} cursor={definition.cursor} paused={!active}/>
    </div>}
    <span className="cm-response-finish" aria-hidden="true"/>
  </div>;
}
