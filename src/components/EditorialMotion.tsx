"use client";
import {useEffect} from 'react';
/** One bounded GSAP image reframe, loaded only when the device can use it. */
export default function EditorialMotion({paused=false}: {paused?:boolean}) {
 useEffect(() => {
  let disposed=false,revision=0;let cleanup:(()=>void)|undefined;
  const target=document.querySelector<HTMLElement>('.of-hero__visual');
  const hero=document.querySelector<HTMLElement>('.of-hero');
  if(!target || !hero)return;
  const query=matchMedia('(min-width:1001px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  const setup=()=>{
   const version=++revision;cleanup?.();cleanup=undefined;delete target.dataset.journey;
   if(paused || !query.matches || document.documentElement.dataset.motion==='off')return;
   void Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([{gsap},{ScrollTrigger}])=>{
    if(disposed || version!==revision)return;gsap.registerPlugin(ScrollTrigger);
    const context=gsap.context(()=>{gsap.to(target,{'--editorial-progress':1,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true,invalidateOnRefresh:true,onUpdate:self=>{target.dataset.journey=self.progress.toFixed(3);}}});});
    cleanup=()=>context.revert();
   }).catch(()=>{target.style.removeProperty('--editorial-progress');});
  };
  const preference=new MutationObserver(setup);preference.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
  query.addEventListener('change',setup);setup();
  return()=>{disposed=true;revision++;preference.disconnect();query.removeEventListener('change',setup);cleanup?.();delete target.dataset.journey;};
 },[paused]);
 return null;
}
