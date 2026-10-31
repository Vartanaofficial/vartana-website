export type RadioPosition={x:number;y:number};
export type RadioViewport={width:number;height:number;left?:number;top?:number;bottomInset?:number};
// Keep the whole control reachable after dragging, rotating, or resizing a window.
export function clampRadioPosition(position:RadioPosition,size:{width:number;height:number},viewport:RadioViewport):RadioPosition{
 const left=(viewport.left||0)+8,top=(viewport.top||0)+8;
 const right=Math.max(left,(viewport.left||0)+viewport.width-size.width-8);
 const bottom=Math.max(top,(viewport.top||0)+viewport.height-size.height-8-(viewport.bottomInset||0));
 return {x:Math.max(left,Math.min(Number.isFinite(position.x)?position.x:left,right)),y:Math.max(top,Math.min(Number.isFinite(position.y)?position.y:top,bottom))};
}
export function isRadioDrag(dx:number,dy:number){return Math.hypot(dx,dy)>=6;}
